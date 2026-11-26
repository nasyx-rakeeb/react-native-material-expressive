/**
 * Compare the committed Day 4 colour evidence.
 *
 * Compose Material3 1.5.0 has no seed-to-scheme API. The seed-generated
 * schemes are therefore verified against material-color-utilities (MCU), while
 * Compose's role mapping and native dynamic colours are verified separately.
 * This script records the independent Java oracle comparison; it is a
 * cross-check, not a release gate.
 *
 * Run from the repository root:
 *   node tools/color/compare-goldens.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '../..');
const evidenceDir = path.join(repoRoot, 'docs/evidence/day4/color');
const readJson = (name) => JSON.parse(readFileSync(path.join(evidenceDir, name), 'utf8'));

const goldens = readJson('mcu-goldens.json');
const dump = readJson('compose-dump.json');
const native = readJson('native-dynamic-payload.json');

/** Compose writes Kotlin doubles such as `0.0`; JS writes `0`. Normalize both. */
function normalizeKey(key) {
  const [seed, variant, mode, contrast] = key.split('|');
  return `${seed}|${variant}|${mode}|${Number(contrast)}`;
}

function channelDelta(a, b) {
  let max = 0;
  for (let i = 1; i < 7; i += 2) {
    max = Math.max(
      max,
      Math.abs(Number.parseInt(a.slice(i, i + 2), 16) - Number.parseInt(b.slice(i, i + 2), 16)),
    );
  }
  return max;
}

function increment(map, key) {
  map[key] = (map[key] ?? 0) + 1;
}

function sortedObject(map) {
  return Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)));
}

function compareSchemes(expectedSchemes, actualSchemes) {
  const result = {
    comparedSchemes: 0,
    comparedValues: 0,
    missing: 0,
    differences: 0,
    maxChannelDelta: 0,
    byContrast: {},
    byRole: {},
    byVariant: {},
    byMode: {},
    examples: [],
  };

  for (const [rawKey, actualRoles] of Object.entries(actualSchemes)) {
    const key = normalizeKey(rawKey);
    const expectedRoles = expectedSchemes[key];
    if (!expectedRoles) {
      result.missing += 1;
      continue;
    }
    result.comparedSchemes += 1;
    const [seed, variant, mode, contrast] = key.split('|');
    for (const [role, actual] of Object.entries(actualRoles)) {
      const expected = expectedRoles[role];
      if (expected === undefined) {
        result.missing += 1;
        continue;
      }
      result.comparedValues += 1;
      const delta = channelDelta(expected, actual);
      if (delta === 0) {
        continue;
      }
      result.differences += 1;
      result.maxChannelDelta = Math.max(result.maxChannelDelta, delta);
      increment(result.byContrast, contrast);
      increment(result.byRole, role);
      increment(result.byVariant, variant);
      increment(result.byMode, mode);
      if (result.examples.length < 20) {
        result.examples.push({ seed, variant, mode, contrast, role, expected, actual, delta });
      }
    }
  }

  result.byContrast = sortedObject(result.byContrast);
  result.byRole = sortedObject(result.byRole);
  result.byVariant = sortedObject(result.byVariant);
  result.byMode = sortedObject(result.byMode);
  return result;
}

function compareRoleMaps(expectedRoles, actualRoles) {
  const result = {
    comparedValues: 0,
    differences: 0,
    maxChannelDelta: 0,
    byRole: {},
    examples: [],
  };
  for (const [role, actual] of Object.entries(actualRoles)) {
    const expected = expectedRoles[role];
    if (expected === undefined) continue;
    result.comparedValues += 1;
    const delta = channelDelta(expected, actual);
    if (delta === 0) continue;
    result.differences += 1;
    result.maxChannelDelta = Math.max(result.maxChannelDelta, delta);
    increment(result.byRole, role);
    if (result.examples.length < 12) {
      result.examples.push({ role, expected, actual, delta });
    }
  }
  result.byRole = sortedObject(result.byRole);
  return result;
}

