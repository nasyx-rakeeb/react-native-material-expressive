# Motion specs

`goldens.json` is the Day 8 spring reference, generated from the pinned
`androidx.compose.material3:material3:1.5.0` artifact.

It is produced by `apps/reference-compose/app/src/test/java/com/nasyxrakeeb/m3ereference/SpringGoldenTest.kt`
through the **public** `MotionScheme` API:

- `MotionScheme.standard()` / `MotionScheme.expressive()`
- all six accessors (`defaultSpatialSpec`, `fastSpatialSpec`, `slowSpatialSpec`,
  `defaultEffectsSpec`, `fastEffectsSpec`, `slowEffectsSpec`)
- `FiniteAnimationSpec.vectorize(Float.VectorConverter)`
- `VectorizedFiniteAnimationSpec.getValueFromNanos` at every whole millisecond
- `SpringSpec.stiffness` / `SpringSpec.dampingRatio` recorded per token

No spring constant is copied into the generator; the golden is the observed
behaviour of the artifact. `tools/motion/verify-traces.mjs` compares the
TypeScript solver with this file, and `src/motion/__tests__/spring.test.ts` does
the same under Jest.

## Schema

```jsonc
{
  "schema": 1,
  "source": "androidx.compose.material3:material3:1.5.0",
  "from": 0.0,
  "to": 1.0,
  "schemes": {
    "standard": {
      "defaultSpatial": {
        "stiffness": 700.0,
        "dampingRatio": 0.899999976,   // Float32 from the artifact
        "durationMs": 228,             // estimateAnimationDurationMillis
        "initialVelocity": 0.0,
        "samples": [[0, 0.0], [1, 0.000344489], ...]
      }
      // ... five more tokens
    },
    "expressive": { /* six tokens */ }
  },
  "velocityScenarios": [
    {
      "name": "standard-default-spatial",
      "stiffness": 700.0,
      "dampingRatio": 0.899999976,
      "durationMs": 224,             // interruption shortens the duration
      "initialVelocity": 2.5,
      "samples": [[0, 0.0], ...]
    }
    // + negative velocity and expressive fastSpatial
  ]
}
```

Samples cover `0 .. durationMs + 2` at 1 ms and are the raw closed-form
solution, **not** clamped to the target. Clamping is the animation driver's
job (`TargetBasedAnimation.getValueFromNanos` returns the target once play time
reaches `durationNanos`), and it is implemented in
`springValueAtMillis` / `withComposeSpring`.

## Regenerate

```sh
tools/motion/generate-goldens.sh
node tools/motion/verify-traces.mjs
pnpm --filter react-native-material-expressive test
```

The JVM test is offline; it does not need the emulator.

## Machine-specific values

The `.js` / `.ts` solver uses double arithmetic and emulates the Float32
boundary of `SpringSimulation` with `Math.fround` on the API inputs and outputs.
The residual against the JVM golden is `≤5.0e-10` across all 2,861 samples,
i.e. `≤5.0e-8 %` of the animated range. Do not tighten the comparison to exact
double equality; Compose's simulation is Float32 at the boundary.

## Version pin

`material3:1.5.0` resolves `animation-core` transitively. The release artifact
evaluates `FloatSpringSpec` at whole milliseconds unconditionally — the
`isNanosecondAnimationSpecEnabled` flag in `androidx-main` is not present in the
1.5.0 bytecode. Re-check this when the baseline version moves.
