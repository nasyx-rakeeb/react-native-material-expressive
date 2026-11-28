/**
 * Summarize text-metric profile runs produced by tools/pixel/run.mjs.
 *
 * Each run directory must contain results.json and its captures. The run
 * directory name is used as the label and is expected to start with the
 * strategy (`none-...` or `c2-...`) for the Day 5 matrix, or the profile
 * (`420-1.0`) for the Day 10 Compose-converter matrix.
 *
 * Reports four pass counts per run:
 *   - original:    AA-aware pixels <= 0.05% of the scene
 *   - faithful:    AA <= 450 per 1,000 ink AND <= 3.0 per glyph per font px
 *   - matched:     AA <= 15 per 1,000 ink AND <= 0.2 per glyph per font px
 *   - compensated: AA <= 250 per 1,000 ink AND <= 1.5 per glyph per font px
 *
 * It also reports threshold-independent evidence: max channel delta, mean
 * channel delta over differing pixels, deltas > 2 outside anti-aliased edges,
 * and flat fills > 2.
 *
 * Usage:
 *   node tools/typography/analyze-profile-matrix.mjs \
 *     --root docs/evidence/day10/typography/runs \
 *     --out docs/evidence/day10/typography/summary.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PNG } from 'pngjs';

import { composeFontScale } from './compose-font-scale.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));

function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  if (index !== -1 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }
  return fallback;
}

const runsRoot = path.resolve(
  ROOT,
  arg('root', 'docs/evidence/day5/typography/profile-matrix/runs'),
);
const outPath = path.resolve(
  ROOT,
  arg('out', 'docs/evidence/day5/typography/profile-matrix/summary.json'),
);

// ADR-010 proposed budgets, expressed per scene. The original 0.05% image gate
// is measured in scene pixels; the other three are ink/glyph-normalised so a
// large display role and a small label role are judged on the same edge area.
const THRESHOLDS = {
  faithful: { aaPer1000Ink: 450, aaPerGlyphPerFontPx: 3.0 },
  matched: { aaPer1000Ink: 15, aaPerGlyphPerFontPx: 0.2 },
  compensated: { aaPer1000Ink: 250, aaPerGlyphPerFontPx: 1.5 },
};

function passesNormalised(scene, threshold) {
  return (
    scene.aaPer1000Ink <= threshold.aaPer1000Ink &&
    scene.aaPerGlyphPerFontPx <= threshold.aaPerGlyphPerFontPx
  );
}

function readScene(id) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/scenes', `${id}.json`), 'utf8'));
}

function hexToRgb(hex) {
  const match = /^#(..)(..)(..)$/.exec(hex);
  if (!match) {
    throw new Error(`unsupported scene background ${hex}`);
  }
  return match.slice(1).map((part) => parseInt(part, 16));
}

function inkPixels(pngPath, background) {
  const png = PNG.sync.read(fs.readFileSync(pngPath));
  const [br, bg, bb] = hexToRgb(background);
  let ink = 0;
  for (let offset = 0; offset < png.data.length; offset += 4) {
    if (png.data[offset] !== br || png.data[offset + 1] !== bg || png.data[offset + 2] !== bb) {
      ink += 1;
    }
  }
  return ink;
}

function strategyOf(label) {
  if (label.startsWith('c2-')) return 'c2';
  if (label.startsWith('none-')) return 'none';
  if (label.startsWith('c1-')) return 'c1';
  if (label.startsWith('c3-')) return 'c3';
  if (label.startsWith('c4-')) return 'c4';
  return label;
}

const runDirs = fs
  .readdirSync(runsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => fs.existsSync(path.join(runsRoot, name, 'results.json')))
  .sort();

if (runDirs.length === 0) {
  throw new Error(`no results.json under ${runsRoot}`);
}

const runs = [];
for (const label of runDirs) {
  const dir = path.join(runsRoot, label);
  const results = JSON.parse(fs.readFileSync(path.join(dir, 'results.json'), 'utf8'));
  const boot = results.boots[0];
  const profile = results.profile;
  const scenes = [];

  for (const sceneId of results.config.scenes) {
    const metrics = boot.crossStack[sceneId];
    const scene = readScene(sceneId);
    const textLayer = scene.layers.find((layer) => layer.type === 'text');
    if (!textLayer) {
      continue;
    }
    const composeCapture = boot.captures.compose[sceneId][0];
    const ink = inkPixels(path.join(dir, composeCapture.path), scene.background);
    const glyphs = Array.from(textLayer.text).length;
    const effectiveSp = composeFontScale(textLayer.sizeSp, Number(profile.fontScale ?? 1));
    const fontPx = effectiveSp * profile.densityScale;
    const budget = metrics.width * metrics.height * 0.0005;
    const entry = {
      id: sceneId,
      text: textLayer.text,
      glyphs,
      sizeSp: textLayer.sizeSp,
      effectiveSp,
      fontPx,
      ink,
      width: metrics.width,
      height: metrics.height,
      aaPixels: metrics.aaAwareDiffPixels,
      aaPercent: metrics.aaAwareDiffPercent,
      exactPixels: metrics.exactDiffPixels,
      maxChannelDelta: metrics.maxChannelDelta,
      meanChannelDeltaOverDiffPixels: metrics.meanChannelDeltaOverDiffPixels ?? 0,
      highDeltaOutsideAaPixels: metrics.highDeltaOutsideAaPixels ?? 0,
      flatFillHighDeltaPixels: metrics.flatFillHighDeltaPixels ?? 0,
      budget,
      passesImageGate: metrics.aaAwareDiffPixels <= budget,
      overBudgetPixels: Math.max(0, metrics.aaAwareDiffPixels - budget),
      overBudgetRatio: metrics.aaAwareDiffPixels / budget,
      aaPer1000Ink: (metrics.aaAwareDiffPixels / ink) * 1000,
      aaPerGlyph: metrics.aaAwareDiffPixels / glyphs,
      aaPerGlyphPerFontPx: metrics.aaAwareDiffPixels / glyphs / fontPx,
    };
    entry.passesFaithful = passesNormalised(entry, THRESHOLDS.faithful);
    entry.passesMatched = passesNormalised(entry, THRESHOLDS.matched);
    entry.passesCompensated = passesNormalised(entry, THRESHOLDS.compensated);
    scenes.push(entry);
  }

  const failing = scenes.filter((scene) => !scene.passesImageGate);
  const worstAaPercent = scenes.reduce((worst, scene) =>
    scene.aaPercent > worst.aaPercent ? scene : worst,
  );
  const worstAaPer1000Ink = scenes.reduce((worst, scene) =>
    scene.aaPer1000Ink > worst.aaPer1000Ink ? scene : worst,
  );
  const worstAaPerGlyph = scenes.reduce((worst, scene) =>
    scene.aaPerGlyph > worst.aaPerGlyph ? scene : worst,
  );
  const worstAaPerGlyphPerFontPx = scenes.reduce((worst, scene) =>
    scene.aaPerGlyphPerFontPx > worst.aaPerGlyphPerFontPx ? scene : worst,
  );
  const worstMaxChannelDelta = scenes.reduce((worst, scene) =>
    scene.maxChannelDelta > worst.maxChannelDelta ? scene : worst,
  );
  const worstMeanChannelDelta = scenes.reduce((worst, scene) =>
    scene.meanChannelDeltaOverDiffPixels > worst.meanChannelDeltaOverDiffPixels ? scene : worst,
  );
  const failingIds = (predicate) =>
    scenes.filter((scene) => !predicate(scene)).map((scene) => scene.id);
  runs.push({
    label,
    strategy: strategyOf(label),
    profile: {
      density: profile.density,
      densityScale: profile.densityScale,
      fontScale: profile.fontScale,
      width: profile.width,
      height: profile.height,
    },
    scenes,
    summary: {
      scenes: scenes.length,
      totalAaPixels: scenes.reduce((sum, scene) => sum + scene.aaPixels, 0),
      failingScenes: failing.length,
      failingIds: failing.map((scene) => scene.id),
      worstAaPercent: worstAaPercent.aaPercent,
      worstAaPercentId: worstAaPercent.id,
      worstAaPer1000Ink: worstAaPer1000Ink.aaPer1000Ink,
      worstAaPer1000InkId: worstAaPer1000Ink.id,
      worstAaPerGlyph: worstAaPerGlyph.aaPerGlyph,
      worstAaPerGlyphId: worstAaPerGlyph.id,
      worstAaPerGlyphPerFontPx: worstAaPerGlyphPerFontPx.aaPerGlyphPerFontPx,
      worstAaPerGlyphPerFontPxId: worstAaPerGlyphPerFontPx.id,
      passesOriginalScenes: scenes.length - failing.length,
      passesFaithfulScenes: scenes.length - failingIds((scene) => scene.passesFaithful).length,
      passesMatchedScenes: scenes.length - failingIds((scene) => scene.passesMatched).length,
      passesCompensatedScenes:
        scenes.length - failingIds((scene) => scene.passesCompensated).length,
      failsFaithfulIds: failingIds((scene) => scene.passesFaithful),
      failsMatchedIds: failingIds((scene) => scene.passesMatched),
      failsCompensatedIds: failingIds((scene) => scene.passesCompensated),
      worstMaxChannelDelta: worstMaxChannelDelta.maxChannelDelta,
      worstMaxChannelDeltaId: worstMaxChannelDelta.id,
      worstMeanChannelDelta: worstMeanChannelDelta.meanChannelDeltaOverDiffPixels,
      worstMeanChannelDeltaId: worstMeanChannelDelta.id,
      totalHighDeltaOutsideAaPixels: scenes.reduce(
        (sum, scene) => sum + scene.highDeltaOutsideAaPixels,
        0,
      ),
      totalFlatFillHighDeltaPixels: scenes.reduce(
        (sum, scene) => sum + scene.flatFillHighDeltaPixels,
        0,
      ),
    },
  });
}

const byProfile = new Map();
for (const run of runs) {
  const key = `${run.profile.density}/${run.profile.fontScale}`;
  if (!byProfile.has(key)) {
    byProfile.set(key, []);
  }
  byProfile.get(key).push(run);
}

const comparisons = [];
for (const [profileKey, profileRuns] of byProfile) {
  const baseline = profileRuns.find((run) => run.strategy === 'none');
  const c2 = profileRuns.find((run) => run.strategy === 'c2');
  if (!baseline || !c2) {
    continue;
  }
  const baselineById = new Map(baseline.scenes.map((scene) => [scene.id, scene]));
  comparisons.push({
    profile: profileKey,
    scenes: c2.scenes.map((scene) => {
      const before = baselineById.get(scene.id);
      return {
        id: scene.id,
        aaBefore: before.aaPixels,
        aaAfter: scene.aaPixels,
        delta: scene.aaPixels - before.aaPixels,
        reduction: before.aaPixels === 0 ? 0 : 1 - scene.aaPixels / before.aaPixels,
        passesBefore: before.passesImageGate,
        passesAfter: scene.passesImageGate,
      };
    }),
  });
}

const output = {
  generatedAt: new Date().toISOString(),
  runsRoot: path.relative(ROOT, runsRoot),
  runs,
  comparisons,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`);

const markdownPath = path.resolve(
  ROOT,
  arg('markdown', path.join(path.dirname(outPath), 'summary.md')),
);
const profileSort = (a, b) =>
  b.profile.density - a.profile.density ||
  Number(a.profile.fontScale) - Number(b.profile.fontScale) ||
  (a.strategy === 'none' ? -1 : 1);
const sortedRuns = [...runs].sort(profileSort);

function f(value, digits = 1) {
  return Number(value).toFixed(digits);
}

const markdown = [];
markdown.push('# Text profile matrix', '');
markdown.push(
  'Generated by `tools/typography/analyze-profile-matrix.mjs`. AA pixels are AA-aware ' +
    'differences; ink is the Compose non-background pixel count for the 8-glyph sample.',
  '',
);
markdown.push('## Runs', '');
markdown.push(
  '| Profile | Strategy | Scenes | Total AA px | 0.05% pass | Faithful pass | Matched pass | ' +
    'Compensated pass | Worst AA % | Worst AA/1,000 ink | Worst AA/glyph/font px |',
);
markdown.push('|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|');
for (const run of sortedRuns) {
  const { summary, profile } = run;
  const pass = (count) => `${count}/${summary.scenes}`;
  markdown.push(
    `| ${profile.density}dpi/${profile.fontScale} | ${run.strategy} | ${summary.scenes} | ` +
      `${summary.totalAaPixels} | ${pass(summary.passesOriginalScenes)} | ` +
      `${pass(summary.passesFaithfulScenes)} | ${pass(summary.passesMatchedScenes)} | ` +
      `${pass(summary.passesCompensatedScenes)} | ${f(summary.worstAaPercent, 4)}% | ` +
      `${f(summary.worstAaPer1000Ink)} | ${f(summary.worstAaPerGlyphPerFontPx, 2)} |`,
  );
}
markdown.push('');

markdown.push('## Threshold-independent metrics', '');
markdown.push(
  '| Profile | Strategy | Max Δ | Role | Mean Δ over differing | Role | Δ>2 outside AA | Flat fills >2 |',
);
markdown.push('|---|---|---:|---|---:|---|---:|---:|');
for (const run of sortedRuns) {
  const { summary, profile } = run;
  markdown.push(
    `| ${profile.density}dpi/${profile.fontScale} | ${run.strategy} | ` +
      `${summary.worstMaxChannelDelta} | ${summary.worstMaxChannelDeltaId} | ` +
      `${f(summary.worstMeanChannelDelta, 2)} | ${summary.worstMeanChannelDeltaId} | ` +
      `${summary.totalHighDeltaOutsideAaPixels} | ${summary.totalFlatFillHighDeltaPixels} |`,
  );
}
markdown.push('');

markdown.push('## Roles failing the faithful budget', '');
markdown.push(
  `Faithful = AA <= ${THRESHOLDS.faithful.aaPer1000Ink} per 1,000 ink **and** <= ` +
    `${THRESHOLDS.faithful.aaPerGlyphPerFontPx} per glyph per font px.`,
);
markdown.push('');
markdown.push('| Profile | Strategy | Role | AA/1,000 ink | AA/glyph/font px | AA px | Ink px |');
markdown.push('|---|---|---|---:|---:|---:|---:|');
const faithfulFailures = sortedRuns.flatMap((run) =>
  run.scenes.filter((scene) => !scene.passesFaithful).map((scene) => ({ run, scene })),
);
for (const { run, scene } of faithfulFailures) {
  markdown.push(
    `| ${run.profile.density}dpi/${run.profile.fontScale} | ${run.strategy} | ${scene.id} | ` +
      `${f(scene.aaPer1000Ink)} | ${f(scene.aaPerGlyphPerFontPx, 2)} | ` +
      `${scene.aaPixels} | ${scene.ink} |`,
  );
}
if (faithfulFailures.length === 0) {
  markdown.push('| — | — | none | — | — | — | — |');
}
markdown.push('');

if (comparisons.length > 0) {
  markdown.push('## C2 versus token-exact', '');
  markdown.push(
    '| Profile | Improved | Regressed | Net AA px | C2 failures | Token-exact failures |',
  );
  markdown.push('|---|---:|---:|---:|---:|---:|');
  for (const comparison of comparisons) {
    const improved = comparison.scenes.filter((scene) => scene.delta < 0).length;
    const regressed = comparison.scenes.filter((scene) => scene.delta > 0).length;
    const net = comparison.scenes.reduce((sum, scene) => sum + scene.delta, 0);
    const c2Run = runs.find(
      (run) =>
        `${run.profile.density}/${run.profile.fontScale}` === comparison.profile &&
        run.strategy === 'c2',
    );
    const noneRun = runs.find(
      (run) =>
        `${run.profile.density}/${run.profile.fontScale}` === comparison.profile &&
        run.strategy === 'none',
    );
    markdown.push(
      `| ${comparison.profile} | ${improved} | ${regressed} | ${net} | ` +
        `${c2Run?.summary.failingScenes ?? '—'} | ${noneRun?.summary.failingScenes ?? '—'} |`,
    );
  }
  markdown.push('');

  markdown.push('## Roles failing the original 0.05% image gate under C2', '');
  markdown.push('| Profile | Role | AA px | AA % | Budget px | Over px | Ratio |');
  markdown.push('|---|---|---:|---:|---:|---:|---:|');
  const c2Failures = sortedRuns
    .filter((run) => run.strategy === 'c2')
    .flatMap((run) =>
      run.scenes.filter((scene) => !scene.passesImageGate).map((scene) => ({ run, scene })),
    )
    .sort(
      (a, b) =>
        b.run.profile.density - a.run.profile.density ||
        Number(b.run.profile.fontScale) - Number(a.run.profile.fontScale) ||
        b.scene.overBudgetRatio - a.scene.overBudgetRatio,
    );
  for (const { run, scene } of c2Failures) {
    markdown.push(
      `| ${run.profile.density}dpi/${run.profile.fontScale} | ${scene.id} | ${scene.aaPixels} | ` +
        `${f(scene.aaPercent, 4)}% | ${f(scene.budget)} | ${f(scene.overBudgetPixels)} | ` +
        `${f(scene.overBudgetRatio, 2)}× |`,
    );
  }
  markdown.push('');
}

markdown.push('## Maxima (threshold calibration)', '');
markdown.push(
  '| Profile | Strategy | Max AA/1,000 ink | Role | Max AA/glyph | Role | Max AA/glyph/font px | Role |',
);
markdown.push('|---|---|---:|---|---:|---|---:|---|');
for (const run of sortedRuns) {
  const { summary, profile } = run;
  markdown.push(
    `| ${profile.density}dpi/${profile.fontScale} | ${run.strategy} | ` +
      `${f(summary.worstAaPer1000Ink)} | ${summary.worstAaPer1000InkId} | ` +
      `${f(summary.worstAaPerGlyph)} | ${summary.worstAaPerGlyphId} | ` +
      `${f(summary.worstAaPerGlyphPerFontPx, 2)} | ${summary.worstAaPerGlyphPerFontPxId} |`,
  );
}
markdown.push('');

fs.writeFileSync(markdownPath, `${markdown.join('\n')}\n`);

for (const run of runs) {
  const { summary, profile } = run;
  console.log(
    `${run.label}: ${profile.density}dpi/${profile.fontScale} ` +
      `${summary.totalAaPixels} AA px, 0.05% ${summary.passesOriginalScenes}/${summary.scenes}, ` +
      `faithful ${summary.passesFaithfulScenes}/${summary.scenes}, ` +
      `matched ${summary.passesMatchedScenes}/${summary.scenes}, ` +
      `compensated ${summary.passesCompensatedScenes}/${summary.scenes}, ` +
      `worst ${summary.worstAaPercent.toFixed(4)}%, max Δ ${summary.worstMaxChannelDelta}`,
  );
}
for (const comparison of comparisons) {
  const regressions = comparison.scenes.filter((scene) => scene.delta > 0);
  const improvements = comparison.scenes.filter((scene) => scene.delta < 0);
  console.log(
    `compare ${comparison.profile}: C2 improves ${improvements.length}, regresses ${regressions.length}, ` +
      `net ${comparison.scenes.reduce((sum, scene) => sum + scene.delta, 0)} AA px`,
  );
}
console.log(`wrote ${path.relative(ROOT, outPath)}`);
