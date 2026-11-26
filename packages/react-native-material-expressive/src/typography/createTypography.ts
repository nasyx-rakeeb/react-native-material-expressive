import { typography as typeScale } from '../tokens/generated/global';
import { supportsVariableFontSettings } from './support';
import type {
  M3FontWeight,
  M3FontWeightValue,
  M3TextStyle,
  M3TypeScaleRole,
  M3Typography,
  M3TypographyOptions,
} from './types';

export const M3_BASELINE_ROLES = [
  'bodyLarge',
  'bodyMedium',
  'bodySmall',
  'displayLarge',
  'displayMedium',
  'displaySmall',
  'headlineLarge',
  'headlineMedium',
  'headlineSmall',
  'labelLarge',
  'labelMedium',
  'labelSmall',
  'titleLarge',
  'titleMedium',
  'titleSmall',
] as const satisfies readonly M3TypeScaleRole[];

export const M3_EMPHASIZED_ROLES = [
  'bodyLargeEmphasized',
  'bodyMediumEmphasized',
  'bodySmallEmphasized',
  'displayLargeEmphasized',
  'displayMediumEmphasized',
  'displaySmallEmphasized',
  'headlineLargeEmphasized',
  'headlineMediumEmphasized',
  'headlineSmallEmphasized',
  'labelLargeEmphasized',
  'labelMediumEmphasized',
  'labelSmallEmphasized',
  'titleLargeEmphasized',
  'titleMediumEmphasized',
  'titleSmallEmphasized',
] as const satisfies readonly M3TypeScaleRole[];

export type M3BaselineRole = (typeof M3_BASELINE_ROLES)[number];
export type M3EmphasizedRole = (typeof M3_EMPHASIZED_ROLES)[number];

/** The font family used by the gallery and Compose harness. */
export const ROBOTO_FLEX_FAMILY = 'RobotoFlex';

/**
 * Measured Roboto Flex natural line-box height at the frozen 2.625x profile:
 * displayLarge is 57 sp with a 64 sp token line height, and Compose lays the
 * line box out at 176 px = 67.03 sp (176 / (57 * 2.625) = 1.1762). Only
 * displayLarge and displayMedium fall below this ratio.
 */
export const ROBOTO_FLEX_NATURAL_LINE_HEIGHT_RATIO = 1.176;

function buildStyle(
  token: (typeof typeScale)[M3TypeScaleRole],
  options: M3TypographyOptions,
  variableFonts: boolean,
): M3TextStyle {
  const weight = token.fontWeight as M3FontWeight;
  const naturalLineHeightRatio =
    options.naturalLineHeightRatio ?? ROBOTO_FLEX_NATURAL_LINE_HEIGHT_RATIO;
  const style: M3TextStyle = {
    fontSize: token.fontSize,
    lineHeight: Math.max(token.lineHeight, token.fontSize * naturalLineHeightRatio),
    letterSpacing: token.letterSpacing,
    includeFontPadding: false,
  };

  if (variableFonts && options.fontFamily) {
    const width = options.widthAxis ?? 100;
    if (!Number.isFinite(width) || width < 25 || width > 151) {
      throw new RangeError(`widthAxis must be between 25 and 151, received ${width}`);
    }
    style.fontFamily = options.fontFamily;
    style.fontVariationSettings =
      width === 100 ? `'wght' ${weight}` : `'wght' ${weight}, 'wdth' ${width}`;
    return Object.freeze(style);
  }

  const family = options.staticFamilies?.[weight] ?? options.fontFamily;
  if (family) {
    style.fontFamily = family;
  }
  style.fontWeight = String(weight) as M3FontWeightValue;
  return Object.freeze(style);
}

/**
 * Build the Material 3 type scale from the extracted Compose tokens.
 *
 * With no options this is the platform font with explicit 400/500/700
 * weights, matching `Typography()` on Android. Display roles whose token line
 * height is below the font's natural line box are raised to the measured
 * natural height, because Compose expands them while React Native would squash
 * them; pass `naturalLineHeightRatio: 0` for the nominal token values. Pass
 * `fontFamily` plus `variableFonts` (or `robotoFlexTypography()`) to use a
 * variable font.
 */
export function createM3Typography(options: M3TypographyOptions = {}): M3Typography {
  const naturalLineHeightRatio =
    options.naturalLineHeightRatio ?? ROBOTO_FLEX_NATURAL_LINE_HEIGHT_RATIO;
  if (!Number.isFinite(naturalLineHeightRatio) || naturalLineHeightRatio < 0) {
    throw new RangeError(
      `naturalLineHeightRatio must be a non-negative finite number, received ${naturalLineHeightRatio}`,
    );
  }
  const variableFonts = options.variableFonts ?? supportsVariableFontSettings();
  const result = {} as Record<M3TypeScaleRole, M3TextStyle>;
  for (const role of Object.keys(typeScale) as M3TypeScaleRole[]) {
    result[role] = buildStyle(typeScale[role], options, variableFonts);
  }
  return Object.freeze(result) as M3Typography;
}

/**
 * Roboto Flex with variable weights. The app must load the font under
 * `RobotoFlex` (or pass `staticFamilies` for the non-variable fallback).
 */
export function robotoFlexTypography(
  options: Omit<M3TypographyOptions, 'fontFamily'> = {},
): M3Typography {
  return createM3Typography({ ...options, fontFamily: ROBOTO_FLEX_FAMILY });
}

/**
 * Compose-faithful default: platform font, standard weights, baseline and
 * emphasized roles both present. Emphasized roles remain opt-in per ADR-006.
 * Display line heights use the natural-box floor; see
 * `naturalLineHeightRatio`.
 */
export const defaultTypography: M3Typography = createM3Typography();
