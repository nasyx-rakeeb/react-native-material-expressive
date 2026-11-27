/**
 * Compose `SpringSimulation` and `estimateAnimationDurationMillis`, ported from
 * `androidx.compose.animation:animation-core` 1.12.0.
 *
 * Compose treats spring inputs as Float32 and evaluates the closed-form solution
 * in Float64, then narrows the position and velocity back to Float32. This module
 * mirrors that boundary so a trace can be compared numerically with Compose.
 */

/** Compose `Spring.Stiffness*`. */
export const SpringStiffness = {
  high: 10000,
  medium: 1500,
  mediumLow: 400,
  low: 200,
  veryLow: 50,
} as const;

/** Compose `Spring.DampingRatio*`. */
export const SpringDampingRatio = {
  highBouncy: 0.2,
  mediumBouncy: 0.5,
  lowBouncy: 0.75,
  noBouncy: 1,
} as const;

/** Compose `Spring.DefaultDisplacementThreshold`, in dp. */
export const DefaultSpringVisibilityThreshold = 0.01;

export interface SpringConfig {
  readonly stiffness: number;
  readonly dampingRatio: number;
}

export interface SpringMotion {
  readonly value: number;
  readonly velocity: number;
}

export function springConfig(stiffness: number, dampingRatio: number): SpringConfig {
  return Object.freeze({ stiffness, dampingRatio });
}

const MAX_LONG_MILLIS = Math.trunc(Number.MAX_SAFE_INTEGER / 1_000_000);

function isNotFinite(value: number): boolean {
  'worklet';
  return !Number.isFinite(value);
}

function iterateNewtonsMethod(
  x: number,
  fn: (t: number) => number,
  fnPrime: (t: number) => number,
): number {
  'worklet';
  return x - fn(x) / fnPrime(x);
}

/** `estimateUnderDamped` from `SpringEstimation.kt`. */
function estimateUnderDamped(
  firstRootReal: number,
  firstRootImaginary: number,
  p0: number,
  v0: number,
  delta: number,
): number {
  'worklet';
  const r = firstRootReal;
  const c1 = p0;
  const c2 = (v0 - r * c1) / firstRootImaginary;
  const c = Math.sqrt(c1 * c1 + c2 * c2);
  return Math.log(delta / c) / r;
}

/** `estimateCriticallyDamped` from `SpringEstimation.kt`. */
function estimateCriticallyDamped(
  firstRootReal: number,
  p0: number,
  v0: number,
  delta: number,
): number {
  'worklet';
  const r = firstRootReal;
  const c1 = p0;
  const c2 = v0 - r * c1;

  const t1 = Math.log(Math.abs(delta / c1)) / r;
  const guess = Math.log(Math.abs(delta / c2));
  let t = guess;
  for (let i = 0; i <= 5; i += 1) {
    t = guess - Math.log(Math.abs(t / r));
  }
  const t2 = t / r;

  let tCurr: number;
  if (isNotFinite(t1)) {
    tCurr = t2;
  } else if (isNotFinite(t2)) {
    tCurr = t1;
  } else {
    tCurr = Math.max(t1, t2);
  }

  const tInflection = -(r * c1 + c2) / (r * c2);
  const xInflection = c1 * Math.exp(r * tInflection) + c2 * tInflection * Math.exp(r * tInflection);

  let signedDelta: number;
  if (Number.isNaN(tInflection) || tInflection <= 0) {
    signedDelta = -delta;
  } else if (tInflection > 0 && -xInflection < delta) {
    if (c2 < 0 && c1 > 0) {
      tCurr = 0;
    }
    signedDelta = -delta;
  } else {
    tCurr = -(2 / r) - c1 / c2;
    signedDelta = delta;
  }

  let tDelta = Number.MAX_VALUE;
  let iterations = 0;
  while (tDelta > 0.001 && iterations < 100) {
    iterations += 1;
    const tLast = tCurr;
    tCurr = iterateNewtonsMethod(
      tCurr,
      (t) => (c1 + c2 * t) * Math.exp(r * t) + signedDelta,
      (t) => (c2 * (r * t + 1) + c1 * r) * Math.exp(r * t),
    );
    tDelta = Math.abs(tLast - tCurr);
  }
  return tCurr;
}

