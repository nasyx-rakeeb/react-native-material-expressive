/**
 * Seed-based Material 3 colour-scheme generation.
 *
 * Tonal palettes and role resolution come from
 * `@material/material-color-utilities@0.4.0` (Apache-2.0), the reference
 * implementation of the Material color system. The default `2021` spec keeps
 * the generator aligned with the Compose Material3 1.5.0 token baseline.
 *
 * Compose's public dynamic-colour API is device/context based and has no
 * seed-to-scheme entry point. Seed-generated schemes are therefore
 * spec-verified, not Compose-token-verified; see ADR-006 and the Day 4 colour
 * report.
 */
import {
  DynamicScheme,
  Hct,
  hexFromArgb,
  MaterialDynamicColors,
  Variant,
} from '@material/material-color-utilities';
import type {
  M3ColorScheme,
  M3ColorSchemeOptions,
  M3ContrastLevel,
  M3SeedColor,
  M3SchemeVariant,
} from './types';

const variantValues: Record<M3SchemeVariant, Variant> = {
  monochrome: Variant.MONOCHROME,
  neutral: Variant.NEUTRAL,
  tonalSpot: Variant.TONAL_SPOT,
  vibrant: Variant.VIBRANT,
  expressive: Variant.EXPRESSIVE,
  fidelity: Variant.FIDELITY,
  content: Variant.CONTENT,
  rainbow: Variant.RAINBOW,
  fruitSalad: Variant.FRUIT_SALAD,
};

const DEFAULT_SEED = '#6750A4';
const CACHE_LIMIT = 64;
const cache = new Map<string, M3ColorScheme>();
const colors = new MaterialDynamicColors();

/** Normalize a hex or integer seed to an opaque unsigned ARGB integer. */
function normalizeSeed(seed: M3SeedColor): number {
  if (typeof seed === 'number') {
    if (!Number.isFinite(seed) || !Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) {
      throw new RangeError('M3 seed must be an integer in the 32-bit ARGB range.');
    }
    const argb = seed >>> 0;
    return argb <= 0xffffff ? (argb | 0xff000000) >>> 0 : argb;
  }

  const match = /^#?([0-9a-f]{6}|[0-9a-f]{8})$/i.exec(seed.trim());
  if (!match?.[1]) {
    throw new RangeError('M3 seed must be #RRGGBB, #AARRGGBB, or a 32-bit ARGB integer.');
  }
  const value = match[1];
  const argb = Number.parseInt(value, 16) >>> 0;
  if (value.length === 6) {
    return (argb | 0xff000000) >>> 0;
  }
  return argb;
}

function normalizeContrast(contrastLevel: M3ContrastLevel): number {
  if (!Number.isFinite(contrastLevel) || contrastLevel < -1 || contrastLevel > 1) {
    throw new RangeError('M3 contrastLevel must be a finite number in the range -1..1.');
  }
  return contrastLevel;
}

