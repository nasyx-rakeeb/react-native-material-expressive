import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export const ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
export const PROFILE = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'tools/pixel/profile.json'), 'utf8'),
);
export const SCENES_DIR = path.join(ROOT, 'tools/scenes');

export const APPS = {
  compose: {
    id: 'compose',
    package: 'com.nasyxrakeeb.m3ereference',
    apk: path.join(ROOT, 'apps/reference-compose/app/build/outputs/apk/debug/app-debug.apk'),
  },
  rn: {
    id: 'rn',
    package: 'com.nasyxrakeeb.m3egallery',
    apk: path.join(ROOT, 'apps/gallery/android/app/build/outputs/apk/release/app-release.apk'),
  },
};

export const BAND = {
  x: Math.round(160 * PROFILE.densityScale),
  y: Math.round(232 * PROFILE.densityScale),
  widthDp: 320,
  heightDp: 24,
};

export function adb(args, { timeout = 120_000, allowFailure = false } = {}) {
  const result = spawnSync('adb', args, {
    maxBuffer: 64 * 1024 * 1024,
    timeout,
  });
  if (result.error) {
    throw new Error(`adb ${args.join(' ')} failed: ${result.error.message}`);
  }
  if (result.status !== 0 && !allowFailure) {
    throw new Error(
      `adb ${args.join(' ')} exited ${result.status}: ${result.stderr?.toString() ?? ''}`,
    );
  }
  return result.stdout ?? Buffer.alloc(0);
}

export function adbText(args, options) {
  return adb(args, options).toString('utf8').trim();
}

export function shellText(args) {
  return adbText(['shell', ...args]);
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

export function readPng(bufferOrPath) {
  const buffer = Buffer.isBuffer(bufferOrPath) ? bufferOrPath : fs.readFileSync(bufferOrPath);
  const png = PNG.sync.read(buffer);
  return { png, width: png.width, height: png.height };
}

export function writePng(file, png) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, PNG.sync.write(png));
}

export function cropPng(image, x, y, width, height) {
  if (x < 0 || y < 0 || x + width > image.width || y + height > image.height) {
    throw new Error(`crop ${x},${y},${width}x${height} outside ${image.width}x${image.height}`);
  }
  const out = new PNG({ width, height });
  PNG.bitblt(image.png, out, x, y, width, height, 0, 0);
  return { png: out, width, height };
}

export function pixelAt(image, x, y) {
  const index = (y * image.width + x) * 4;
  return [
    image.png.data[index],
    image.png.data[index + 1],
    image.png.data[index + 2],
    image.png.data[index + 3],
  ];
}

