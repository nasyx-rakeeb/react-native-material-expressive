/**
 * Derive the C2 diagnostic table from a faithful cross-stack run.
 *
 * C2 is a width-matching fit, not a typographic rule:
 *
 *   1. If RN's integer font size differs from the nearest integer, C1 first
 *      changes sizeSp so RN's `ceil(sizeSp * density * fontScale)` lands on
 *      that nearest integer.
 *   2. C2 then solves for the absolute letterSpacing that makes the measured
 *      RN advance width equal Compose's measured advance width for the sample:
 *
 *        spacingSp = tokenSpacingSp
 *                  + (composeWidthPx - rnWidthPxAtC1Size)
 *                    / ((glyphs - 1) * density * fontScale)
 *
 *      where `rnWidthPxAtC1Size` is the measured RN width scaled by the ratio
 *      of the C1 integer size to the token integer size.
 *
 * The fit is per role and per sample string. It is diagnostic evidence for
 * ADR-010, not a shipping token value.
 *
 * Usage:
 *   node tools/typography/derive-c2.mjs \
 *     --results docs/evidence/day5/typography/runs/faithful/results.json \
 *     --out docs/evidence/day5/typography/compensation/derived-c2.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));

function arg(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  if (index !== -1 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }
  return fallback;
}

const resultsPath = path.resolve(
  ROOT,
  arg('results', 'docs/evidence/day5/typography/runs/faithful/results.json'),
);
const outPath = path.resolve(
  ROOT,
  arg('out', 'docs/evidence/day5/typography/compensation/derived-c2.json'),
);
const committedPath = path.resolve(
  ROOT,
  arg('compare', 'docs/evidence/day5/typography/compensation.json'),
);
const gatePercent = Number(arg('gate-percent', '0.05'));

const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
const boot = results.boots[0];
const densityScale = Number(results.profile.densityScale);
const fontScale = Number(results.profile.fontScale ?? 1);
const scale = densityScale * fontScale;

function readScene(id) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/scenes', `${id}.json`), 'utf8'));
}

const roles = [];
for (const sceneId of results.config.scenes) {
  const scene = readScene(sceneId);
  const text = scene.layers.find((layer) => layer.type === 'text');
  if (!text) {
    continue;
  }
  const metrics = boot.crossStack[sceneId];
  if (metrics.aaAwareDiffPercent <= gatePercent) {
    continue;
  }
  const composeWidth = boot.captures.compose[sceneId][0].textLayout.width;
  const rnWidth = boot.captures.rn[sceneId][0].textLayout.width;
  const glyphs = Array.from(text.text).length;
  const gaps = glyphs - 1;

  const tokenPx = text.sizeSp * scale;
  const tokenInt = Math.ceil(tokenPx);
  const nearestInt = Math.round(tokenPx);
  let sizeSp = text.sizeSp;
  let rnWidthAtC1 = rnWidth;
  let c1 = null;
  if (tokenInt !== nearestInt) {
    sizeSp = (nearestInt - 0.001) / scale;
    rnWidthAtC1 = rnWidth * (nearestInt / tokenInt);
    c1 = { tokenInt, nearestInt, sizeSp: Number(sizeSp.toFixed(4)) };
  }

  const spacingSp = text.letterSpacingSp + (composeWidth - rnWidthAtC1) / (gaps * scale);
  roles.push({
    id: sceneId,
    text: text.text,
    glyphs,
    token: {
      sizeSp: text.sizeSp,
      letterSpacingSp: text.letterSpacingSp,
    },
    composeWidthPx: composeWidth,
    rnWidthPx: rnWidth,
    c1,
    derived: {
      ...(c1 ? { sizeSp: Number(sizeSp.toFixed(4)) } : {}),
      letterSpacingSp: Number(spacingSp.toFixed(4)),
    },
    baselineAaPixels: metrics.aaAwareDiffPixels,
    baselineAaPercent: metrics.aaAwareDiffPercent,
  });
}

const table = Object.fromEntries(roles.map((role) => [role.id, role.derived]));
const output = {
  generatedAt: new Date().toISOString(),
  source: path.relative(ROOT, resultsPath),
  profile: {
    density: results.profile.density,
    densityScale,
    fontScale,
  },
  formula:
    'letterSpacingSp = tokenLetterSpacingSp + (composeWidthPx - rnWidthPxAtC1Size) / ((glyphs - 1) * densityScale * fontScale)',
  gatePercent,
  roles,
  c2: table,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`);

let worst = 0;
let compared = 0;
if (fs.existsSync(committedPath)) {
  const committed = JSON.parse(fs.readFileSync(committedPath, 'utf8'));
  const committedC2 = committed.strategies?.c2 ?? {};
  for (const role of roles) {
    const expected = committedC2[role.id];
    if (!expected) {
      continue;
    }
    compared += 1;
    for (const key of ['sizeSp', 'letterSpacingSp']) {
      if (expected[key] === undefined) {
        continue;
      }
      const diff = Math.abs((role.derived[key] ?? NaN) - expected[key]);
      worst = Math.max(worst, diff);
    }
  }
}

console.log(
  `${roles.length} roles, density ${results.profile.density} (${densityScale}x), ` +
    `font scale ${fontScale}; wrote ${path.relative(ROOT, outPath)}`,
);
if (compared > 0) {
  console.log(
    `compared ${compared} roles to ${path.relative(ROOT, committedPath)}; worst diff ${worst}`,
  );
  if (worst > 0.001) {
    process.exitCode = 1;
  }
}
