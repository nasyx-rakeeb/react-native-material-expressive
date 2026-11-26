/**
 * Material 3 colour-scheme types.
 *
 * The role set is derived from the Compose Material3 1.5.0 token baseline so
 * that the generated default schemes cannot silently drift from the extracted
 * tokens. Keep the runtime list in sync via `colorRoles`.
 */
import { colorLight } from '../tokens/generated/global';

/** Every colour role exposed by a Material 3 `ColorScheme`. */
export type M3ColorRole = keyof typeof colorLight;

/** A complete, opaque Material 3 colour scheme. Values are `#RRGGBB`. */
export type M3ColorScheme = { readonly [K in M3ColorRole]: string };

/** Runtime role list in token order. */
export const M3_COLOR_ROLES = Object.freeze(
  Object.keys(colorLight) as M3ColorRole[],
) as readonly M3ColorRole[];

/**
 * Material colour-scheme variants. These mirror
 * `@material/material-color-utilities` `Variant` and cover the full public set:
 * monochrome, neutral, tonal spot, vibrant, expressive, fidelity, content,
 * rainbow, and fruit salad.
 */
export type M3SchemeVariant =
  | 'monochrome'
  | 'neutral'
  | 'tonalSpot'
  | 'vibrant'
  | 'expressive'
  | 'fidelity'
  | 'content'
  | 'rainbow'
  | 'fruitSalad';

/**
 * Contrast level in the Material spec range `-1..1`.
 *
 * `-1` is minimum contrast, `0` is the design as specified, and `1` is maximum
 * contrast. `M3Contrast` provides the common named levels.
 */
export type M3ContrastLevel = number;

/** Named contrast levels for the Material spec range. */
export const M3Contrast = Object.freeze({
  low: -1,
  standard: 0,
  medium: 0.5,
  high: 1,
} as const);

/** Material color-spec version. Compose Material3 1.5.0 is a 2021-spec baseline. */
export type M3ColorSpecVersion = '2021' | '2025';

/** Source colour accepted by the generator. */
export type M3SeedColor = string | number;

/** Options for a seed-generated scheme. */
export interface M3ColorSchemeOptions {
  /** Source colour as `#RRGGBB`, `#AARRGGBB`, or a 32-bit ARGB integer. */
  seed: M3SeedColor;
  /** `true` for a dark scheme. Defaults to `false`. */
  isDark?: boolean;
  /** Scheme variant. Defaults to `tonalSpot`, the Material baseline. */
  variant?: M3SchemeVariant;
  /** Contrast level `-1..1`. Defaults to `0`. */
  contrastLevel?: M3ContrastLevel;
  /** Spec version. Defaults to `2021` to match Compose Material3 1.5.0. */
  specVersion?: M3ColorSpecVersion;
  /** Target platform for the 2025 spec. Defaults to `phone`. */
  platform?: 'phone' | 'watch';
}