/** `estimateOverDamped` from `SpringEstimation.kt`. */
function estimateOverDamped(
  firstRootReal: number,
  secondRootReal: number,
  p0: number,
  v0: number,
  delta: number,
): number {
  'worklet';
  const r1 = firstRootReal;
  const r2 = secondRootReal;
  const c2 = (r1 * p0 - v0) / (r1 - r2);
  const c1 = p0 - c2;

  const t1 = Math.log(Math.abs(delta / c1)) / r1;
  const t2 = Math.log(Math.abs(delta / c2)) / r2;

  let tCurr: number;
  if (isNotFinite(t1)) {
    tCurr = t2;
  } else if (isNotFinite(t2)) {
    tCurr = t1;
  } else {
    tCurr = Math.max(t1, t2);
  }

  const tInflection = Math.log((c1 * r1) / (-c2 * r2)) / (r2 - r1);
  const xInflection = () => c1 * Math.exp(r1 * tInflection) + c2 * Math.exp(r2 * tInflection);

  let signedDelta: number;
  if (Number.isNaN(tInflection) || tInflection <= 0) {
    signedDelta = -delta;
  } else if (tInflection > 0 && -xInflection() < delta) {
    if (c2 > 0 && c1 < 0) {
      tCurr = 0;
    }
    signedDelta = -delta;
  } else {
    tCurr = Math.log(-(c2 * r2 * r2) / (c1 * r1 * r1)) / (r1 - r2);
    signedDelta = delta;
  }

  if (Math.abs(c1 * r1 * Math.exp(r1 * tCurr) + c2 * r2 * Math.exp(r2 * tCurr)) < 0.0001) {
    return tCurr;
  }

  let tDelta = Number.MAX_VALUE;
  let iterations = 0;
  while (tDelta > 0.001 && iterations < 100) {
    iterations += 1;
    const tLast = tCurr;
    tCurr = iterateNewtonsMethod(
      tCurr,
      (t) => c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t) + signedDelta,
      (t) => c1 * r1 * Math.exp(r1 * t) + c2 * r2 * Math.exp(r2 * t),
    );
    tDelta = Math.abs(tLast - tCurr);
  }
  return tCurr;
}

/** `estimateDurationSeconds` from `SpringEstimation.kt`. */
function estimateDurationSeconds(
  firstRootReal: number,
  firstRootImaginary: number,
  secondRootReal: number,
  dampingRatio: number,
  initialVelocity: number,
  initialPosition: number,
  delta: number,
): number {
  'worklet';
  if (initialPosition === 0 && initialVelocity === 0) {
    return 0;
  }
  const v0 = initialPosition < 0 ? -initialVelocity : initialVelocity;
  const p0 = Math.abs(initialPosition);

  if (dampingRatio > 1) {
    return estimateOverDamped(firstRootReal, secondRootReal, p0, v0, delta);
  }
  if (dampingRatio < 1) {
    return estimateUnderDamped(firstRootReal, firstRootImaginary, p0, v0, delta);
  }
  return estimateCriticallyDamped(firstRootReal, p0, v0, delta);
}

/**
 * `FloatSpringSpec.getDurationNanos`, returned in whole milliseconds. Compose
 * normalizes velocity and displacement by the 0.01 visibility threshold before
 * estimating, then truncates the millisecond result.
 */
export function springDurationMillis(
  config: SpringConfig,
  from: number,
  to: number,
  initialVelocity = 0,
  visibilityThreshold = DefaultSpringVisibilityThreshold,
): number {
  'worklet';
  const stiffness = Math.fround(config.stiffness);
  const dampingRatio = Math.fround(config.dampingRatio);
  if (dampingRatio === 0) {
    return MAX_LONG_MILLIS;
  }

  const threshold = Math.fround(visibilityThreshold);
  const velocity = Math.fround(Math.fround(initialVelocity) / threshold);
  const displacement = Math.fround((Math.fround(from) - Math.fround(to)) / threshold);

  const dampingCoefficient = 2 * dampingRatio * Math.sqrt(stiffness);
  const partialRoot = dampingCoefficient * dampingCoefficient - 4 * stiffness;
  const partialRootReal = partialRoot < 0 ? 0 : Math.sqrt(partialRoot);
  const partialRootImaginary = partialRoot < 0 ? Math.sqrt(Math.abs(partialRoot)) : 0;

  const firstRootReal = (-dampingCoefficient + partialRootReal) * 0.5;
  const firstRootImaginary = partialRootImaginary * 0.5;
  const secondRootReal = (-dampingCoefficient - partialRootReal) * 0.5;

  const seconds = estimateDurationSeconds(
    firstRootReal,
    firstRootImaginary,
    secondRootReal,
    dampingRatio,
    velocity,
    displacement,
    1,
  );
  return Math.trunc(seconds * 1000);
}

