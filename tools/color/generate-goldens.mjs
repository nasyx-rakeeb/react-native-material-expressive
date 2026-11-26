/**
 * Generate the Day 4 colour goldens.
 *
 * 1. `mcu-goldens.json` — reference role values from
 *    `@material/material-color-utilities@0.4.0` for 6 seeds x 9 variants x
 *    4 contrast levels x light/dark.
 * 2. `compose-palettes.json` — the same variants' 13 system-tone colours per
 *    tonal range, for the Compose reference app to map with
 *    `dynamicLightColorScheme31` / `dynamicDarkColorScheme31`.
 *
 * Run from the repository root:
 *   node --import ./tools/color/register-mcu-loader.mjs tools/color/generate-goldens.mjs
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const repoRoot = path.resolve(import.meta.dirname, '../..');
const packageRoot = path.join(repoRoot, 'packages/react-native-material-expressive');
const outputDir = path.join(repoRoot, 'docs/evidence/day4/color');
const mcuEntry = createRequire(path.join(packageRoot, 'package.json')).resolve(
  '@material/material-color-utilities',
);
const mcu = await import(pathToFileURL(mcuEntry).href);
const { DynamicScheme, Hct, MaterialDynamicColors, Variant, hexFromArgb } = mcu;

const SEEDS = ['#6750A4', '#006A6A', '#B3261E', '#386A20', '#7D5260', '#4285F4'];
const VARIANTS = [
  ['monochrome', Variant.MONOCHROME],
  ['neutral', Variant.NEUTRAL],
  ['tonalSpot', Variant.TONAL_SPOT],
  ['vibrant', Variant.VIBRANT],
  ['expressive', Variant.EXPRESSIVE],
  ['fidelity', Variant.FIDELITY],
  ['content', Variant.CONTENT],
  ['rainbow', Variant.RAINBOW],
  ['fruitSalad', Variant.FRUIT_SALAD],
];
const CONTRAST_LEVELS = [-1, 0, 0.5, 1];
const TONES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];
const PALETTES = ['primary', 'secondary', 'tertiary', 'neutral', 'neutralVariant'];
const colors = new MaterialDynamicColors();

const ROLE_GETTERS = {
  background: () => colors.background(),
  error: () => colors.error(),
  errorContainer: () => colors.errorContainer(),
  inverseOnSurface: () => colors.inverseOnSurface(),
  inversePrimary: () => colors.inversePrimary(),
  inverseSurface: () => colors.inverseSurface(),
  onBackground: () => colors.onBackground(),
  onError: () => colors.onError(),
  onErrorContainer: () => colors.onErrorContainer(),
  onPrimary: () => colors.onPrimary(),
  onPrimaryContainer: () => colors.onPrimaryContainer(),
  onPrimaryFixed: () => colors.onPrimaryFixed(),
  onPrimaryFixedVariant: () => colors.onPrimaryFixedVariant(),
  onSecondary: () => colors.onSecondary(),
  onSecondaryContainer: () => colors.onSecondaryContainer(),
  onSecondaryFixed: () => colors.onSecondaryFixed(),
  onSecondaryFixedVariant: () => colors.onSecondaryFixedVariant(),
  onSurface: () => colors.onSurface(),
  onSurfaceVariant: () => colors.onSurfaceVariant(),
  onTertiary: () => colors.onTertiary(),
  onTertiaryContainer: () => colors.onTertiaryContainer(),
  onTertiaryFixed: () => colors.onTertiaryFixed(),
  onTertiaryFixedVariant: () => colors.onTertiaryFixedVariant(),
  outline: () => colors.outline(),
  outlineVariant: () => colors.outlineVariant(),
  primary: () => colors.primary(),
  primaryContainer: () => colors.primaryContainer(),
  primaryFixed: () => colors.primaryFixed(),
  primaryFixedDim: () => colors.primaryFixedDim(),
  scrim: () => colors.scrim(),
  secondary: () => colors.secondary(),
  secondaryContainer: () => colors.secondaryContainer(),
  secondaryFixed: () => colors.secondaryFixed(),
  secondaryFixedDim: () => colors.secondaryFixedDim(),
  surface: () => colors.surface(),
  surfaceBright: () => colors.surfaceBright(),
  surfaceContainer: () => colors.surfaceContainer(),
  surfaceContainerHigh: () => colors.surfaceContainerHigh(),
  surfaceContainerHighest: () => colors.surfaceContainerHighest(),
  surfaceContainerLow: () => colors.surfaceContainerLow(),
  surfaceContainerLowest: () => colors.surfaceContainerLowest(),
  surfaceDim: () => colors.surfaceDim(),
  surfaceTint: () => colors.surfaceTint(),
  surfaceVariant: () => colors.surfaceVariant(),
  tertiary: () => colors.tertiary(),
  tertiaryContainer: () => colors.tertiaryContainer(),
  tertiaryFixed: () => colors.tertiaryFixed(),
  tertiaryFixedDim: () => colors.tertiaryFixedDim(),
};

function createScheme(seed, variant, contrastLevel, isDark) {
  return new DynamicScheme({
    sourceColorHct: Hct.fromInt(Number.parseInt(seed.slice(1), 16) | 0xff000000),
    variant,
    contrastLevel,
    isDark,
    specVersion: '2021',
    platform: 'phone',
  });
}

function roleValues(scheme) {
  const result = {};
  for (const [role, getter] of Object.entries(ROLE_GETTERS)) {
    result[role] = hexFromArgb(getter().getArgb(scheme)).toUpperCase();
  }
  return result;
}

function paletteValues(scheme) {
  const result = {};
  for (const palette of PALETTES) {
    const source = scheme[`${palette}Palette`];
    result[palette] = Object.fromEntries(
      TONES.map((tone) => [tone, hexFromArgb(source.tone(tone)).toUpperCase()]),
    );
  }
  return result;
}

mkdirSync(outputDir, { recursive: true });

const mcuGoldens = {
  schema: 1,
  generatedBy: 'tools/color/generate-goldens.mjs',
  mcuVersion: '0.4.0',
  specVersion: '2021',
  platform: 'phone',
  seeds: SEEDS,
  variants: VARIANTS.map(([name]) => name),
  contrastLevels: CONTRAST_LEVELS,
  schemes: {},
};
const composePalettes = {
  schema: 1,
  generatedBy: 'tools/color/generate-goldens.mjs',
  mcuVersion: '0.4.0',
  specVersion: '2021',
  seeds: SEEDS,
  variants: VARIANTS.map(([name]) => name),
  tones: TONES,
  palettes: {},
};

for (const seed of SEEDS) {
  for (const [variantName, variant] of VARIANTS) {
    const paletteScheme = createScheme(seed, variant, 0, false);
    composePalettes.palettes[`${seed}|${variantName}`] = paletteValues(paletteScheme);

    for (const contrastLevel of CONTRAST_LEVELS) {
      for (const isDark of [false, true]) {
        const scheme = createScheme(seed, variant, contrastLevel, isDark);
        const key = `${seed}|${variantName}|${isDark ? 'dark' : 'light'}|${contrastLevel}`;
        mcuGoldens.schemes[key] = roleValues(scheme);
      }
    }
  }
}

writeFileSync(path.join(outputDir, 'mcu-goldens.json'), `${JSON.stringify(mcuGoldens)}\n`);
writeFileSync(
  path.join(outputDir, 'compose-palettes.json'),
  `${JSON.stringify(composePalettes)}\n`,
);

console.log(
  `Wrote ${Object.keys(mcuGoldens.schemes).length} MCU schemes and ` +
    `${Object.keys(composePalettes.palettes).length} Compose palettes to ${outputDir}`,
);