export function readScene(id) {
  const file = path.join(SCENES_DIR, `${id}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function scenePixels(scene) {
  return {
    width: Math.round(scene.widthDp * PROFILE.densityScale),
    height: Math.round(scene.heightDp * PROFILE.densityScale),
  };
}

function scale(value) {
  return Math.round(value * PROFILE.densityScale);
}

export function sceneRegions(scene) {
  const { width, height } = scenePixels(scene);
  const regions = [];
  for (const [index, layer] of scene.layers.entries()) {
    if (layer.type === 'text') {
      regions.push({
        name: `text-${index}`,
        x: scale(layer.x),
        y: scale(layer.y),
        width: Math.max(1, width - scale(layer.x)),
        height: Math.max(1, height - scale(layer.y)),
      });
    }
    if (layer.type === 'rect' && layer.elevationDp > 0) {
      const margin = scale(layer.elevationDp * 3);
      const x = Math.max(0, scale(layer.x) - margin);
      const y = Math.max(0, scale(layer.y) - margin);
      const right = Math.min(width, scale(layer.x + layer.width) + margin);
      const bottom = Math.min(height, scale(layer.y + layer.height) + margin);
      regions.push({
        name: `shadow-${index}`,
        x,
        y,
        width: Math.max(1, right - x),
        height: Math.max(1, bottom - y),
      });
    }
  }
  return regions;
}

function countInRegion(mask, width, region) {
  let count = 0;
  for (let y = region.y; y < region.y + region.height; y += 1) {
    for (let x = region.x; x < region.x + region.width; x += 1) {
      if (mask[y * width + x]) {
        count += 1;
      }
    }
  }
  return count;
}

export function comparePng(a, b, { regions = [], writeDiff } = {}) {
  if (a.width !== b.width || a.height !== b.height) {
    throw new Error(`size mismatch: ${a.width}x${a.height} vs ${b.width}x${b.height}`);
  }
  const width = a.width;
  const height = a.height;
  const pixels = width * height;
  const mask = new Uint8Array(pixels);
  let exact = 0;
  let maxDelta = 0;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let totalDelta = 0;

  for (let index = 0; index < pixels; index += 1) {
    const offset = index * 4;
    const dr = Math.abs(a.png.data[offset] - b.png.data[offset]);
    const dg = Math.abs(a.png.data[offset + 1] - b.png.data[offset + 1]);
    const db = Math.abs(a.png.data[offset + 2] - b.png.data[offset + 2]);
    const delta = Math.max(dr, dg, db);
    totalDelta += dr + dg + db;
    if (delta > 0) {
      mask[index] = 1;
      exact += 1;
      if (delta > maxDelta) {
        maxDelta = delta;
      }
      const x = index % width;
      const y = Math.floor(index / width);
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  const diff = new PNG({ width, height });
  const aaAware = pixelmatch(a.png.data, b.png.data, diff.data, width, height, {
    threshold: 0.1,
    includeAA: false,
    alpha: 0.1,
    diffColor: [255, 0, 0],
    aaColor: [255, 255, 0],
  });

  const regionCounts = {};
  for (const region of regions) {
    regionCounts[region.name] = countInRegion(mask, width, region);
  }

  const aaAwareCoordinates = [];
  let aaMinX = width;
  let aaMinY = height;
  let aaMaxX = -1;
  let aaMaxY = -1;
  for (let index = 0; index < pixels; index += 1) {
    const offset = index * 4;
    if (diff.data[offset] === 255 && diff.data[offset + 1] === 0 && diff.data[offset + 2] === 0) {
      const x = index % width;
      const y = Math.floor(index / width);
      if (aaAwareCoordinates.length < 20) {
        aaAwareCoordinates.push({ x, y });
      }
      if (x < aaMinX) aaMinX = x;
      if (y < aaMinY) aaMinY = y;
      if (x > aaMaxX) aaMaxX = x;
      if (y > aaMaxY) aaMaxY = y;
    }
  }

  if (writeDiff) {
    writePng(writeDiff, diff);
  }

  return {
    width,
    height,
    pixels,
    exactDiffPixels: exact,
    exactDiffPercent: (exact / pixels) * 100,
    aaAwareDiffPixels: aaAware,
    aaAwareDiffPercent: (aaAware / pixels) * 100,
    maxChannelDelta: maxDelta,
    meanAbsoluteDelta: totalDelta / (pixels * 3),
    bbox:
      exact === 0 ? null : { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 },
    aaAwareBbox:
      aaAware === 0
        ? null
        : { x: aaMinX, y: aaMinY, width: aaMaxX - aaMinX + 1, height: aaMaxY - aaMinY + 1 },
    aaAwareCoordinates,
    regionCounts,
  };
}

export function bandColor(image) {
  return pixelAt(image, BAND.x, BAND.y);
}

export function isGreen(color) {
  return color[0] === 0 && color[1] === 255 && color[2] === 0;
}

export function isOrange(color) {
  return color[0] === 255 && color[1] === 136 && color[2] === 0;
}

export function isRed(color) {
  return color[0] === 255 && color[1] === 0 && color[2] === 0;
}

export function verifyProfile() {
  const checks = [];
  const add = (name, expected, actual) => {
    checks.push({ name, expected, actual, ok: String(expected) === String(actual) });
  };

  add('avd', PROFILE.avd, shellText(['getprop', 'ro.boot.qemu.avd_name']));
  add('api', PROFILE.api, Number(shellText(['getprop', 'ro.build.version.sdk'])));
  add('locale', PROFILE.locale, shellText(['getprop', 'ro.product.locale']));
  add('fontScale', PROFILE.fontScale, shellText(['settings', 'get', 'system', 'font_scale']));
  add(
    'animatorDurationScale',
    String(PROFILE.animations),
    shellText(['settings', 'get', 'global', 'animator_duration_scale']),
  );
  add(
    'transitionAnimationScale',
    String(PROFILE.animations),
    shellText(['settings', 'get', 'global', 'transition_animation_scale']),
  );
  add(
    'windowAnimationScale',
    String(PROFILE.animations),
    shellText(['settings', 'get', 'global', 'window_animation_scale']),
  );
  add('userRotation', '0', shellText(['settings', 'get', 'system', 'user_rotation']));
  add(
    'immersiveConfirmation',
    'confirmed',
    shellText(['settings', 'get', 'secure', 'immersive_mode_confirmations']),
  );
  add('nightMode', 'Night mode: no', shellText(['cmd', 'uimode', 'night']));

  const wmSize = shellText(['wm', 'size']);
  const wmDensity = shellText(['wm', 'density']);
  add('wmSize', `Physical size: ${PROFILE.width}x${PROFILE.height}`, wmSize);
  add('wmDensity', `Physical density: ${PROFILE.density}`, wmDensity);

  const surfaceFlinger = shellText(['dumpsys', 'SurfaceFlinger']);
  const gpuLine =
    surfaceFlinger.split(/\r?\n/).find((line) => line.startsWith('GLES:')) ?? '(no GLES line)';
  checks.push({
    name: 'gpu',
    expected: PROFILE.gpuDriverIncludes,
    actual: gpuLine,
    ok: gpuLine.includes(PROFILE.gpuDriverIncludes),
  });

  const failed = checks.filter((check) => !check.ok);
  if (failed.length > 0) {
    const detail = failed
      .map((check) => `${check.name}: expected ${check.expected}, got ${check.actual}`)
      .join('\n');
    throw new Error(`emulator profile drift:\n${detail}`);
  }
  return checks;
}

export function verifyFonts() {
  const source = path.join(ROOT, 'apps/reference-compose/app/src/main/assets/fonts/RobotoFlex.ttf');
  const gallery = path.join(ROOT, 'apps/gallery/assets/fonts/RobotoFlex.ttf');
  const sourceHash = sha256(fs.readFileSync(source));
  const galleryHash = sha256(fs.readFileSync(gallery));
  if (sourceHash !== galleryHash) {
    throw new Error(`source font mismatch: ${sourceHash} vs ${galleryHash}`);
  }
  const apks = {};
  for (const app of Object.values(APPS)) {
    if (!fs.existsSync(app.apk)) {
      throw new Error(`missing APK: ${app.apk}`);
    }
    const result = spawnSync('unzip', ['-p', app.apk, 'assets/fonts/RobotoFlex.ttf'], {
      maxBuffer: 16 * 1024 * 1024,
    });
    if (result.status !== 0 || result.stdout.length === 0) {
      throw new Error(`APK ${app.apk} does not contain assets/fonts/RobotoFlex.ttf`);
    }
    const hash = sha256(result.stdout);
    apks[app.id] = hash;
    if (hash !== sourceHash) {
      throw new Error(`APK font mismatch for ${app.id}: ${hash} != ${sourceHash}`);
    }
  }
  return { sourceHash, galleryHash, apks };
}

export function installApps() {
  for (const app of Object.values(APPS)) {
    const result = spawnSync('adb', ['install', '-r', app.apk], {
      maxBuffer: 16 * 1024 * 1024,
    });
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
    if (result.status !== 0 || !output.includes('Success')) {
      throw new Error(`install failed for ${app.id}:\n${output}`);
    }
  }
}

export function forceStop(app) {
  adb(['shell', 'am', 'force-stop', app.package]);
}

export function launch(app, sceneId) {
  if (app.id === 'compose') {
    return adb([
      'shell',
      'am',
      'start',
      '-W',
      '-n',
      `${app.package}/.MainActivity`,
      '--es',
      'scene',
      sceneId,
    ]).toString('utf8');
  }
  return adb([
    'shell',
    'am',
    'start',
    '-W',
    '-a',
    'android.intent.action.VIEW',
    '-d',
    `m3egallery://scene?name=${sceneId}`,
    app.package,
  ]).toString('utf8');
}

