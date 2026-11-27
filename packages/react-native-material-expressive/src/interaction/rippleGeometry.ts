import { fastOutSlowIn } from '../utils/easing';

/** Compose ripple durations and bounded extra radius. */
export const RIPPLE = Object.freeze({
  fadeInMs: 75,
  radiusMs: 225,
  fadeOutMs: 150,
  boundedExtraRadiusDp: 10,
  startRadiusFactor: 0.3,
});

export interface RippleGeometry {
  readonly width: number;
  readonly height: number;
  readonly startRadius: number;
  readonly endRadius: number;
  /** Where the press began (the centre for an unbounded ripple). */
  readonly originX: number;
  readonly originY: number;
  /** The component centre, where a bounded ripple drifts. */
  readonly centerX: number;
  readonly centerY: number;
}

/**
 * Compose `RippleAnimation` geometry:
 * start radius = 30% of the largest dimension (a diameter of 60%);
 * end radius = half the diagonal, plus 10 dp when bounded.
 *
 * Source: `material3-ripple/.../RippleAnimation.kt:157-174`.
 */
export function rippleGeometry(
  width: number,
  height: number,
  originX?: number,
  originY?: number,
  bounded = true,
): RippleGeometry {
  const centerX = width / 2;
  const centerY = height / 2;
  const startRadius = Math.max(width, height) * RIPPLE.startRadiusFactor;
  const endRadius = Math.hypot(width, height) / 2 + (bounded ? RIPPLE.boundedExtraRadiusDp : 0);
  return {
    width,
    height,
    startRadius,
    endRadius,
    originX: bounded ? (originX ?? centerX) : centerX,
    originY: bounded ? (originY ?? centerY) : centerY,
    centerX,
    centerY,
  };
}

export function rippleRadiusAt(progress: number, geometry: RippleGeometry): number {
  'worklet';
  return geometry.startRadius + (geometry.endRadius - geometry.startRadius) * progress;
}

/**
 * The deterministic frame of a ripple at `progress` (0–1) of the 225 ms
 * radius/centre animation. Alpha reaches 1 at 75 ms, then holds.
 */
export function rippleFrameAt(
  progress: number,
  geometry: RippleGeometry,
): {
  readonly radius: number;
  readonly centerX: number;
  readonly centerY: number;
  readonly alpha: number;
} {
  'worklet';
  const p = Math.min(1, Math.max(0, progress));
  const eased = fastOutSlowIn(p);
  return {
    radius: rippleRadiusAt(eased, geometry),
    centerX: geometry.originX + (geometry.centerX - geometry.originX) * p,
    centerY: geometry.originY + (geometry.centerY - geometry.originY) * p,
    alpha: Math.min(1, (p * RIPPLE.radiusMs) / RIPPLE.fadeInMs),
  };
}
