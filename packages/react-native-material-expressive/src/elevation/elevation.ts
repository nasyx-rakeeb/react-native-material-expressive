import { elevation as elevationTokens } from '../tokens/generated/global';
import { colorsEqual, compositeOver, parseHexColor, toHexColor } from '../utils/color';

/** Compose `ElevationTokens.Level0..Level5`, in dp. */
export const ELEVATION_LEVELS = Object.freeze([
  elevationTokens.level0,
  elevationTokens.level1,
  elevationTokens.level2,
  elevationTokens.level3,
  elevationTokens.level4,
  elevationTokens.level5,
] as const);

export type ElevationLevel = 0 | 1 | 2 | 3 | 4 | 5;

/** Convert a Material elevation level (0–5) to its dp value. */
export function elevationLevelToDp(level: ElevationLevel): number {
  return ELEVATION_LEVELS[level];
}

/**
 * Compose `ColorScheme.surfaceColorAtElevation`:
 *
 * `alpha = ((4.5 * ln(elevation + 1)) + 2) / 100`
 * then composite `surfaceTint` at that alpha over `surface`.
 *
 * Source: `ColorScheme.kt:1157-1160` in material3 1.5.0. Compose only applies
 * the overlay when the container colour equals `ColorScheme.surface`; callers
 * must preserve that condition.
 */
export function surfaceColorAtElevation(
  surface: string,
  surfaceTint: string,
  elevationDp: number,
): string {
  'worklet';
  if (elevationDp <= 0) {
    return surface;
  }
  const alpha = (4.5 * Math.log(elevationDp + 1) + 2) / 100;
  const tint = { ...parseHexColor(surfaceTint), a: alpha };
  return toHexColor(compositeOver(tint, parseHexColor(surface)));
}

/**
 * The tonal colour a Material surface should paint.
 *
 * Mirrors `Surface.kt` / `ColorScheme.surfaceColorAtElevation`: the tint
 * overlay applies only when the requested container colour is exactly the
 * scheme's `surface` role. Other container roles keep their own colour.
 */
export function resolveSurfaceColor(
  baseColor: string,
  surfaceColor: string,
  surfaceTint: string,
  elevationDp: number,
): string {
  'worklet';
  if (elevationDp <= 0 || !colorsEqual(baseColor, surfaceColor)) {
    return baseColor;
  }
  return surfaceColorAtElevation(baseColor, surfaceTint, elevationDp);
}

/**
 * iOS shadow approximation for an Android elevation value.
 *
 * Compose/Android elevation is a native RenderNode property with an ambient
 * and spot shadow. React Native's iOS shadow props cannot reproduce that
 * model. These values are a visual approximation only; the docs and evidence
 * call it an approximation and never a pixel match.
 */
export interface IosShadow {
  readonly shadowColor: string;
  readonly shadowOpacity: number;
  readonly shadowRadius: number;
  readonly shadowOffset: { readonly width: number; readonly height: number };
}

export function elevationToIosShadow(elevationDp: number): IosShadow {
  if (elevationDp <= 0) {
    return {
      shadowColor: '#000000',
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
    };
  }
  return {
    shadowColor: '#000000',
    shadowOpacity: Math.min(0.22, 0.05 + elevationDp * 0.012),
    shadowRadius: elevationDp * 1.5,
    shadowOffset: { width: 0, height: Math.max(1, Math.round(elevationDp * 0.5)) },
  };
}
