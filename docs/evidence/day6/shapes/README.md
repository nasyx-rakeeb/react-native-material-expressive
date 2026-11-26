# Day 6 — Shapes core

**Status:** PASS. All 35 `MaterialShapes` and 50 Compose morph pairs at five progress
values match the JVM golden within **1e-4**; the worst shape delta is **1.329e-7**
(`Oval`) and the worst morph delta is **1.2678e-6** (`Gem -> Ghostish` at
progress 0). No rendering or pixel claim is made here; `PathCanvas` lands on Day 7.

## What was ported

The pure-TypeScript engine is a direct port of `androidx.graphics:graphics-shapes:1.1.0`
with the `MaterialShapes` definitions from `androidx.compose.material3:material3:1.5.0`.

| File | Responsibility |
|---|---|
| `src/shapes/math.ts` | Float32 helpers, points, transforms, distance/angle math |
| `src/shapes/Cubic.ts` | Cubic construction, splitting, arc/line helpers |
| `src/shapes/CornerRounding.ts` | Radius + smoothing pair |
| `src/shapes/Features.ts` | `Corner` / `Edge` features |
| `src/shapes/RoundedPolygon.ts` | Vertex/corner construction, normalization, transforms, flattening |
| `src/shapes/PolygonMeasure.ts` | Measured polygons, length measurer, cut/shift |
| `src/shapes/FeatureMapping.ts` | Feature distance, `DoubleMapper`, progress mapping |
| `src/shapes/Morph.ts` | Morph matching and cubic interpolation |
| `src/shapes/MaterialShapes.ts` | All 35 named shapes, lazy cache, public getters |
| `src/shapes/index.ts` | Public shape exports |

The module has no React Native, DOM, or Node imports. It is pure computation so it can
be workletized by the Reanimated/Worklets Babel plugin when `PathCanvas` and the
animation primitives are added on Day 7.

## Float32 fidelity

Compose's Kotlin implementation computes shape geometry in `Float`. The port emulates
that with `Math.fround` across construction, measuring, mapping, and morphing. Three
details mattered for the final parity:

1. **Float literals at the boundary.** Kotlin shape definitions use `Float` literals
   (`Offset(0.725f, -0.099f)`). JavaScript literals are doubles, so `0.725 - 0.5` was
   one Float32 ULP away from Compose's `0.725f - 0.5f`. Rounding every `pnr` point and
   every `CornerRounding` field at the boundary removed the residual geometry noise.
   This also removed the last morph failure (`Arch -> Clover4Leaf`), which had flipped
   a near-tied feature mapping.
2. **`Matrix.rotateZ` semantics.** Compose computes rotation radians in Float64
   (`degrees * 0.017453292519943295`) and then applies the resulting Float32 matrix.
   `matrixRotate` mirrors that for the `Arch`, `Oval`, `Triangle`, `Sunny`, and
   `Cookie*` transforms.
3. **Float32 feature distances and stable sort.** `featureDistSquared` returns a
   Float32 value and the distance list is sorted stably in insertion order, matching
   Kotlin's `sortedBy`.

No epsilon or tie-break hack is used. After the boundary rounding, the golden's
mapping choices are reproduced without special cases.

## Golden provenance

`apps/reference-compose/app/src/test/java/com/nasyxrakeeb/m3ereference/ShapeGoldenTest.kt`
is a JVM unit test. It reads the shapes through `MaterialShapes` and dumps:

- **35 shapes** — center, raw feature metadata (type, convexity, raw cubic count), and
  every flattened cubic control point.
- **50 morph pairs** — 35 adjacent cycle pairs plus 15 cross pairs (`i -> i + 7` for
  `i = 0..14`), sampled at progress `0, 0.25, 0.5, 0.75, 1`.

Totals: **1,168 features** (584 corners), **2,104 raw feature cubics**, **943 flattened
cubics**, and **250 morph samples / 11,730 cubic comparisons**.

`androidx.compose.material3:material3:1.5.0` resolves `graphics-shapes:1.0.1`
transitively. The reference app pins **`androidx.graphics:graphics-shapes:1.1.0`**
explicitly; without that pin the golden is generated from the older implementation and
does not match. The golden also records its source in the JSON `source` field.

Regenerate:

```bash
tools/shapes/generate-goldens.sh
```

The script reruns the JVM test and copies `app/build/shapes-goldens.json` to
`docs/specs/shapes-goldens.json`.

## Verification

`packages/react-native-material-expressive/src/shapes/__tests__/shapes.test.ts` checks:

- the 35 names in reference order;
- every shape center and flattened cubic against the golden, tolerance `1e-4`;
- every feature count, type (`corner` / `edge`), convexity, and raw cubic count;
- all 50 morphs at all five progress values, tolerance `1e-4`;
- every normalized shape stays inside the unit square.

Measured maxima on the final tree:

| Check | Result |
|---|---|
| Shape cubics/centers | max **1.329e-7** (`Oval`); next `Ghostish` 1.222e-7, `Sunny` 1.066e-7 |
| Morph cubics | max **1.2678e-6** (`Gem -> Ghostish` @ 0) |
| Failures over 1e-4 | **0 / 35 shapes**, **0 / 50 morphs** |
| Feature metadata | 1,168 / 1,168 exact (type, convexity, raw cubic count) |

Run the focused suite from the package directory:

```bash
cd packages/react-native-material-expressive
pnpm exec jest src/shapes/__tests__/shapes.test.ts --runInBand
```

Local gates on the Day 6 tree:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm scenes:check
```

`pnpm test` ran **9 suites / 92 tests**; `pnpm typecheck` 4/4; `pnpm lint` 3/3 +
`eslint tools`; `pnpm build` emitted ESM, CJS, and declarations; `pnpm scenes:check`
reported 30 typography roles / 37 scenes.

## Licensing

The ported files carry the Android Open Source Project Apache-2.0 headers and identify
`androidx.graphics:graphics-shapes:1.1.0`. `NOTICE` lists graphics-shapes 1.1.0 and
material3 1.5.0. `ShapeGoldenTest.kt` is original project code covered by the
repository's MIT `LICENSE`; it contains no copied AndroidX source.

## Limitations

- The golden is a **JVM** AndroidX dump, not an on-device Compose render. It verifies
  geometry and mapping, not rasterization.
- Morphs are sampled at five progress values. Intermediate curves are covered by the
  shared cubic interpolation, but the golden does not assert every frame.
- No shape is rendered yet. Day 7 owns `PathCanvas`, the 35-shape gallery, animated
  morphs, and the static-shape Compose diff.
- Worklet directives are not applied to the module yet; Day 7 decides where the
  computation runs and how `Morph` instances cross the JS/UI-thread boundary.
