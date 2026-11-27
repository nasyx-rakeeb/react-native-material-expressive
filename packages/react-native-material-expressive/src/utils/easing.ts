/**
 * Pure cubic-bezier easing, used where an animation frame must be evaluated
 * synchronously (static diff scenes, tests) instead of by the animation driver.
 *
 * Mirrors Compose `CubicBezierEasing`; `FastOutSlowIn` is the Material
 * `cubic-bezier(0.4, 0, 0.2, 1)` curve.
 */

function sampleCurve(a: number, b: number, t: number): number {
  'worklet';
  // Polynomial form of a cubic bezier with endpoints 0 and 1.
  return ((1 - 3 * b + 3 * a) * t + (3 * b - 6 * a)) * t * t + 3 * a * t;
}

function sampleDerivative(a: number, b: number, t: number): number {
  'worklet';
  return 3 * (1 - 3 * b + 3 * a) * t * t + 2 * (3 * b - 6 * a) * t + 3 * a;
}

/**
 * Evaluate `cubic-bezier(x1, y1, x2, y2)` at `x` in [0, 1].
 *
 * Solves x(t) = x with Newton-Raphson and falls back to bisection when the
 * derivative is too small, matching the usual browser/Compose implementation.
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number, x: number): number {
  'worklet';
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  let t = x;
  for (let iteration = 0; iteration < 8; iteration += 1) {
    const error = sampleCurve(x1, x2, t) - x;
    if (Math.abs(error) < 1e-6) {
      return sampleCurve(y1, y2, t);
    }
    const derivative = sampleDerivative(x1, x2, t);
    if (Math.abs(derivative) < 1e-6) {
      break;
    }
    t -= error / derivative;
  }

  let low = 0;
  let high = 1;
  t = x;
  for (let iteration = 0; iteration < 20; iteration += 1) {
    const value = sampleCurve(x1, x2, t);
    if (Math.abs(value - x) < 1e-6) {
      break;
    }
    if (value < x) {
      low = t;
    } else {
      high = t;
    }
    t = (low + high) / 2;
  }
  return sampleCurve(y1, y2, t);
}

/** Compose `FastOutSlowInEasing` (`cubic-bezier(0.4, 0, 0.2, 1)`). */
export function fastOutSlowIn(x: number): number {
  'worklet';
  return cubicBezier(0.4, 0, 0.2, 1, x);
}
