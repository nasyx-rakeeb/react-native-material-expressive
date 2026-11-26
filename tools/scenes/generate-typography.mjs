/**
 * Generate one pixel scene per Compose typography role.
 *
 * The scene values are copied from `docs/specs/typography.json`, so a token
 * change cannot silently leave the typography evidence on an old scale.
 *
 * Run from the repository root:
 *   node tools/scenes/generate-typography.mjs
 *   node tools/scenes/generate-typography.mjs --check
 */
import { readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const specsPath = path.join(repoRoot, 'docs/specs/typography.json');
const scenesDir = path.join(repoRoot, 'tools/scenes');
const check = process.argv.includes('--check');

const specs = JSON.parse(readFileSync(specsPath, 'utf8'));
const roles = specs.roles;
if (!Array.isArray(roles) || roles.length !== 30) {
  throw new Error(`expected 30 typography roles, found ${roles?.length ?? 'none'}`);
}

function kebab(role) {
  return role.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

const files = new Map();
for (const role of roles) {
  const { role: name, fontWeight, fontSize, lineHeight, letterSpacing } = role;
  if (!name || !Number.isFinite(fontWeight) || !Number.isFinite(fontSize)) {
    throw new Error(`invalid typography role record: ${JSON.stringify(role)}`);
  }
  const id = `type-${kebab(name)}`;
  const description =
    `${name}: ${fontWeight}, ${fontSize}/${lineHeight} sp, ` +
    `tracking ${letterSpacing} sp. One-line Roboto Flex text scene.`;
  const scene = {
    schema: 1,
    id,
    description,
    widthDp: 320,
    heightDp: 200,
    background: '#FFFBFE',
    layers: [
      {
        type: 'text',
        x: 16,
        y: 24,
        text: 'Material',
        sizeSp: fontSize,
        weight: fontWeight,
        color: '#1D1B20',
        letterSpacingSp: letterSpacing,
        lineHeightSp: lineHeight,
      },
    ],
  };
  files.set(`${id}.json`, `${JSON.stringify(scene, null, 2)}\n`);
}

const existing = readdirSync(scenesDir).filter(
  (name) => name.startsWith('type-') && name.endsWith('.json'),
);
const stale = existing.filter((name) => !files.has(name));
const missing = [...files.keys()].filter((name) => !existing.includes(name));
const changed = [...files.entries()].filter(([name, contents]) => {
  try {
    return readFileSync(path.join(scenesDir, name), 'utf8') !== contents;
  } catch {
    return true;
  }
});

if (check) {
  if (stale.length || missing.length || changed.length) {
    throw new Error(
      `typography scenes are stale: ${[...stale, ...missing, ...changed.map(([name]) => name)].join(
        ', ',
      )}. Run pnpm scenes:build.`,
    );
  }
  console.log(`typography scenes ok: ${files.size} roles`);
} else {
  for (const name of stale) {
    unlinkSync(path.join(scenesDir, name));
  }
  for (const [name, contents] of files) {
    writeFileSync(path.join(scenesDir, name), contents);
  }
  console.log(`typography scenes written: ${files.size} roles`);
}
