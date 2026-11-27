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

/**
 * A timing decision that can also ask the caller to wait. `hold` is returned
 * before the platform has answered the reduce-motion query; the caller must
 * leave its value at the starting point until the next decision.
 */
export type ResolvedMotionTiming = MotionTiming | { readonly type: 'hold' };

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

/**
 * Resolve a spring timing from the full reduce-motion state.
 *
 * The platform query is asynchronous. Returning `hold` lets a component keep
 * its first animation queued instead of guessing `false` and showing one
 * frame of full motion to a reduce-motion user.
 */
export function resolveMotionTimingForState(
  kind: MotionKind,
  state: { readonly enabled: boolean; readonly ready: boolean },
  config: SpringConfig,
): ResolvedMotionTiming {
  if (!state.ready) {
    return { type: 'hold' };
  }
  return resolveMotionTiming(kind, state.enabled, config);
}
