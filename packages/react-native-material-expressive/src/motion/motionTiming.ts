import { MotionDurations, type MotionKind } from './MotionScheme';
import type { SpringConfig } from './spring';

/** Reduced-motion effects animations use the Material3 short-2 duration. */
export const REDUCED_EFFECTS_FADE_MS = MotionDurations.short2;

/**
 * How a component should animate given the platform reduce-motion setting.
 *
 * Material3 still needs to convey state changes under reduced motion. Spatial
 * motion becomes instant; colour/alpha effects cross-fade over 100 ms so the
 * change stays perceptible without translation.
 */
export type MotionTiming =
  | { readonly type: 'spring'; readonly config: SpringConfig }
  | { readonly type: 'fade'; readonly durationMs: number }
  | { readonly type: 'instant' };

export function resolveMotionTiming(
  kind: MotionKind,
  reduceMotion: boolean,
  config: SpringConfig,
): MotionTiming {
  if (!reduceMotion) {
    return { type: 'spring', config };
  }
  if (kind === 'effects') {
    return { type: 'fade', durationMs: REDUCED_EFFECTS_FADE_MS };
  }
  return { type: 'instant' };
}
