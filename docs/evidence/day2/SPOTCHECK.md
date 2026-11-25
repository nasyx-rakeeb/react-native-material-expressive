# Day 2 spot-check: 20 random values against m3.material.io

**Date:** 2026-11-25. **Result:** 20/20 matched. **Seed:** `m3e-day2-2026-11-25`.

The sample was drawn by `tools/extract-tokens/src/spotcheck.ts` (mulberry32 seeded by an FNV-1a hash of the seed string) from the committed specs, stratified so every category is verifiable on m3.material.io. The reproducible plan is `spotcheck-plan.json`. Regenerate with:

```sh
pnpm --filter @react-native-material-expressive/extract-tokens spotcheck
```

The m3 values below were read from rendered pages captured in `m3/` (see `m3/README.md` for URLs and method). Compose values are from the cited `docs/specs` records, themselves generated from `material3:1.5.0-sources.jar` (SHA-256 `d389bb54…b2a6`).

| # | Category | Token | Compose value | m3.material.io value | Result | Compose source | m3 evidence |
|---:|---|---|---|---|---|---|---|
| 1 | Typography | `Typography.labelMedium.fontWeight` | 500 | 500 (Label Medium font weight) | match | `TypeScaleTokens.kt:186` | `m3/typography-type-scale-tokens.txt` |
| 2 | Typography | `Typography.bodySmallEmphasized.fontWeight` | 500 | 500 (Emphasized Body Small weight) | match | `TypeScaleTokens.kt:292` | `m3/typography-type-scale-tokens.txt` |
| 3 | Typography | `Typography.titleSmallEmphasized.lineHeight` | 20sp | 20pt (Emphasized Title Small line height) | match | `TypeScaleTokens.kt:463` | `m3/typography-type-scale-tokens.txt` |
| 4 | Typography | `Typography.bodyLargeEmphasized.fontWeight` | 500 | 500 (Emphasized Body Large weight) | match | `TypeScaleTokens.kt:262` | `m3/typography-type-scale-tokens.txt` |
| 5 | Typography | `Typography.labelSmall.lineHeight` | 16sp | 16pt (Label Small line height) | match | `TypeScaleTokens.kt:192` | `m3/typography-type-scale-tokens.txt` |
| 6 | Typography | `Typography.bodySmallEmphasized.lineHeight` | 16sp | 16pt (Emphasized Body Small line height) | match | `TypeScaleTokens.kt:283` | `m3/typography-type-scale-tokens.txt` |
| 7 | Color (light) | `ColorLight.SurfaceContainerHigh` | `#ECE6F0` | `#ECE6F0` (Surface Container High) | match | `ColorLightTokens.kt:133` | `m3/color-baseline-light.txt` |
| 8 | Color (light) | `ColorLight.SecondaryFixedDim` | `#CCC2DC` | `#CCC2DC` (Secondary fixed dim) | match | `ColorLightTokens.kt:121` | `m3/color-baseline-light.txt` |
| 9 | Color (dark) | `ColorDark.SurfaceContainer` | `#211F26` | `#211F26` (Surface Container) | match | `ColorDarkTokens.kt:130` | `m3/color-baseline-dark.txt` |
| 10 | Color (light) | `ColorLight.SurfaceDim` | `#DED8E1` | `#DED8E1` (Surface Dim) | match | `ColorLightTokens.kt:145` | `m3/color-baseline-light.txt` |
| 11 | Color (light) | `ColorLight.Primary` | `#6750A4` | `#6750A4` (Primary) | match | `ColorLightTokens.kt:97` | `m3/color-baseline-light.txt` |
| 12 | Color (dark) | `ColorDark.OnPrimaryFixed` | `#21005D` | `#21005D` (On primary fixed) | match | `ColorDarkTokens.kt:55` | `m3/color-baseline-dark.txt` |
| 13 | Shape | `Shape.CornerLargeIncreased` | 20dp | 20dp (Large increased corner value) | match | `ShapeTokens.kt:55` | `m3/shape-corner-radius-scale.txt` |
| 14 | Shape | `Shape.CornerExtraLarge` | 28dp | 28dp (Extra large corner value) | match | `ShapeTokens.kt:29` | `m3/shape-corner-radius-scale.txt` |
| 15 | Elevation | `Elevation.Level1` | 1dp | 1dp (elevation level 1) | match | `ElevationTokens.kt:27` | `m3/elevation-tokens.txt` |
| 16 | Motion | `Motion.EasingLegacyAccelerateCubicBezier` | `[0.4, 0, 1, 1]` | `(0.4, 0, 1, 1)` (legacy accelerate) | match | `MotionTokens.kt:52` | `m3/motion-easing-duration-tokens.txt` + embedded resolved token JSON |
| 17 | Motion | `StandardMotion.SpringDefaultSpatialStiffness` | 700 | 700 (default spatial stiffness) | match | `StandardMotionTokens.kt:21` | `m3/motion-easing-duration-tokens.txt` |
| 18 | Motion | `StandardMotion.SpringFastEffectsDamping` | 1 | 1 (fast effects damping) | match | `StandardMotionTokens.kt:26` | `m3/motion-easing-duration-tokens.txt` |
| 19 | State | `State.PressedStateLayerOpacity` | 0.1 | 0.1 (Pressed state layer opacity) | match | `StateTokens.kt:25` | `m3/state-layers.txt` |
| 20 | State | `State.FocusStateLayerOpacity` | 0.1 | 0.1 (Focus state layer opacity) | match | `StateTokens.kt:23` | `m3/state-layers.txt` |

## Behavior-critical extension

The original sample included **2 shape** and **3 motion** values (2 of them standard springs), but it did **not** include component sizes or paddings. A second 20-value coverage check was run on 2026-11-25: 15 button size/padding values across XS–XL, 3 shape corner values, and 2 standard spring values. Result: **17/20 matched, 3 diverged**. The three divergences are Compose 1.5.0 XS button paddings vs m3, recorded as `U-22`; see `SPOTCHECK-BEHAVIOR.md`.

## Notes and divergences observed while sampling

- **Typography units.** The m3 table prints `pt`, Compose prints `sp`. The numeric values are identical for all sampled rows; the unit names are platform typography conventions, not a value difference.
- **Legacy easing visibility.** The rendered m3 page shows legacy easing as cubic-bezier swatches without numeric text. Row 16 uses the page's embedded resolved token JSON for `md.sys.motion.easing.legacy.accelerate`; the visual swatch is consistent. This is recorded rather than silently treated as printed text.
- **Emphasized easing is not a cubic bezier on m3.** The m3 emphasized Android easing is a multi-segment `pathInterpolator`, and its CSS column says "N/A (Use Standard as a fallback)". Compose 1.5.0 exposes `EasingEmphasizedCubicBezier = (0.2, 0, 0, 1)`, the standard fallback. This is expected, not a defect; it is logged in `docs/UNVERIFIED.md` so nobody mistakes it for a fidelity miss.
- **Site CSS is not spec.** m3.material.io's own `--mio-theme-v2-*` UI variables use variable-font settings (for example Body Large tracking `0`) that differ from its token tables. Only the token tables and embedded token values were used as evidence.