/**
 * `SpringSimulation.updateValuesSeconds` evaluated at an integer millisecond.
 * Compose's nanosecond API divides by 1e6 before calling this path, so the
 * timestamp is intentionally floored.
 */
export function springMotionAtMillis(
  config: SpringConfig,
  from: number,
  to: number,
  initialVelocity: number,
  elapsedMillis: number,
): SpringMotion {
  'worklet';
  const stiffness = Math.fround(config.stiffness);
  const dampingRatio = Math.fround(config.dampingRatio);
  const naturalFreq = Math.sqrt(stiffness);
  const finalPosition = Math.fround(to);
  const lastVelocity = Math.fround(initialVelocity);
  const adjustedDisplacement = Math.fround(Math.fround(from) - finalPosition);
  const dampingRatioSquared = dampingRatio * dampingRatio;
  const r = -dampingRatio * naturalFreq;
  const deltaTSeconds = Math.floor(elapsedMillis) / 1000;

  let displacement: number;
  let currentVelocity: number;
  if (dampingRatio > 1) {
    const s = naturalFreq * Math.sqrt(dampingRatioSquared - 1);
    const gammaPlus = r + s;
    const gammaMinus = r - s;
    const coeffB = (gammaMinus * adjustedDisplacement - lastVelocity) / (gammaMinus - gammaPlus);
    const coeffA = adjustedDisplacement - coeffB;
    displacement =
      coeffA * Math.exp(gammaMinus * deltaTSeconds) + coeffB * Math.exp(gammaPlus * deltaTSeconds);
    currentVelocity =
      coeffA * gammaMinus * Math.exp(gammaMinus * deltaTSeconds) +
      coeffB * gammaPlus * Math.exp(gammaPlus * deltaTSeconds);
  } else if (dampingRatio === 1) {
    const coeffA = adjustedDisplacement;
    const coeffB = lastVelocity + naturalFreq * adjustedDisplacement;
    const nFdT = -naturalFreq * deltaTSeconds;
    displacement = (coeffA + coeffB * deltaTSeconds) * Math.exp(nFdT);
    currentVelocity =
      (coeffA + coeffB * deltaTSeconds) * Math.exp(nFdT) * -naturalFreq + coeffB * Math.exp(nFdT);
  } else {
    const dampedFreq = naturalFreq * Math.sqrt(1 - dampingRatioSquared);
    const cosCoeff = adjustedDisplacement;
    const sinCoeff = (1 / dampedFreq) * (-r * adjustedDisplacement + lastVelocity);
    const dFdT = dampedFreq * deltaTSeconds;
    displacement =
      Math.exp(r * deltaTSeconds) * (cosCoeff * Math.cos(dFdT) + sinCoeff * Math.sin(dFdT));
    currentVelocity =
      displacement * r +
      Math.exp(r * deltaTSeconds) *
        (-dampedFreq * cosCoeff * Math.sin(dFdT) + dampedFreq * sinCoeff * Math.cos(dFdT));
  }

  return {
    value: Math.fround(displacement + finalPosition),
    velocity: Math.fround(currentVelocity),
  };
}

/**
 * `TargetBasedAnimation.getValueFromNanos` semantics: the raw closed-form
 * solution is clamped to the target once the estimated duration has elapsed.
 *
 * Components animate through this helper; `springMotionAtMillis` remains the
 * unclamped simulation so it can be compared with Compose's `FloatSpringSpec`.
 * Pass a precomputed `durationMs` in frame loops to avoid recalculating it.
 */
export function springValueAtMillis(
  config: SpringConfig,
  from: number,
  to: number,
  initialVelocity: number,
  elapsedMillis: number,
  durationMs: number = springDurationMillis(config, from, to, initialVelocity),
): number {
  'worklet';
  if (elapsedMillis >= durationMs) {
    return to;
  }
  return springMotionAtMillis(config, from, to, initialVelocity, elapsedMillis).value;
}
