import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PNG } from 'pngjs';

import {
  APPS,
  PROFILE,
  captureScene,
  comparePng,
  ensureDir,
  installApps,
  readScene,
  runColdBoot,
  sceneRegions,
  sha256,
  verifyFonts,
  verifyProfile,
} from './lib.mjs';
import { renderReport } from './report.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const args = process.argv.slice(2);

function arg(name, fallback) {
  const index = args.indexOf(`--${name}`);
  if (index !== -1 && args[index + 1]) {
    return args[index + 1];
  }
  const env = process.env[`M3E_${name.toUpperCase().replaceAll('-', '_')}`];
  return env ?? fallback;
}

const config = {
  boots: Number(arg('boots', PROFILE.coldBoots)),
  repeats: Number(arg('repeats', PROFILE.repeats)),
  sceneRepeats: Number(arg('scene-repeats', 2)),
  scenes: arg('scenes', 'solid,rect,text,shadow,trivial').split(','),
  skipBoot: arg('skip-boot', '0') === '1',
  label: arg('label', '') || undefined,
  outDir: path.resolve(ROOT, arg('out', 'docs/evidence/day3')),
};

function log(message) {
  process.stdout.write(`[${new Date().toISOString().slice(11, 19)}] ${message}\n`);
}

function storePng(dir, image) {
  const buffer = PNG.sync.write(image.png);
  const hash = sha256(buffer);
  const relative = path.posix.join(path.basename(dir), `${hash}.png`);
  const file = path.join(path.dirname(dir), relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, buffer);
  }
  return { path: relative, sha256: hash, width: image.width, height: image.height };
}

function shadowStats(image, scene) {
  const layer = scene.layers.find((item) => item.type === 'rect' && item.elevationDp > 0);
  if (!layer) {
    return null;
  }
  const expected = scene.background.match(/^#(..)(..)(..)$/);
  const background = expected.slice(1).map((part) => parseInt(part, 16));
  const scale = PROFILE.densityScale;
  const rect = {
    x: Math.round(layer.x * scale),
    y: Math.round(layer.y * scale),
    width: Math.round(layer.width * scale),
    height: Math.round(layer.height * scale),
  };
  const data = image.png.data;
  let outside = 0;
  let maxDeviation = 0;
  let min = 255;
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      if (x >= rect.x && x < rect.x + rect.width && y >= rect.y && y < rect.y + rect.height) {
        continue;
      }
      const offset = (y * image.width + x) * 4;
      const deviation = Math.max(
        Math.abs(data[offset] - background[0]),
        Math.abs(data[offset + 1] - background[1]),
        Math.abs(data[offset + 2] - background[2]),
      );
      if (deviation > 0) {
        outside += 1;
        if (deviation > maxDeviation) maxDeviation = deviation;
        if (deviation < min) min = deviation;
      }
    }
  }
  return { rect, outsidePixels: outside, maxDeviation, minDeviation: outside ? min : 0 };
}

async function captureRepeats(app, sceneId, count) {
  const runs = [];
  for (let index = 0; index < count; index += 1) {
    const capture = await captureScene(app, sceneId, {
      rerender: index > 0,
      timeoutMs: index === 0 ? 90_000 : 30_000,
      markerFallback: runs[0]?.marker ?? null,
    });
    const stored = storePng(path.join(config.outDir, 'captures'), capture.crop);
    runs.push({
      ...stored,
      marker: capture.marker,
      render: capture.render,
      textLayout: capture.textLayout,
      capturedAt: capture.capturedAt,
    });
    if (index === 0) {
      log(
        `${app.id} ${sceneId}: ${stored.width}x${stored.height} ${stored.sha256.slice(0, 12)} ${capture.marker.probe}`,
      );
    }
  }
  return runs;
}

function determinism(runs) {
  const base = runs[0];
  let maxExact = 0;
  let maxAa = 0;
  for (const run of runs.slice(1)) {
    const metrics = comparePng(
      {
        png: PNG.sync.read(fs.readFileSync(path.join(config.outDir, base.path))),
        width: base.width,
        height: base.height,
      },
      {
        png: PNG.sync.read(fs.readFileSync(path.join(config.outDir, run.path))),
        width: run.width,
        height: run.height,
      },
    );
    maxExact = Math.max(maxExact, metrics.exactDiffPixels);
    maxAa = Math.max(maxAa, metrics.aaAwareDiffPixels);
  }
  return { runs: runs.length, maxExact, maxAa, ok: maxExact === 0 };
}

const outDir = ensureDir(config.outDir);
fs.mkdirSync(path.join(outDir, 'captures'), { recursive: true });
fs.mkdirSync(path.join(outDir, 'diffs'), { recursive: true });

