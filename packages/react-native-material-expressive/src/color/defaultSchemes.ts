/**
 * Static Material 3 schemes extracted from Compose Material3 1.5.0.
 *
 * These are the only schemes that can be claimed as exact Compose token
 * matches. Seed-generated schemes use the Material color utilities and are
 * spec-verified rather than Compose-token-verified (see ADR-006).
 */
import { colorDark, colorLight, palette } from '../tokens/generated/global';
import type { M3ColorScheme } from './types';

/** Compose Material3 1.5.0 `lightColorScheme()` defaults. */
export function standardLightColorScheme(): M3ColorScheme {
  return colorLight;
}

/** Compose Material3 1.5.0 `darkColorScheme()` defaults. */
export function standardDarkColorScheme(): M3ColorScheme {
  return colorDark;
}

let expressiveLightCache: M3ColorScheme | undefined;

/**
 * Compose Material3 1.5.0 `expressiveLightColorScheme()`.
 *
 * Compose starts from the standard light scheme and overrides only the four
 * container foreground roles with the 30-tone palette values.
 */
export function expressiveLightColorScheme(): M3ColorScheme {
  expressiveLightCache ??= Object.freeze({
    ...colorLight,
    onPrimaryContainer: palette.primary30,
    onSecondaryContainer: palette.secondary30,
    onTertiaryContainer: palette.tertiary30,
    onErrorContainer: palette.error30,
  });
  return expressiveLightCache;
}
