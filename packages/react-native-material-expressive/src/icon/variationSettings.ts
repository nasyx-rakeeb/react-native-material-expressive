import { getVariableFontSupport } from '../typography/support';
import type { VariableFontSupport } from '../typography/types';

/**
 * Material Symbols variable axes. Ranges are the upstream font's `fvar`
 * ranges, verified against the bundled subset:
 * FILL 0–1, wght 100–700, GRAD -50–200, opsz 20–48.
 */
export interface MaterialSymbolAxes {
  /** 0 = outlined, 1 = filled. */
  fill?: 0 | 1;
  /** Stroke weight, 100–700. Default 400. */
  weight?: number;
  /** Grade, -50–200. Default 0. */
  grade?: number;
  /** Optical size, 20–48. Default 24. */
  opticalSize?: number;
}

export interface ResolvedMaterialSymbolAxes {
  fill: 0 | 1;
  weight: number;
  grade: number;
  opticalSize: number;
  /** CSS-style string accepted by RN 0.88 `fontVariationSettings`. */
  fontVariationSettings: string;
  /** Whether the running platform will apply the axes. */
  applied: boolean;
  support: VariableFontSupport;
}

function clampAxis(value: number, min: number, max: number): number {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

/**
 * Resolve and clamp Material Symbols axes for the running platform.
 *
 * React Native 0.88 forwards `fontVariationSettings` on Android and iOS; the
 * prop is accepted but ignored on Android below API 26, so this function
 * reports `applied: false` there. The returned string is still valid, which
 * keeps the component deterministic and testable.
 */
export function resolveMaterialSymbolAxes(
  axes: MaterialSymbolAxes = {},
  support: VariableFontSupport = getVariableFontSupport(),
): ResolvedMaterialSymbolAxes {
  const fill = axes.fill === 1 ? 1 : 0;
  const weight = clampAxis(Math.round(axes.weight ?? 400), 100, 700);
  const grade = clampAxis(Math.round(axes.grade ?? 0), -50, 200);
  const opticalSize = clampAxis(axes.opticalSize ?? 24, 20, 48);

  return {
    fill,
    weight,
    grade,
    opticalSize,
    fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`,
    applied: support.supported,
    support,
  };
}

/** The axis string without capability detection, for snapshots and tests. */
export function materialSymbolVariationSettings(axes: MaterialSymbolAxes = {}): string {
  return resolveMaterialSymbolAxes(axes, {
    supported: true,
    reason: 'supported',
  }).fontVariationSettings;
}
