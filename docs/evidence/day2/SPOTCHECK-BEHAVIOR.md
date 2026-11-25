# Day 2 behavior-critical spot-check (extended 20)

**Date:** 2026-11-25. **Result:** 17/20 matched, 3 diverged. **Plan:** `behavior-spotcheck-plan.json`.

The original 20-value sample covered typography, color, shape (2), elevation, motion (3, including 2 standard springs), and state (2). It did **not** cover component sizes or paddings. This extension adds 20 behavior-critical values:

- **15 button size/padding values** across XS, S, M, L, and XL.
- **3 shape corner values** (extra small, medium, large).
- **2 standard spring values** (fast spatial damping, default effects stiffness).

It is a **coverage sample, not a random sample**: every expressive button size is represented, and the three shared behavior categories are represented. The goal is to catch a wrong size/padding before layout work, not to estimate a distribution.

## Results

| # | Category | Compose token | Compose | m3 token / row | m3 | Result | Compose source | m3 evidence |
|---:|---|---|---:|---|---:|---|---|---|
| 1 | component-size | `ButtonSmall.ContainerHeight` | 40dp | `md.comp.button.small.container.height` | 40 | match | `commonMain/androidx/compose/material3/tokens/ButtonSmallTokens.kt:24` | m3/buttons-token-values.json (https://m3.material.io/components/buttons/specs) |
| 2 | component-padding | `ButtonSmall.LeadingSpace` | 16dp | `md.comp.button.small.leading-space` | 16 | match | `commonMain/androidx/compose/material3/tokens/ButtonSmallTokens.kt:39` | m3/buttons-token-values.json (https://m3.material.io/components/buttons/specs) |
| 3 | component-padding | `ButtonSmall.IconLabelSpace` | 8dp | `md.comp.button.small.icon-label-space` | 8 | match | `commonMain/androidx/compose/material3/tokens/ButtonSmallTokens.kt:33` | m3/buttons-token-values.json (https://m3.material.io/components/buttons/specs) |
| 4 | component-size | `ButtonMedium.ContainerHeight` | 56dp | `md.comp.button.medium.container.height` | 56 | match | `commonMain/androidx/compose/material3/tokens/ButtonMediumTokens.kt:24` | m3/buttons-token-values.json (https://m3.material.io/components/buttons/specs) |
| 5 | component-padding | `ButtonMedium.LeadingSpace` | 24dp | `md.comp.button.medium.leading-space` | 24 | match | `commonMain/androidx/compose/material3/tokens/ButtonMediumTokens.kt:39` | m3/buttons-token-values.json (https://m3.material.io/components/buttons/specs) |
| 6 | component-size | `ButtonMedium.IconSize` | 24dp | `md.comp.button.medium.icon.size` | 24 | match | `commonMain/androidx/compose/material3/tokens/ButtonMediumTokens.kt:36` | m3/buttons-token-values.json (https://m3.material.io/components/buttons/specs) |
| 7 | component-size | `ButtonLarge.ContainerHeight` | 96dp | `md.comp.button.large.container.height` | 96 | match | `commonMain/androidx/compose/material3/tokens/ButtonLargeTokens.kt:24` | m3/buttons-token-values.json (https://m3.material.io/components/buttons/specs) |
| 8 | component-padding | `ButtonLarge.LeadingSpace` | 48dp | `md.comp.button.large.leading-space` | 48 | match | `commonMain/androidx/compose/material3/tokens/ButtonLargeTokens.kt:39` | m3/buttons-token-values.json (https://m3.material.io/components/buttons/specs) |
| 9 | component-padding | `ButtonLarge.IconLabelSpace` | 12dp | `md.comp.button.large.icon-label-space` | 12 | match | `commonMain/androidx/compose/material3/tokens/ButtonLargeTokens.kt:33` | m3/buttons-token-values.json (https://m3.material.io/components/buttons/specs) |
| 10 | component-size | `ButtonXLarge.ContainerHeight` | 136dp | `md.comp.button.xlarge.container.height` | 136 | match | `commonMain/androidx/compose/material3/tokens/ButtonXLargeTokens.kt:24` | m3/buttons-token-values.json (https://m3.material.io/components/buttons/specs) |
| 11 | component-padding | `ButtonXLarge.LeadingSpace` | 64dp | `md.comp.button.xlarge.leading-space` | 64 | match | `commonMain/androidx/compose/material3/tokens/ButtonXLargeTokens.kt:39` | m3/buttons-token-values.json (https://m3.material.io/components/buttons/specs) |
| 12 | component-size | `ButtonXSmall.ContainerHeight` | 32dp | `md.comp.button.xsmall.container.height` | 32 | match | `commonMain/androidx/compose/material3/tokens/ButtonXSmallTokens.kt:24` | m3/buttons-token-values.json (https://m3.material.io/components/buttons/specs) |
| 13 | component-padding | `ButtonXSmall.LeadingSpace` | 16dp | `md.comp.button.xsmall.leading-space` | 12 | **diverged** | `commonMain/androidx/compose/material3/tokens/ButtonXSmallTokens.kt:39` | m3/buttons-token-values.json (https://m3.material.io/components/buttons/specs) |
| 14 | component-padding | `ButtonXSmall.TrailingSpace` | 16dp | `md.comp.button.xsmall.trailing-space` | 12 | **diverged** | `commonMain/androidx/compose/material3/tokens/ButtonXSmallTokens.kt:54` | m3/buttons-token-values.json (https://m3.material.io/components/buttons/specs) |
| 15 | component-padding | `ButtonXSmall.IconLabelSpace` | 8dp | `md.comp.button.xsmall.icon-label-space` | 4 | **diverged** | `commonMain/androidx/compose/material3/tokens/ButtonXSmallTokens.kt:33` | m3/buttons-token-values.json (https://m3.material.io/components/buttons/specs) |
| 16 | shape | `Shape.CornerExtraSmall` | 4dp | `Extra small corner value` | 4 | match | `commonMain/androidx/compose/material3/tokens/ShapeTokens.kt:38` | m3/shape-corner-radius-scale.txt |
| 17 | shape | `Shape.CornerMedium` | 12dp | `Medium corner value` | 12 | match | `commonMain/androidx/compose/material3/tokens/ShapeTokens.kt:70` | m3/shape-corner-radius-scale.txt |
| 18 | shape | `Shape.CornerLarge` | 16dp | `Large corner value` | 16 | match | `commonMain/androidx/compose/material3/tokens/ShapeTokens.kt:47` | m3/shape-corner-radius-scale.txt |
| 19 | spring | `StandardMotion.SpringFastSpatialDamping` | 0.9 | `Motion spring fast spatial damping` | 0.9 | match | `commonMain/androidx/compose/material3/tokens/StandardMotionTokens.kt:24` | m3/motion-easing-duration-tokens.txt |
| 20 | spring | `StandardMotion.SpringDefaultEffectsStiffness` | 1600 | `Motion spring default effects stiffness` | 1600 | match | `commonMain/androidx/compose/material3/tokens/StandardMotionTokens.kt:23` | m3/motion-easing-duration-tokens.txt |

## Divergences

- `ButtonXSmall.LeadingSpace`: Compose **16** vs m3 **12** (md.comp.button.xsmall.leading-space). Recorded as **U-22**; Compose 1.5.0 remains the 1.0 fidelity authority (Core Rule 1), but Day 11 Button must not claim m3 parity for the XS padding without resolving this.
- `ButtonXSmall.TrailingSpace`: Compose **16** vs m3 **12** (md.comp.button.xsmall.trailing-space). Recorded as **U-22**; Compose 1.5.0 remains the 1.0 fidelity authority (Core Rule 1), but Day 11 Button must not claim m3 parity for the XS padding without resolving this.
- `ButtonXSmall.IconLabelSpace`: Compose **8** vs m3 **4** (md.comp.button.xsmall.icon-label-space). Recorded as **U-22**; Compose 1.5.0 remains the 1.0 fidelity authority (Core Rule 1), but Day 11 Button must not claim m3 parity for the XS padding without resolving this.

## Why this matters for Day 3+

- These are the values that set container heights, hit areas, icon/label gaps, and corner geometry. A color-only spot-check would not catch a wrong button height or a wrong XS padding.
- Shape and spring values were already represented in the original sample; this extension repeats them with different rows so the behavior set is self-contained.
- m3's token tables are a secondary source. Compose 1.5.0 wins on conflict; the divergence is logged rather than smoothed over.
- Button XS is the only divergent size set found. The m3 page's XS leading/trailing space is 12dp and icon-label space is 4dp; Compose 1.5.0's `ButtonXSmallTokens` uses 16dp and 8dp. Do not silently “fix” either side; resolve the intent on Day 11 with the Button behavior spec.

## Evidence

- `m3/buttons-token-values.json` — 67 `md.comp.button.*` length/number/shape values read from the rendered buttons specs page's embedded resolved token JSON (Chrome 158 headless, 2026-11-25).
- `m3/buttons-specs.txt` — visible text of the rendered buttons specs page.
- `m3/shape-corner-radius-scale.txt` — shape corner table.
- `m3/motion-easing-duration-tokens.txt` — standard spring table.
