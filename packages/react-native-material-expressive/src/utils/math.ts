/**
 * Clamp `value` into the inclusive range [`min`, `max`].
 *
 * Used by slider, sheet, and gesture math. No React Native imports so this
 * module stays usable from worklets.
 */
export function clamp(value: number, min: number, max: number): number {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between `start` and `end` at progress `t`.
 *
 * `t` is not clamped; callers decide whether overshoot is meaningful.
 */
export function lerp(start: number, end: number, t: number): number {
  'worklet';
  return start + (end - start) * t;
}
