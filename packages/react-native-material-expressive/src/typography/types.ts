import type { typography } from '../tokens/generated/global';

/** All 30 Material 3 type-scale roles, baseline + emphasized. */
export type M3TypeScaleRole = keyof typeof typography;

/** Weights used by the Compose 1.5.0 type scale. */
export type M3FontWeight = 400 | 500 | 700;

/** String form accepted by React Native's `fontWeight`. */
export type M3FontWeightValue = '400' | '500' | '700';

/**
 * Resolved type-scale style.
 *
 * Sizes, line heights, and tracking are all in sp. React Native scales all
 * three with the system font scale when `allowFontScaling` is true (see
 * `TextAttributes.effectiveFontSize`, `effectiveLineHeight`, and
 * `effectiveLetterSpacing` in RN 0.88), so do not pre-scale them.
 *
 * `lineHeight` is the render line box: it is the token line height, raised to
 * the natural font line box for display roles where Compose would expand it
 * (see `M3TypographyOptions.naturalLineHeightRatio`).
 */
export interface M3TextStyle {
  fontFamily?: string;
  fontWeight?: M3FontWeightValue;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontVariationSettings?: string;
  includeFontPadding: boolean;
}

/** Complete 30-role type scale. */
export type M3Typography = Record<M3TypeScaleRole, M3TextStyle>;

export interface M3TypographyOptions {
  /**
   * Base font family. Omit to use the platform font (Roboto on Android,
   * San Francisco on iOS), which matches Compose's `Typography()` defaults.
   */
  fontFamily?: string;
  /**
   * Static family names per weight, used when variable-font settings are not
   * available (RN < 0.88, Android < 8.0) or when `variableFonts` is false.
   */
  staticFamilies?: Partial<Record<M3FontWeight, string>>;
  /**
   * Force variable-font output. By default the runtime capability check
   * decides. When enabled, styles use `fontVariationSettings` and omit
   * `fontWeight` so Android does not synthesize a second weight.
   */
  variableFonts?: boolean;
  /**
   * Roboto Flex `wdth` axis value in the 25..151 range. Defaults to 100
   * (normal). The Material 3 type scale uses the normal width; this option is
   * for brands that deliberately condense or expand the whole scale.
   */
  widthAxis?: number;
  /**
   * Natural line-box height as a multiple of the font size. Compose expands a
   * line height that is below this value; React Native squashes it. The
   * default is the measured Roboto/Roboto Flex ratio (1.176). Set `0` to keep
   * the token line heights exactly, or provide the ratio for a brand font.
   */
  naturalLineHeightRatio?: number;
}

/** Variable-font capability and the reason for the result. */
export type VariableFontReason =
  | 'supported'
  | 'rn-too-old'
  | 'rn-version-unknown'
  | 'android-api-too-old'
  | 'platform-unsupported';

export interface VariableFontSupport {
  supported: boolean;
  reason: VariableFontReason;
  reactNativeVersion?: string;
  androidApiLevel?: number;
}
