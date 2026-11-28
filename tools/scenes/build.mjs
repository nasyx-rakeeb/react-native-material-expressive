import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const scenesDir = path.join(root, 'tools/scenes');
const generatedTs = path.join(root, 'apps/gallery/src/scenes.generated.ts');
const indexJson = path.join(scenesDir, 'index.json');
const check = process.argv.includes('--check');

const colorPattern = /^#[0-9A-Fa-f]{6}$/;
const SCENE_CATEGORIES = ['core', 'text', 'interaction', 'icon'];
const INTERACTION_STATES = ['default', 'hover', 'focus', 'pressed', 'dragged', 'disabled'];

// The scene stores the codepoint so the Compose reference does not need a
// second registry; the build proves the codepoint matches the RN registry.
const symbolSource = await readFile(
  path.join(root, 'packages/react-native-material-expressive/src/icon/materialSymbols.ts'),
  'utf8',
);
const SYMBOL_CODEPOINTS = new Map();
for (const match of symbolSource.matchAll(/^ {2}([a-z0-9_]+): '\\u\{([0-9a-f]+)\}',$/gm)) {
  SYMBOL_CODEPOINTS.set(match[1], String.fromCodePoint(parseInt(match[2], 16)));
}

function fail(file, message) {
  throw new Error(`${path.relative(root, file)}: ${message}`);
}

function requireNumber(file, value, name, { min = 0, integer = false } = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fail(file, `${name} must be a finite number`);
  }
  if (value < min) {
    fail(file, `${name} must be >= ${min}`);
  }
  if (integer && !Number.isInteger(value)) {
    fail(file, `${name} must be an integer`);
  }
  return value;
}

function requireColor(file, value, name) {
  if (typeof value !== 'string' || !colorPattern.test(value)) {
    fail(file, `${name} must be #RRGGBB`);
  }
  return value.toUpperCase();
}

function validateScene(file, scene) {
  if (scene.schema !== 1) {
    fail(file, 'schema must be 1');
  }
  if (typeof scene.id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(scene.id)) {
    fail(file, 'id must be kebab-case');
  }
  if (path.basename(file, '.json') !== scene.id) {
    fail(file, `file name must be ${scene.id}.json`);
  }
  if (!SCENE_CATEGORIES.includes(scene.category)) {
    fail(file, `category must be one of ${SCENE_CATEGORIES.join(', ')}`);
  }
  if (typeof scene.description !== 'string' || scene.description.length < 10) {
    fail(file, 'description must be at least 10 characters');
  }
  requireNumber(file, scene.widthDp, 'widthDp', { min: 1, integer: true });
  requireNumber(file, scene.heightDp, 'heightDp', { min: 1, integer: true });
  requireColor(file, scene.background, 'background');
  if (!Array.isArray(scene.layers)) {
    fail(file, 'layers must be an array');
  }
  for (const [index, layer] of scene.layers.entries()) {
    const label = `layers[${index}]`;
    if (layer.type === 'rect') {
      requireNumber(file, layer.x, `${label}.x`, { integer: true });
      requireNumber(file, layer.y, `${label}.y`, { integer: true });
      requireNumber(file, layer.width, `${label}.width`, { min: 1 });
      requireNumber(file, layer.height, `${label}.height`, { min: 1 });
      requireNumber(file, layer.radius, `${label}.radius`, { min: 0 });
      requireNumber(file, layer.elevationDp, `${label}.elevationDp`, { min: 0 });
      requireColor(file, layer.color, `${label}.color`);
    } else if (layer.type === 'text') {
      requireNumber(file, layer.x, `${label}.x`, { integer: true });
      requireNumber(file, layer.y, `${label}.y`, { integer: true });
      requireNumber(file, layer.sizeSp, `${label}.sizeSp`, { min: 1 });
      requireNumber(file, layer.weight, `${label}.weight`, { min: 1 });
      requireNumber(file, layer.letterSpacingSp, `${label}.letterSpacingSp`, { min: -1000 });
      if (layer.lineHeightSp !== undefined) {
        requireNumber(file, layer.lineHeightSp, `${label}.lineHeightSp`, { min: 1 });
      }
      if (layer.widthDp !== undefined) {
        requireNumber(file, layer.widthDp, `${label}.widthDp`, { min: 1 });
      }
      requireColor(file, layer.color, `${label}.color`);
      if (typeof layer.text !== 'string' || layer.text.length === 0) {
        fail(file, `${label}.text must be non-empty`);
      }
    } else if (layer.type === 'interaction') {
      requireNumber(file, layer.x, `${label}.x`, { integer: true });
      requireNumber(file, layer.y, `${label}.y`, { integer: true });
      requireNumber(file, layer.width, `${label}.width`, { min: 1 });
      requireNumber(file, layer.height, `${label}.height`, { min: 1 });
      requireNumber(file, layer.radius, `${label}.radius`, { min: 0 });
      requireNumber(file, layer.elevationDp, `${label}.elevationDp`, { min: 0 });
      if (!INTERACTION_STATES.includes(layer.state)) {
        fail(file, `${label}.state must be one of ${INTERACTION_STATES.join(', ')}`);
      }
      requireColor(file, layer.containerColor, `${label}.containerColor`);
      requireColor(file, layer.contentColor, `${label}.contentColor`);
      requireColor(file, layer.surfaceTint, `${label}.surfaceTint`);
      if (layer.focusRing !== null) {
        if (typeof layer.focusRing !== 'object') {
          fail(file, `${label}.focusRing must be null or an object`);
        }
        requireColor(file, layer.focusRing.outerColor, `${label}.focusRing.outerColor`);
        requireColor(file, layer.focusRing.innerColor, `${label}.focusRing.innerColor`);
      }
      if (layer.ripple !== null) {
        if (typeof layer.ripple !== 'object') {
          fail(file, `${label}.ripple must be null or an object`);
        }
        requireNumber(file, layer.ripple.progress, `${label}.ripple.progress`, { min: 0 });
        if (layer.ripple.progress > 1) {
          fail(file, `${label}.ripple.progress must be <= 1`);
        }
        requireNumber(file, layer.ripple.originX, `${label}.ripple.originX`, { min: 0 });
        requireNumber(file, layer.ripple.originY, `${label}.ripple.originY`, { min: 0 });
        if (layer.ripple.originX > layer.width || layer.ripple.originY > layer.height) {
          fail(file, `${label}.ripple origin must be inside the layer`);
        }
        if (typeof layer.ripple.bounded !== 'boolean') {
          fail(file, `${label}.ripple.bounded must be a boolean`);
        }
      }
    } else if (layer.type === 'icon') {
      requireNumber(file, layer.x, `${label}.x`, { integer: true });
      requireNumber(file, layer.y, `${label}.y`, { integer: true });
      requireNumber(file, layer.size, `${label}.size`, { min: 1 });
      requireColor(file, layer.color, `${label}.color`);
      if (typeof layer.name !== 'string' || !SYMBOL_CODEPOINTS.has(layer.name)) {
        fail(file, `${label}.name must be a name in materialSymbols.ts`);
      }
      if (layer.codepoint !== SYMBOL_CODEPOINTS.get(layer.name)) {
        fail(file, `${label}.codepoint must match ${layer.name} in materialSymbols.ts`);
      }
      if (layer.fill !== 0 && layer.fill !== 1) {
        fail(file, `${label}.fill must be 0 or 1`);
      }
      requireNumber(file, layer.weight, `${label}.weight`, { min: 100 });
      requireNumber(file, layer.grade, `${label}.grade`, { min: -50 });
      requireNumber(file, layer.opticalSize, `${label}.opticalSize`, { min: 20 });
      if (layer.weight > 700 || layer.grade > 200 || layer.opticalSize > 48) {
        fail(
          file,
          `${label} axes must stay inside FILL 0–1, wght 100–700, GRAD -50–200, opsz 20–48`,
        );
      }
    } else {
      fail(file, `${label}.type must be rect, text, interaction or icon`);
    }
  }
  return scene;
}

