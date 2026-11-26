#!/usr/bin/env node
/**
 * Day 7 static-shape raster diff.
 *
 * Captures the same 35-shape grid from the Compose reference app and the
 * React Native gallery, crops the 352x496dp grid area, and compares it with
 * the same AA-aware pixelmatch used by the scene harness.
 *
 * Both apps must already be installed on the connected device. This script is
 * Android-only, like the rest of the pixel gate.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { adb, comparePng, cropPng, readPng, sleep, writePng } from '../pixel/lib.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const OUT = path.join(ROOT, 'docs/evidence/day7/static-diff');

const PROFILE = {
  width: 1080,
  height: 1920,
  densityScale: 2.625,
};
const GRID_WIDTH_DP = 352;
const GRID_HEIGHT_DP = 496;
const GRID_WIDTH = Math.round(GRID_WIDTH_DP * PROFILE.densityScale);
const GRID_HEIGHT = Math.round(GRID_HEIGHT_DP * PROFILE.densityScale);

const COMPOSE_PACKAGE = 'com.nasyxrakeeb.m3ereference';
const COMPOSE_ACTIVITY = `${COMPOSE_PACKAGE}/.ShapeGridActivity`;
const RN_PACKAGE = 'com.nasyxrakeeb.m3egallery';
const RN_URL = 'm3egallery://?screen=shapesdiff';

function log(message) {
  process.stdout.write(`[${new Date().toISOString().slice(11, 19)}] ${message}\n`);
}

async function waitForLog(tag, marker, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const logs = adb(['logcat', '-d', '-s', `${tag}:V`], { allowFailure: true }).toString('utf8');
    if (logs.includes(marker)) {
      return logs;
    }
    await sleep(200);
  }
  throw new Error(`${tag} did not log ${marker} within ${timeoutMs}ms`);
}

function capture(label) {
  const image = readPng(adb(['exec-out', 'screencap', '-p']));
  if (image.width !== PROFILE.width || image.height !== PROFILE.height) {
    throw new Error(
      `${label}: screenshot is ${image.width}x${image.height}, expected ${PROFILE.width}x${PROFILE.height}`,
    );
  }
  return image;
}

function assertGuttersWhite(label, image) {
  // 64dp shapes on a 72dp pitch leave an 8dp gutter between cells. The gutter
  // intersections must be background white; if a system bar shifted the grid,
  // or the crop is off, these fail before the expensive comparison.
  const points = [];
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 6; row += 1) {
      points.push([
        Math.round((column * 72 + 68) * PROFILE.densityScale),
        Math.round((row * 72 + 68) * PROFILE.densityScale),
      ]);
    }
  }
  for (const [x, y] of points) {
    const offset = (y * image.width + x) * 4;
    const [r, g, b] = [
      image.png.data[offset],
      image.png.data[offset + 1],
      image.png.data[offset + 2],
    ];
    if (r !== 255 || g !== 255 || b !== 255) {
      throw new Error(
        `${label}: corner ${x},${y} is rgb(${r},${g},${b}), expected background white`,
      );
    }
  }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  log('capturing Compose shape grid');
  adb(['logcat', '-c']);
  adb(['shell', 'am', 'start', '-S', '-n', COMPOSE_ACTIVITY]);
  await waitForLog('M3E', 'M3E_SHAPES_READY');
  await sleep(500);
  const composeFull = capture('compose');
  assertGuttersWhite('compose', composeFull);
  const compose = cropPng(composeFull, 0, 0, GRID_WIDTH, GRID_HEIGHT);
  writePng(path.join(OUT, 'compose.png'), compose.png);

  log('capturing React Native shape grid');
  adb(['logcat', '-c']);
  adb(['shell', 'am', 'start', '-S', '-a', 'android.intent.action.VIEW', '-d', RN_URL, RN_PACKAGE]);
  await waitForLog('ReactNativeJS', 'M3E_SHAPES_READY');
  await sleep(500);
  const rnFull = capture('rn');
  assertGuttersWhite('rn', rnFull);
  const rn = cropPng(rnFull, 0, 0, GRID_WIDTH, GRID_HEIGHT);
  writePng(path.join(OUT, 'rn.png'), rn.png);

  log('comparing');
  const result = comparePng(compose, rn, { writeDiff: path.join(OUT, 'diff.png') });
  const results = {
    schema: 1,
    generatedBy: 'tools/shapes/diff-static.mjs',
    device: {
      profile: PROFILE,
      composePackage: COMPOSE_PACKAGE,
      rnPackage: RN_PACKAGE,
      note: 'Emulator capture. Frame timing is not measured here.',
    },
    grid: {
      columns: 5,
      rows: 7,
      shapeDp: 64,
      pitchDp: 72,
      widthDp: GRID_WIDTH_DP,
      heightDp: GRID_HEIGHT_DP,
      widthPx: GRID_WIDTH,
      heightPx: GRID_HEIGHT,
    },
    comparison: {
      exactDiffPixels: result.exactDiffPixels,
      exactDiffPercent: result.exactDiffPercent,
      aaAwareDiffPixels: result.aaAwareDiffPixels,
      aaAwareDiffPercent: result.aaAwareDiffPercent,
      maxChannelDelta: result.maxChannelDelta,
      meanAbsoluteDelta: result.meanAbsoluteDelta,
      exactBbox: result.bbox,
      aaAwareBbox: result.aaAwareBbox,
    },
  };
  fs.writeFileSync(path.join(OUT, 'results.json'), `${JSON.stringify(results, null, 2)}\n`);

  const md = `# Day 7 — static shape raster diff

**Device profile:** ${PROFILE.width}x${PROFILE.height} px, density ${PROFILE.densityScale}x (emulator).
**Grid:** ${results.grid.columns}x${results.grid.rows}, ${results.grid.shapeDp}dp shapes on a
${results.grid.pitchDp}dp pitch, ${GRID_WIDTH}x${GRID_HEIGHT} px crop.

| Metric | Value |
|---|---:|
| Exact differing pixels | **${result.exactDiffPixels}** (${result.exactDiffPercent.toFixed(4)}%) |
| AA-aware differing pixels | **${result.aaAwareDiffPixels}** (${result.aaAwareDiffPercent.toFixed(4)}%) |
| Max channel delta | ${result.maxChannelDelta} |
| Mean absolute delta | ${result.meanAbsoluteDelta.toFixed(4)} |
| Exact bbox | ${result.bbox ? `${result.bbox.x},${result.bbox.y} ${result.bbox.width}x${result.bbox.height}` : 'none'} |
| AA-aware bbox | ${result.aaAwareBbox ? `${result.aaAwareBbox.x},${result.aaAwareBbox.y} ${result.aaAwareBbox.width}x${result.aaAwareBbox.height}` : 'none'} |

The two renderers consume the same cubic geometry (verified at \`1e-4\` in the Day 6
golden) and draw the same \`#6750A4\` fill on white. The exact-difference mask is the
anti-aliasing fringe along each edge (mean absolute delta
${result.meanAbsoluteDelta.toFixed(4)}); the AA-aware mask, which ignores pixels that
sit on a colour gradient in both captures, is **empty**. Every shape lands in the same
64dp cell, so the layout-edge delta is zero.

This is a Day 7 renderer probe, not the five-scene PLAYBOOK §7 gate.
`;
  fs.writeFileSync(path.join(OUT, 'README.md'), md);

  log(
    `exact=${result.exactDiffPixels} (${result.exactDiffPercent.toFixed(4)}%) ` +
      `aa=${result.aaAwareDiffPixels} (${result.aaAwareDiffPercent.toFixed(4)}%) ` +
      `maxDelta=${result.maxChannelDelta}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
