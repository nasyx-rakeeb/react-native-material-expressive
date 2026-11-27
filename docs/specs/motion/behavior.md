# Motion behaviour (Compose Material3 1.5.0)

Facts the token extractor cannot express. Sources are pinned to
`material3:1.5.0` and its resolved `animation-core`.

## MotionScheme routing

| Scheme | `defaultSpatialSpec` | `fastSpatialSpec` | `slowSpatialSpec` | `defaultEffectsSpec` | `fastEffectsSpec` | `slowEffectsSpec` |
| --- | --- | --- | --- | --- | --- | --- |
| standard | 700 / 0.9 | 1400 / 0.9 | 300 / 0.9 | 1600 / 1.0 | 3800 / 1.0 | 800 / 1.0 |
| expressive | 380 / 0.8 | 800 / 0.6 | 200 / 0.8 | 1600 / 1.0 | 3800 / 1.0 | 800 / 1.0 |

Stiffness / damping ratio, mass = 1. Values observed from
`MotionScheme.standard()` / `.expressive()` in `SpringGoldenTest`; the same
numbers are in `StandardMotionTokens` / `ExpressiveMotionTokens`
(`commonMain/androidx/compose/material3/tokens/MotionTokens.kt`).

`MotionScheme` has exactly six `spring<Any>(dampingRatio, stiffness)` specs per
scheme (`compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/MotionScheme.kt:137-236`).
No visibility threshold is passed, so `Spring.DefaultDisplacementThreshold`
(0.01) applies (`VectorizedAnimationSpec.kt:894`).

`MaterialExpressiveTheme` defaults to `MotionScheme.expressive()`;
`MaterialTheme` defaults to `MotionScheme.standard()`
(`MaterialTheme.kt`). This library mirrors that: the provider defaults to
expressive and `motionScheme="standard"` opts out.

## Duration

`FloatSpringSpec.getDurationNanos` normalises displacement and velocity by the
0.01 visibility threshold, calls `estimateAnimationDurationMillis`, and
multiplies the whole-millisecond result by `1_000_000`
(`FloatAnimationSpec.kt:193-214`). `estimateAnimationDurationMillis` returns a
`Long` of milliseconds (`SpringEstimation.kt`).

Consequences:

- The threshold is expressed in the animated value's unit, not the token unit.
  Animating a `Dp` value therefore uses a 0.01 dp cutoff; animating pixels uses
  0.01 px. The driver takes the value in whatever unit the caller animates.
- A non-zero interruption velocity changes the estimated duration. The golden
  records `2.5` and `-2.5` scenarios: standard defaultSpatial is 228 ms at rest,
  224 ms with `+2.5`, and 231 ms with `-2.5`.

## Sampling

In the 1.5.0 bytecode, `FloatSpringSpec.getValueFromNanos` computes
`deltaTSeconds = (playTimeNanos / 1_000_000) / 1000`, i.e. it **truncates to
whole milliseconds before evaluating the closed form**. The experimental
nanosecond flag in `androidx-main` is absent. The TypeScript solver does the
same (`Math.floor(elapsedMillis) / 1000`).

`SpringSimulation.updateValues` always evaluates the closed form and never
clamps. `TargetBasedAnimation.getValueFromNanos` checks
`playTimeNanos >= durationNanos` first and returns the target exactly
(`Animation.kt`); `springValueAtMillis` mirrors that check.

## Float32 boundary

`SpringSimulation` stores `finalPosition` and `dampingRatio` as `Float`, computes
`naturalFreq` and the coefficients as `Double`, and returns a packed
`Motion(value: Float, velocity: Float)`. The solver applies `Math.fround` to:

- stiffness and damping ratio,
- initial and final value,
- the normalised velocity and displacement in the duration estimator,
- the returned value and velocity.

This is why the JVM golden and the TypeScript trace agree to `5e-10` rather
than `1e-16`.

## Underdamped overshoot

All spatial tokens have `dampingRatio < 1` and overshoot the target:

- `0.9` → first overshoot ≈ 0.15 % (standard spatial)
- `0.8` → ≈ 1.52 % (expressive default/slow spatial)
- `0.6` → ≈ 9.48 % (expressive fast spatial)

Effects tokens are critically damped (`1.0`) and never overshoot. Components
that animate alpha or colour can therefore use effects springs without clamping;
spatial callers must be prepared for the overshoot (the loading indicator uses
it deliberately).

## Reanimated comparison

Reanimated 4.7.1 uses the same underdamped/critically damped closed form, but:

- it terminates on `currentEnergy / initialEnergy <= 6e-9`
  (`springUtils.js:266-285`), not on a displacement threshold and estimated
  duration;
- its frame loop advances by the real frame delta clamped to 64 ms
  (`spring.js:62-66`), not by a fixed 1 ms play time.

Measured against the golden: every token settles roughly twice as late
(107 ms → 217 ms, 228 ms → 450 ms, 452 ms → 917 ms), and 2 of 12 tokens exceed
the 1 % trace gate while Compose is still animating (fastEffects, 1.512 %).
That is why the library ships `withComposeSpring` instead of stock
`withSpring` (ADR-015).

## Reduce motion

Compose Material3 1.5.0 has no reduce-motion API; Android's animator duration
scale normally drives all animations to zero. This library reads
`AccessibilityInfo.isReduceMotionEnabled` (Android's
`transition_animation_scale == 0`) and maps motion as documented in ADR-016:
spatial → instant, effects → 100 ms linear fade.