function compareStandardContrast() {
  const standard = {
    comparedValues: 0,
    differences: 0,
    maxChannelDelta: 0,
    roles: {},
    examples: [],
  };
  for (const [rawKey, actualRoles] of Object.entries(dump.materialJava)) {
    const key = normalizeKey(rawKey);
    if (!key.endsWith('|0')) continue;
    const expectedRoles = goldens.schemes[key];
    if (!expectedRoles) continue;
    const [seed, variant, mode] = key.split('|');
    for (const [role, actual] of Object.entries(actualRoles)) {
      standard.comparedValues += 1;
      const expected = expectedRoles[role];
      if (expected === undefined) continue;
      const delta = channelDelta(expected, actual);
      if (delta === 0) continue;
      standard.differences += 1;
      standard.maxChannelDelta = Math.max(standard.maxChannelDelta, delta);
      increment(standard.roles, role);
      if (standard.examples.length < 12) {
        standard.examples.push({ seed, variant, mode, role, expected, actual, delta });
      }
    }
  }
  standard.roles = sortedObject(standard.roles);
  return standard;
}

const java = compareSchemes(goldens.schemes, dump.materialJava);
const standardContrast = compareStandardContrast();

const nativeComparison = {
  apiLevel: native.apiLevel,
  kind: native.kind,
  light: compareRoleMaps(dump.dynamic.light, native.light),
  dark: compareRoleMaps(dump.dynamic.dark, native.dark),
};

const expressiveOverrides = Object.keys(dump.defaults.expressiveLight).filter(
  (role) => dump.defaults.expressiveLight[role] !== dump.defaults.light[role],
);

const summary = {
  schema: 1,
  generatedBy: 'tools/color/compare-goldens.mjs',
  sources: {
    mcu: goldens.mcuVersion,
    specVersion: goldens.specVersion,
    compose: 'material3:1.5.0',
    javaOracle: 'com.google.android.material:material:1.11.0',
  },
  javaOracle: {
    ...java,
    standardContrast,
    status: 'cross-check-only',
    note:
      'material 1.11.0 implements the earlier on-container tone mapping; MCU 0.4.0 ' +
      'implements the revised 2021 spec. Differences are expected and are not a gate.',
  },
  nativeDynamic: {
    apiLevel: nativeComparison.apiLevel,
    kind: nativeComparison.kind,
    light: nativeComparison.light,
    dark: nativeComparison.dark,
  },
  composeMapped: {
    palettes: Object.keys(dump.mapped).length,
    schemes: Object.keys(dump.mapped).length * 2,
  },
  composeDefaults: {
    lightRoles: Object.keys(dump.defaults.light).length,
    darkRoles: Object.keys(dump.defaults.dark).length,
    expressiveLightRoles: Object.keys(dump.defaults.expressiveLight).length,
    expressiveLightOverrides: expressiveOverrides,
  },
};

const outputPath = path.join(evidenceDir, 'java-oracle-summary.json');
writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`);

const percent = ((java.differences / java.comparedValues) * 100).toFixed(2);
const standardPercent = (
  (standardContrast.differences / standardContrast.comparedValues) *
  100
).toFixed(2);
console.log(
  `Java oracle (material 1.11.0 vs MCU 0.4.0): ${java.comparedSchemes} schemes, ` +
    `${java.comparedValues} values, ${java.differences} differences (${percent}%), ` +
    `max channel delta ${java.maxChannelDelta}`,
);
console.log(`  by contrast: ${JSON.stringify(java.byContrast)}`);
console.log(
  `  standard contrast: ${standardContrast.differences}/${standardContrast.comparedValues} ` +
    `(${standardPercent}%), roles: ${Object.keys(standardContrast.roles).join(', ')}`,
);
console.log(
  `Native dynamic: API ${nativeComparison.apiLevel} ${nativeComparison.kind}, ` +
    `light ${nativeComparison.light.differences}/${nativeComparison.light.comparedValues}, ` +
    `dark ${nativeComparison.dark.differences}/${nativeComparison.dark.comparedValues}`,
);
console.log(
  `Compose mapped: ${summary.composeMapped.palettes} palettes, ` +
    `${summary.composeMapped.schemes} light/dark schemes`,
);
console.log(`Compose expressive light overrides: ${expressiveOverrides.join(', ')}`);
console.log(`Wrote ${outputPath}`);