export function logcat() {
  return adb(['logcat', '-d']).toString('utf8');
}

export function textLayoutMarker(app, sceneId, logs) {
  const pattern =
    app.id === 'compose'
      ? /M3E_TEXT_LAYOUT text=(.*?) width=(\d+) height=(\d+) lines=(\d+)/g
      : /\[M3E\] scene_text_layout text=(".*?") width=([0-9.]+) height=([0-9.]+) lines=(\d+)/g;
  let last = null;
  for (const match of logs.matchAll(pattern)) {
    last = {
      text: match[1],
      width: Number(match[2]) * (app.id === 'rn' ? PROFILE.densityScale : 1),
      height: Number(match[3]) * (app.id === 'rn' ? PROFILE.densityScale : 1),
      lines: Number(match[4]),
      scene: sceneId,
    };
  }
  return last;
}

export function fontMarker(app, logs, fallback = null) {
  if (app.id === 'compose') {
    const probe = /M3E_FONT_PROBE .*ok=(true|false)/.exec(logs);
    const hash = /M3E_FONT_HASH fonts\/RobotoFlex\.ttf ([0-9a-f]{64})/.exec(logs);
    if (!probe || !hash) {
      if (fallback) {
        return fallback;
      }
      throw new Error('Compose font probe/hash marker missing from logcat');
    }
    if (probe[1] !== 'true') {
      throw new Error('Compose font probe failed: wdth axis not applied');
    }
    if (fallback && fallback.sha256 !== hash[1]) {
      throw new Error(`Compose font hash changed mid-session: ${fallback.sha256} -> ${hash[1]}`);
    }
    return { ok: true, sha256: hash[1], probe: probe[0] };
  }
  const probe = /\[M3E\] font_probe narrow=([0-9.]+) wide=([0-9.]+) ok=(true|false)/.exec(logs);
  if (!probe) {
    if (fallback) {
      return fallback;
    }
    throw new Error('RN font probe marker missing from logcat');
  }
  if (probe[3] !== 'true') {
    throw new Error('RN font probe failed: wdth axis not applied');
  }
  return { ok: true, narrow: Number(probe[1]), wide: Number(probe[2]), probe: probe[0] };
}

