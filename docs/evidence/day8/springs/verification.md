# Day 8 spring traces

Reference: `docs/specs/motion/goldens.json`, generated from
`androidx.compose.material3:material3:1.5.0` by `SpringGoldenTest` through the
public `MotionScheme` API, `SpringSpec`, and `FiniteAnimationSpec.vectorize(Float.VectorConverter)`.
Script: `tools/motion/verify-traces.mjs`; regenerate the golden with
`tools/motion/generate-goldens.sh`.

## Compose solver vs golden

| scheme | token | k | ζ | duration | samples | max abs | % of range |
| --- | --- | --- | --- | --- | --- | --- | --- |
| standard | defaultSpatial | 700 | 0.899999976 | 228 ms | 231 | 4.98e-10 | 4.98e-8% |
| standard | fastSpatial | 1400 | 0.899999976 | 161 ms | 164 | 4.99e-10 | 4.99e-8% |
| standard | slowSpatial | 300 | 0.899999976 | 348 ms | 351 | 5.00e-10 | 5.00e-8% |
| standard | defaultEffects | 1600 | 1 | 165 ms | 168 | 4.97e-10 | 4.97e-8% |
| standard | fastEffects | 3800 | 1 | 107 ms | 110 | 4.93e-10 | 4.93e-8% |
| standard | slowEffects | 800 | 1 | 234 ms | 237 | 4.93e-10 | 4.93e-8% |
| expressive | defaultSpatial | 380 | 0.800000012 | 328 ms | 331 | 4.99e-10 | 4.99e-8% |
| expressive | fastSpatial | 800 | 0.600000024 | 284 ms | 287 | 4.97e-10 | 4.97e-8% |
| expressive | slowSpatial | 200 | 0.800000012 | 452 ms | 455 | 4.99e-10 | 4.99e-8% |
| expressive | defaultEffects | 1600 | 1 | 165 ms | 168 | 4.97e-10 | 4.97e-8% |
| expressive | fastEffects | 3800 | 1 | 107 ms | 110 | 4.93e-10 | 4.93e-8% |
| expressive | slowEffects | 800 | 1 | 234 ms | 237 | 4.93e-10 | 4.93e-8% |

Solver result: **PASS** — all durations exact, all samples within 0.0001% of the animated range (gate: 1%).

## Interrupted springs (initial velocity)

| scenario | v₀ | duration | max abs | % of range |
| --- | --- | --- | --- | --- |
| standard-default-spatial | 2.50 | 224 ms | 4.98e-10 | 4.98e-8% |
| standard-default-spatial-negative | -2.50 | 231 ms | 5.00e-10 | 5.00e-8% |
| expressive-fast-spatial | 2.50 | 281 ms | 4.99e-10 | 4.99e-8% |
| expressive-fast-spatial-negative | -2.50 | 287 ms | 4.99e-10 | 4.99e-8% |

Interruption result: **PASS**

## Reanimated 4.7.1 stock `withSpring`

Reanimated uses the same closed form but terminates on an energy ratio (`6e-9`) instead of
Material3's 0.01 displacement threshold and estimated duration. Deviation is measured only
while Compose is still animating; the settle column shows the rest-time mismatch.

| token | Compose duration | Reanimated settle | active samples | max active deviation | < 1% |
| --- | --- | --- | --- | --- | --- |
| standard.defaultSpatial | 228 ms | 450 ms | 14 | 0.577% | yes |
| standard.fastSpatial | 161 ms | 317 ms | 10 | 0.869% | yes |
| standard.slowSpatial | 348 ms | 683 ms | 21 | 0.452% | yes |
| standard.defaultEffects | 165 ms | 317 ms | 10 | 0.906% | yes |
| standard.fastEffects | 107 ms | 217 ms | 7 | 1.512% | no |
| standard.slowEffects | 234 ms | 450 ms | 15 | 0.549% | yes |
| expressive.defaultSpatial | 328 ms | 667 ms | 20 | 0.539% | yes |
| expressive.fastSpatial | 284 ms | 583 ms | 18 | 0.763% | yes |
| expressive.slowSpatial | 452 ms | 917 ms | 28 | 0.396% | yes |
| expressive.defaultEffects | 165 ms | 317 ms | 10 | 0.906% | yes |
| expressive.fastEffects | 107 ms | 217 ms | 7 | 1.512% | no |
| expressive.slowEffects | 234 ms | 450 ms | 15 | 0.549% | yes |

Go/no-go: **2/12 tokens exceed 1% and every token settles later than Compose; ship the custom analytic driver**.
