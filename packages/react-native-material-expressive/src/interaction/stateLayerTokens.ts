import { state as stateTokens } from '../tokens/generated/global';
import type { InteractionStateName } from './interactionState';

/**
 * Material3 1.5.0 state-layer opacities.
 *
 * Source: `material3/.../tokens/StateTokens.kt:21-25`.
 * `pressed` is included for non-ripple surfaces; Compose's default press
 * visual is the ripple, which uses the same 0.10 alpha.
 */
export const STATE_LAYER_OPACITY = Object.freeze({
  hover: stateTokens.hover,
  focus: stateTokens.focus,
  pressed: stateTokens.pressed,
  dragged: stateTokens.dragged,
  default: 0,
  disabled: 0,
} as const);

export interface StateLayerAnimationSpec {
  readonly durationMs: number;
  readonly easing: 'linear';
}

/**
 * Compose state-layer tween durations.
 *
 * Source: `material3-ripple/.../ripple/Ripple.kt:474-494`.
 * - hover: 15 ms linear in/out (the default tween)
 * - focus: 45 ms linear in, 15 ms linear out
 * - drag: 45 ms linear in, 150 ms linear out
 * - press: 15 ms linear (the ripple handles the press visual)
 */
export function stateLayerAnimation(
  from: InteractionStateName,
  to: InteractionStateName,
): StateLayerAnimationSpec {
  if (to === 'dragged') {
    return { durationMs: 45, easing: 'linear' };
  }
  if (from === 'dragged') {
    return { durationMs: 150, easing: 'linear' };
  }
  if (to === 'focus') {
    return { durationMs: 45, easing: 'linear' };
  }
  return { durationMs: 15, easing: 'linear' };
}

export function stateLayerOpacity(state: InteractionStateName): number {
  return STATE_LAYER_OPACITY[state];
}

/** The content colour used for the state layer; callers pass the theme role. */
export function stateLayerColor(contentColor: string): string {
  return contentColor;
}