function verifySceneFrame(app, scene, full) {
  const { width, height } = scenePixels(scene);
  if (full.width !== PROFILE.width || full.height !== PROFILE.height) {
    throw new Error(
      `unexpected screenshot size ${full.width}x${full.height}, expected ${PROFILE.width}x${PROFILE.height}`,
    );
  }
  const expected = scene.background.match(/^#(..)(..)(..)$/);
  if (!expected) {
    throw new Error(`invalid scene background ${scene.background}`);
  }
  const background = expected.slice(1).map((part) => parseInt(part, 16));
  for (const [label, x, y] of [
    ['top-left', 0, 0],
    ['top-right', width - 1, 0],
    ['bottom-left', 0, height - 1],
    ['bottom-right', width - 1, height - 1],
  ]) {
    const pixel = pixelAt(full, x, y);
    if (pixel[0] !== background[0] || pixel[1] !== background[1] || pixel[2] !== background[2]) {
      throw new Error(
        `${app.id} ${scene.id}: ${label} pixel ${pixel.slice(0, 3)} != background ${background} — window not at 0,0 or scene clipped`,
      );
    }
  }
  return cropPng(full, 0, 0, width, height);
}

async function waitForGreen(app, sceneId, { timeoutMs, requireTransition = false }) {
  const deadline = Date.now() + timeoutMs;
  let lastColor = null;
  let sawNonGreen = !requireTransition;
  while (Date.now() < deadline) {
    const full = readPng(adb(['exec-out', 'screencap', '-p']));
    const color = bandColor(full);
    lastColor = color;
    if (isOrange(color)) {
      throw new Error(`${app.id} reported font fallback (orange band) for ${sceneId}`);
    }
    if (!isGreen(color)) {
      sawNonGreen = true;
    } else if (sawNonGreen) {
      return full;
    }
    await sleep(100);
  }
  throw new Error(
    `${app.id} ${sceneId}: scene not ready within ${timeoutMs}ms (band ${lastColor}, sawNonGreen=${sawNonGreen})`,
  );
}

export function triggerRerender(app) {
  if (app.id === 'compose') {
    adb(['shell', 'am', 'broadcast', '-a', 'com.nasyxrakeeb.m3ereference.RERENDER']);
    return;
  }
  const x = Math.round(160 * PROFILE.densityScale);
  const y = Math.round(282 * PROFILE.densityScale);
  adb(['shell', 'input', 'tap', String(x), String(y)]);
}

export function renderMarker(app, sceneId, logs) {
  const pattern =
    app.id === 'compose'
      ? /M3E_READY scene=(\S+) render=(\d+)/g
      : /\[M3E\] scene_ready scene=(\S+) render=(\d+)/g;
  let last = null;
  for (const match of logs.matchAll(pattern)) {
    if (match[1] === sceneId) {
      last = { scene: match[1], render: Number(match[2]) };
    }
  }
  return last;
}

async function waitForRender(app, sceneId, previous, { timeoutMs = 10_000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const marker = renderMarker(app, sceneId, logcat());
    if (marker && (!previous || marker.render > previous.render)) {
      return marker;
    }
    await sleep(100);
  }
  throw new Error(
    `${app.id} ${sceneId}: no new render marker within ${timeoutMs}ms (previous ${previous?.render ?? 'none'})`,
  );
}

export async function captureScene(
  app,
  sceneId,
  { timeoutMs = 30_000, rerender = false, requireTransition = false, markerFallback = null } = {},
) {
  const scene = readScene(sceneId);
  let previous = null;
  if (!rerender) {
    forceStop(app);
    adb(['logcat', '-c']);
    launch(app, sceneId);
  } else {
    const logs = logcat();
    previous = renderMarker(app, sceneId, logs);
    if (!previous) {
      throw new Error(`${app.id} ${sceneId}: no render marker before rerender`);
    }
    triggerRerender(app);
    await waitForRender(app, sceneId, previous);
  }

  const full = await waitForGreen(app, sceneId, {
    timeoutMs,
    requireTransition: requireTransition && !rerender,
  });
  const crop = verifySceneFrame(app, scene, full);
  const logs = logcat();
  const marker = fontMarker(app, logs, markerFallback);
  const render = renderMarker(app, sceneId, logs);
  return {
    scene,
    crop,
    full,
    width: crop.width,
    height: crop.height,
    marker,
    render,
    textLayout: textLayoutMarker(app, sceneId, logs),
    capturedAt: new Date().toISOString(),
  };
}

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

export function runColdBoot() {
  execFileSync('bash', [path.join(ROOT, 'tools/pixel/cold-boot.sh')], {
    stdio: 'inherit',
    env: process.env,
    timeout: 8 * 60 * 1000,
  });
}