const entries = (await readdir(scenesDir))
  .filter((name) => name.endsWith('.json') && name !== 'index.json')
  .sort();

if (entries.length === 0) {
  throw new Error('no scenes found');
}

const scenes = [];
for (const entry of entries) {
  const file = path.join(scenesDir, entry);
  const text = await readFile(file, 'utf8');
  const scene = validateScene(file, JSON.parse(text));
  scenes.push({
    ...scene,
    source: `tools/scenes/${entry}`,
    sourceSha256: createHash('sha256').update(text).digest('hex'),
  });
}

const ids = scenes.map((scene) => scene.id);
if (new Set(ids).size !== ids.length) {
  throw new Error('duplicate scene ids');
}

const index = {
  schema: 1,
  generatedBy: 'tools/scenes/build.mjs',
  scenes: scenes.map(({ source, sourceSha256, ...scene }) => ({
    id: scene.id,
    category: scene.category,
    source,
    sourceSha256,
    widthDp: scene.widthDp,
    heightDp: scene.heightDp,
  })),
};
const indexText = `${JSON.stringify(index, null, 2)}\n`;

const tsLines = [
  '// Generated by tools/scenes/build.mjs. Do not edit by hand.',
  "import type { Scene } from './scene-types';",
  '',
  'export const scenes = {',
];
for (const scene of scenes) {
  const rest = { ...scene };
  delete rest.source;
  delete rest.sourceSha256;
  tsLines.push(`  ${JSON.stringify(scene.id)}: ${JSON.stringify(rest, null, 2)} as Scene,`);
}
tsLines.push('} as const;', '', 'export type SceneId = keyof typeof scenes;', '');
const tsText = tsLines.join('\n');

async function currentOrWrite(file, text) {
  let current;
  try {
    current = await readFile(file, 'utf8');
  } catch {
    current = null;
  }
  if (check) {
    if (current !== text) {
      throw new Error(`${path.relative(root, file)} is stale; run pnpm scenes:build`);
    }
    return;
  }
  if (current !== text) {
    await writeFile(file, text, 'utf8');
    console.log(`wrote ${path.relative(root, file)}`);
  }
}

await currentOrWrite(indexJson, indexText);
await currentOrWrite(generatedTs, tsText);
const categorySummary = SCENE_CATEGORIES.map(
  (category) => `${category}=${scenes.filter((scene) => scene.category === category).length}`,
).join(' ');
console.log(`scenes ok: ${scenes.length} (${categorySummary})`);