function resolveColors(scheme: DynamicScheme): M3ColorScheme {
  const hex = (argb: number) => hexFromArgb(argb).toUpperCase();
  return Object.freeze({
    background: hex(colors.background().getArgb(scheme)),
    error: hex(colors.error().getArgb(scheme)),
    errorContainer: hex(colors.errorContainer().getArgb(scheme)),
    inverseOnSurface: hex(colors.inverseOnSurface().getArgb(scheme)),
    inversePrimary: hex(colors.inversePrimary().getArgb(scheme)),
    inverseSurface: hex(colors.inverseSurface().getArgb(scheme)),
    onBackground: hex(colors.onBackground().getArgb(scheme)),
    onError: hex(colors.onError().getArgb(scheme)),
    onErrorContainer: hex(colors.onErrorContainer().getArgb(scheme)),
    onPrimary: hex(colors.onPrimary().getArgb(scheme)),
    onPrimaryContainer: hex(colors.onPrimaryContainer().getArgb(scheme)),
    onPrimaryFixed: hex(colors.onPrimaryFixed().getArgb(scheme)),
    onPrimaryFixedVariant: hex(colors.onPrimaryFixedVariant().getArgb(scheme)),
    onSecondary: hex(colors.onSecondary().getArgb(scheme)),
    onSecondaryContainer: hex(colors.onSecondaryContainer().getArgb(scheme)),
    onSecondaryFixed: hex(colors.onSecondaryFixed().getArgb(scheme)),
    onSecondaryFixedVariant: hex(colors.onSecondaryFixedVariant().getArgb(scheme)),
    onSurface: hex(colors.onSurface().getArgb(scheme)),
    onSurfaceVariant: hex(colors.onSurfaceVariant().getArgb(scheme)),
    onTertiary: hex(colors.onTertiary().getArgb(scheme)),
    onTertiaryContainer: hex(colors.onTertiaryContainer().getArgb(scheme)),
    onTertiaryFixed: hex(colors.onTertiaryFixed().getArgb(scheme)),
    onTertiaryFixedVariant: hex(colors.onTertiaryFixedVariant().getArgb(scheme)),
    outline: hex(colors.outline().getArgb(scheme)),
    outlineVariant: hex(colors.outlineVariant().getArgb(scheme)),
    primary: hex(colors.primary().getArgb(scheme)),
    primaryContainer: hex(colors.primaryContainer().getArgb(scheme)),
    primaryFixed: hex(colors.primaryFixed().getArgb(scheme)),
    primaryFixedDim: hex(colors.primaryFixedDim().getArgb(scheme)),
    scrim: hex(colors.scrim().getArgb(scheme)),
    secondary: hex(colors.secondary().getArgb(scheme)),
    secondaryContainer: hex(colors.secondaryContainer().getArgb(scheme)),
    secondaryFixed: hex(colors.secondaryFixed().getArgb(scheme)),
    secondaryFixedDim: hex(colors.secondaryFixedDim().getArgb(scheme)),
    surface: hex(colors.surface().getArgb(scheme)),
    surfaceBright: hex(colors.surfaceBright().getArgb(scheme)),
    surfaceContainer: hex(colors.surfaceContainer().getArgb(scheme)),
    surfaceContainerHigh: hex(colors.surfaceContainerHigh().getArgb(scheme)),
    surfaceContainerHighest: hex(colors.surfaceContainerHighest().getArgb(scheme)),
    surfaceContainerLow: hex(colors.surfaceContainerLow().getArgb(scheme)),
    surfaceContainerLowest: hex(colors.surfaceContainerLowest().getArgb(scheme)),
    surfaceDim: hex(colors.surfaceDim().getArgb(scheme)),
    surfaceTint: hex(colors.surfaceTint().getArgb(scheme)),
    surfaceVariant: hex(colors.surfaceVariant().getArgb(scheme)),
    tertiary: hex(colors.tertiary().getArgb(scheme)),
    tertiaryContainer: hex(colors.tertiaryContainer().getArgb(scheme)),
    tertiaryFixed: hex(colors.tertiaryFixed().getArgb(scheme)),
    tertiaryFixedDim: hex(colors.tertiaryFixedDim().getArgb(scheme)),
  });
}

function cacheKey(
  seed: number,
  isDark: boolean,
  variant: M3SchemeVariant,
  contrastLevel: number,
  specVersion: '2021' | '2025',
  platform: 'phone' | 'watch',
): string {
  return `${seed.toString(16)}|${isDark ? 'dark' : 'light'}|${variant}|${contrastLevel}|${specVersion}|${platform}`;
}

/**
 * Generate a complete 48-role Material 3 colour scheme from a source colour.
 *
 * The result is deterministic and frozen. Identical options return the same
 * cached object.
 */
export function createColorScheme(options: M3ColorSchemeOptions): M3ColorScheme {
  const seed = normalizeSeed(options.seed ?? DEFAULT_SEED);
  const isDark = options.isDark ?? false;
  const variant = options.variant ?? 'tonalSpot';
  const contrastLevel = normalizeContrast(options.contrastLevel ?? 0);
  const specVersion = options.specVersion ?? '2021';
  const platform = options.platform ?? 'phone';

  const mcuVariant = variantValues[variant];
  if (mcuVariant === undefined) {
    throw new RangeError(`Unknown M3 color-scheme variant: ${String(variant)}`);
  }
  if (specVersion !== '2021' && specVersion !== '2025') {
    throw new RangeError(`Unknown M3 color spec version: ${String(specVersion)}`);
  }

  const key = cacheKey(seed, isDark, variant, contrastLevel, specVersion, platform);
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  const scheme = new DynamicScheme({
    sourceColorHct: Hct.fromInt(seed),
    variant: mcuVariant,
    contrastLevel,
    isDark,
    platform,
    specVersion,
  });
  const result = resolveColors(scheme);

  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) {
      cache.delete(oldest);
    }
  }
  cache.set(key, result);
  return result;
}

/**
 * Opt-in generated expressive dark scheme. Compose Material3 1.5.0 has no
 * expressive dark scheme, so this is Material-spec verified, not
 * Compose-verified (ADR-006).
 */
export function expressiveDarkColorScheme(seed: M3SeedColor = DEFAULT_SEED): M3ColorScheme {
  return createColorScheme({ seed, isDark: true, variant: 'expressive' });
}

/** Clear the internal scheme cache. Intended for tests and theme hot reloads. */
export function clearColorSchemeCache(): void {
  cache.clear();
}