log(
  `plan: ${config.boots} cold boots, ${config.repeats} trivial repeats, ${config.sceneRepeats} repeats of ${config.scenes.join('/')} per app`,
);
const fonts = verifyFonts();
log(
  `fonts verified: ${Object.entries(fonts)
    .map(([name, font]) => `${name}=${font.sourceHash.slice(0, 12)}`)
    .join(' ')}`,
);

const results = {
  generatedAt: new Date().toISOString(),
  profile: PROFILE,
  config: {
    boots: config.boots,
    repeats: config.repeats,
    sceneRepeats: config.sceneRepeats,
    scenes: config.scenes,
    label: config.label,
    outDir: path.relative(ROOT, outDir),
  },
  fonts,
  boots: [],
  crossBoot: {},
  gate: {},
};

let firstBoot = null;

for (let bootIndex = 0; bootIndex < config.boots; bootIndex += 1) {
  log(`boot ${bootIndex + 1}/${config.boots}: starting`);
  if (!config.skipBoot) {
    runColdBoot();
  }
  installApps();
  const checks = verifyProfile();
  log(`boot ${bootIndex + 1}: profile verified (${checks.length} checks)`);

  const boot = {
    index: bootIndex,
    startedAt: new Date().toISOString(),
    checks,
    captures: { compose: {}, rn: {} },
    determinism: { compose: {}, rn: {} },
    crossStack: {},
    shadow: {},
  };

  for (const sceneId of config.scenes) {
    const scene = readScene(sceneId);
    const repeats = sceneId === 'trivial' ? config.repeats : config.sceneRepeats;
    for (const app of [APPS.compose, APPS.rn]) {
      const runs = await captureRepeats(app, sceneId, repeats);
      boot.captures[app.id][sceneId] = runs;
      boot.determinism[app.id][sceneId] = determinism(runs);
      if (scene.layers.some((layer) => layer.type === 'rect' && layer.elevationDp > 0)) {
        const first = runs[0];
        const image = {
          png: PNG.sync.read(fs.readFileSync(path.join(outDir, first.path))),
          width: first.width,
          height: first.height,
        };
        boot.shadow[app.id] = shadowStats(image, scene);
      }
      log(
        `${app.id} ${sceneId}: ${runs.length} runs, determinism max exact ${boot.determinism[app.id][sceneId].maxExact}, max AA ${boot.determinism[app.id][sceneId].maxAa}`,
      );
    }

    const compose = boot.captures.compose[sceneId][0];
    const rn = boot.captures.rn[sceneId][0];
    const diffName = `boot-${bootIndex + 1}-${sceneId}.png`;
    const metrics = comparePng(
      {
        png: PNG.sync.read(fs.readFileSync(path.join(outDir, compose.path))),
        width: compose.width,
        height: compose.height,
      },
      {
        png: PNG.sync.read(fs.readFileSync(path.join(outDir, rn.path))),
        width: rn.width,
        height: rn.height,
      },
      {
        regions: sceneRegions(scene),
        writeDiff: path.join(outDir, 'diffs', diffName),
      },
    );
    boot.crossStack[sceneId] = {
      ...metrics,
      diff: path.posix.join('diffs', diffName),
    };
    log(
      `${sceneId}: cross-stack exact ${metrics.exactDiffPixels} (${metrics.exactDiffPercent.toFixed(4)}%), AA-aware ${metrics.aaAwareDiffPixels} (${metrics.aaAwareDiffPercent.toFixed(4)}%), max delta ${metrics.maxChannelDelta}`,
    );
  }

  if (firstBoot) {
    for (const appId of ['compose', 'rn']) {
      for (const sceneId of config.scenes) {
        const a = firstBoot.captures[appId][sceneId][0];
        const b = boot.captures[appId][sceneId][0];
        const metrics = comparePng(
          {
            png: PNG.sync.read(fs.readFileSync(path.join(outDir, a.path))),
            width: a.width,
            height: a.height,
          },
          {
            png: PNG.sync.read(fs.readFileSync(path.join(outDir, b.path))),
            width: b.width,
            height: b.height,
          },
        );
        results.crossBoot[`${appId}:${sceneId}:${bootIndex}`] = metrics;
        log(
          `cross-boot ${appId} ${sceneId} boot 1 vs ${bootIndex + 1}: exact ${metrics.exactDiffPixels}, AA ${metrics.aaAwareDiffPixels}`,
        );
      }
    }
  } else {
    firstBoot = boot;
  }

  boot.finishedAt = new Date().toISOString();
  results.boots.push(boot);
}

const report = renderReport(results, outDir);
log(`report: ${path.relative(ROOT, report.htmlPath)}`);
log(
  `summary: exactZero=${report.exactZero} deterministic=${report.deterministic} aaGate=${report.aaGate}`,
);
if (!report.exactZero) {
  log('RESULT: cross-stack exact zero is NOT met — see report for measured pixels');
}
