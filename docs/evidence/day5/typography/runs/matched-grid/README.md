# Day 5 — typography, matched rendering grid

**Generated:** 2026-11-26T07:48:56.979Z
**Profile:** M3E_API31, API 31, 1080×1920, 420dpi (2.625×), GPU swiftshader_indirect, font scale 1.0, animations 0.
**Runs:** 1 cold boots × 1 repeats of the trivial scene per app; 1 repeats of each other scene.

## Headline

- Cross-stack exact zero: **not met**.
- Trivial scene exact difference: **0 px (0.0000%)**.
- Trivial scene AA-aware difference: **0 px (0.0000%)**.
- Within-harness determinism: **zero exact diffs** across 70 renders; max exact diff per app/scene/boot combination: 0 px.
- Exact-zero scenes in every sampled boot: **solid, rect, text, shadow, type-body-large-emphasized, type-body-large, type-body-medium-emphasized, type-body-medium, type-body-small-emphasized, type-body-small, type-display-large-emphasized, type-display-large, type-display-medium-emphasized, type-display-medium, type-headline-large-emphasized, type-headline-large, type-headline-medium-emphasized, type-headline-medium, type-label-large-emphasized, type-label-large, type-label-medium-emphasized, type-label-medium, type-label-small-emphasized, type-label-small, type-title-large-emphasized, type-title-large, type-title-medium-emphasized, type-title-medium, type-title-small-emphasized, type-title-small**.

See the per-scene table for the exact split. Measured text layout: Compose 402.0×73.0 px, React Native 402.0×73.0 px. This report does **not** tune the scene and does **not** propose or change a threshold. The threshold-independent columns (max channel Δ, mean Δ over differing pixels, Δ &gt; 2 outside AA edges, flat fills &gt; 2) are the evidence for deciding whether a future threshold ADR is needed.

## Measured noise split

**Determinism.** 70 renders across 70 app/scene/boot combinations; maximum exact difference between any repeat and its first run is **0 px**. Per-combination numbers are in the determinism table.

**Text anti-aliasing.** On the trivial scene: **0 px** exact (0.0000%), **0 px** after pixelmatch AA detection (0.0000%), max channel Δ **0**. All exact differences fall inside the text bbox.

**Shadows.** The elevated rectangle is present and measured, not inferred from an empty scene:

| App | Non-background px outside rect | Max Δ from background | Min Δ from background |
|---|---:|---:|---:|
| Compose | 46,050 | 31 | 1 |
| React Native | 46,050 | 31 | 1 |

The cross-stack diff for the shadow scene is **0 exact px** (0.0000%).

## Layout edges

| Scene | Compose content bbox | React Native content bbox | Max edge Δ |
|---|---|---:|
| solid | none | none | 0 |
| rect | 63,63 420×252 | 63,63 420×252 | 0 |
| text | 68,75 395×59 | 68,75 395×59 | 0 |
| shadow | 74,81 582×370 | 74,81 582×370 | 0 |
| trivial | 63,63 420×365 | 63,63 420×365 | 0 |
| type-body-large-emphasized | 45,77 154×33 | 45,77 154×33 | 0 |
| type-body-large | 46,77 156×33 | 46,77 156×33 | 0 |
| type-body-medium-emphasized | 45,74 137×29 | 45,74 137×29 | 0 |
| type-body-medium | 45,74 133×29 | 45,74 133×29 | 0 |
| type-body-small-emphasized | 45,71 122×25 | 45,71 122×25 | 0 |
| type-body-small | 45,71 119×25 | 45,71 119×25 | 0 |
| type-display-large-emphasized | 54,89 535×116 | 54,89 535×116 | 0 |
| type-display-large | 54,89 518×116 | 54,89 518×116 | 0 |
| type-display-medium-emphasized | 51,83 425×92 | 51,83 425×92 | 0 |
| type-display-medium | 51,83 415×92 | 51,83 415×92 | 0 |
| type-display-small-emphasized | 49,81 340×74 | 49,82 340×74 | 1 |
| type-display-small | 49,81 331×74 | 49,82 331×74 | 1 |
| type-headline-large-emphasized | 48,81 301×65 | 48,81 301×65 | 0 |
| type-headline-large | 48,81 293×65 | 48,81 293×65 | 0 |
| type-headline-medium-emphasized | 47,80 265×58 | 47,80 265×58 | 0 |
| type-headline-medium | 48,80 258×58 | 48,80 258×58 | 0 |
| type-headline-small-emphasized | 47,78 225×49 | 47,79 225×49 | 1 |
| type-headline-small | 47,78 220×49 | 47,79 220×49 | 1 |
| type-label-large-emphasized | 45,74 141×29 | 45,74 141×29 | 0 |
| type-label-large | 45,74 134×29 | 45,74 134×29 | 0 |
| type-label-medium-emphasized | 45,71 130×25 | 45,71 130×25 | 0 |
| type-label-medium | 45,71 124×25 | 45,71 124×25 | 0 |
| type-label-small-emphasized | 44,72 119×23 | 44,72 119×23 | 0 |
| type-label-small | 45,72 113×23 | 45,72 113×23 | 0 |
| type-title-large-emphasized | 46,76 208×45 | 46,76 208×45 | 0 |
| type-title-large | 46,76 203×45 | 46,76 203×45 | 0 |
| type-title-medium-emphasized | 45,77 161×33 | 45,77 161×33 | 0 |
| type-title-medium | 45,77 155×33 | 45,77 155×33 | 0 |
| type-title-small-emphasized | 45,74 141×29 | 45,74 141×29 | 0 |
| type-title-small | 45,74 134×29 | 45,74 134×29 | 0 |

Strict bounding box of pixels that are not exactly the scene background, including anti-aliased glyph edges and the shadow. No tolerance is applied.

## Scene categories

| Category | Scenes | Σ exact px (scene max) | Σ AA-aware px (scene max) | Max AA-aware % | Gate |
|---|---:|---:|---:|---:|---|
| `core` | 5 | 0 | 0 | 0.0000% | 0.05% met |
| `text` | 30 | 7,878 | 269 | 0.0238% | tracked — no threshold |

Only the `core` category is the five-scene PLAYBOOK §7 gate. The `text` category contains the 30 typography roles (and, when included, the dense label/paragraph probes), tracked separately under U-25; its numbers are a regression ceiling, not a pass/fail claim. ADR-010 is pending.

## Noise split by scene

| Scene | Category | Exact px | Exact % | AA-aware px | AA-aware % | Max Δ | Boots |
|---|---|---:|---:|---:|---:|---:|---:|
| solid | core | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| rect | core | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| text | core | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| shadow | core | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| trivial | core | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-body-large-emphasized | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-body-large | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-body-medium-emphasized | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-body-medium | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-body-small-emphasized | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-body-small | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-display-large-emphasized | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-display-large | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-display-medium-emphasized | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-display-medium | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-display-small-emphasized | text | 2,340 | 0.5306% | 105 | 0.0238% | 226 | 1 |
| type-display-small | text | 2,372 | 0.5379% | 63 | 0.0143% | 226 | 1 |
| type-headline-large-emphasized | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-headline-large | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-headline-medium-emphasized | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-headline-medium | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-headline-small-emphasized | text | 1,592 | 0.3610% | 48 | 0.0109% | 226 | 1 |
| type-headline-small | text | 1,574 | 0.3569% | 53 | 0.0120% | 226 | 1 |
| type-label-large-emphasized | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-label-large | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-label-medium-emphasized | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-label-medium | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-label-small-emphasized | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-label-small | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-title-large-emphasized | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-title-large | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-title-medium-emphasized | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-title-medium | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-title-small-emphasized | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| type-title-small | text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |

## Non-AA text pixels (boot 1, trivial)

None.

## Determinism

| Boot | App | Scene | Runs | Max exact | Max AA-aware | Status |
|---:|---|---|---:|---:|---:|---|
| 0 | compose | solid | 1 | 0 | 0 | zero |
| 0 | compose | rect | 1 | 0 | 0 | zero |
| 0 | compose | text | 1 | 0 | 0 | zero |
| 0 | compose | shadow | 1 | 0 | 0 | zero |
| 0 | compose | trivial | 1 | 0 | 0 | zero |
| 0 | compose | type-body-large-emphasized | 1 | 0 | 0 | zero |
| 0 | compose | type-body-large | 1 | 0 | 0 | zero |
| 0 | compose | type-body-medium-emphasized | 1 | 0 | 0 | zero |
| 0 | compose | type-body-medium | 1 | 0 | 0 | zero |
| 0 | compose | type-body-small-emphasized | 1 | 0 | 0 | zero |
| 0 | compose | type-body-small | 1 | 0 | 0 | zero |
| 0 | compose | type-display-large-emphasized | 1 | 0 | 0 | zero |
| 0 | compose | type-display-large | 1 | 0 | 0 | zero |
| 0 | compose | type-display-medium-emphasized | 1 | 0 | 0 | zero |
| 0 | compose | type-display-medium | 1 | 0 | 0 | zero |
| 0 | compose | type-display-small-emphasized | 1 | 0 | 0 | zero |
| 0 | compose | type-display-small | 1 | 0 | 0 | zero |
| 0 | compose | type-headline-large-emphasized | 1 | 0 | 0 | zero |
| 0 | compose | type-headline-large | 1 | 0 | 0 | zero |
| 0 | compose | type-headline-medium-emphasized | 1 | 0 | 0 | zero |
| 0 | compose | type-headline-medium | 1 | 0 | 0 | zero |
| 0 | compose | type-headline-small-emphasized | 1 | 0 | 0 | zero |
| 0 | compose | type-headline-small | 1 | 0 | 0 | zero |
| 0 | compose | type-label-large-emphasized | 1 | 0 | 0 | zero |
| 0 | compose | type-label-large | 1 | 0 | 0 | zero |
| 0 | compose | type-label-medium-emphasized | 1 | 0 | 0 | zero |
| 0 | compose | type-label-medium | 1 | 0 | 0 | zero |
| 0 | compose | type-label-small-emphasized | 1 | 0 | 0 | zero |
| 0 | compose | type-label-small | 1 | 0 | 0 | zero |
| 0 | compose | type-title-large-emphasized | 1 | 0 | 0 | zero |
| 0 | compose | type-title-large | 1 | 0 | 0 | zero |
| 0 | compose | type-title-medium-emphasized | 1 | 0 | 0 | zero |
| 0 | compose | type-title-medium | 1 | 0 | 0 | zero |
| 0 | compose | type-title-small-emphasized | 1 | 0 | 0 | zero |
| 0 | compose | type-title-small | 1 | 0 | 0 | zero |
| 0 | rn | solid | 1 | 0 | 0 | zero |
| 0 | rn | rect | 1 | 0 | 0 | zero |
| 0 | rn | text | 1 | 0 | 0 | zero |
| 0 | rn | shadow | 1 | 0 | 0 | zero |
| 0 | rn | trivial | 1 | 0 | 0 | zero |
| 0 | rn | type-body-large-emphasized | 1 | 0 | 0 | zero |
| 0 | rn | type-body-large | 1 | 0 | 0 | zero |
| 0 | rn | type-body-medium-emphasized | 1 | 0 | 0 | zero |
| 0 | rn | type-body-medium | 1 | 0 | 0 | zero |
| 0 | rn | type-body-small-emphasized | 1 | 0 | 0 | zero |
| 0 | rn | type-body-small | 1 | 0 | 0 | zero |
| 0 | rn | type-display-large-emphasized | 1 | 0 | 0 | zero |
| 0 | rn | type-display-large | 1 | 0 | 0 | zero |
| 0 | rn | type-display-medium-emphasized | 1 | 0 | 0 | zero |
| 0 | rn | type-display-medium | 1 | 0 | 0 | zero |
| 0 | rn | type-display-small-emphasized | 1 | 0 | 0 | zero |
| 0 | rn | type-display-small | 1 | 0 | 0 | zero |
| 0 | rn | type-headline-large-emphasized | 1 | 0 | 0 | zero |
| 0 | rn | type-headline-large | 1 | 0 | 0 | zero |
| 0 | rn | type-headline-medium-emphasized | 1 | 0 | 0 | zero |
| 0 | rn | type-headline-medium | 1 | 0 | 0 | zero |
| 0 | rn | type-headline-small-emphasized | 1 | 0 | 0 | zero |
| 0 | rn | type-headline-small | 1 | 0 | 0 | zero |
| 0 | rn | type-label-large-emphasized | 1 | 0 | 0 | zero |
| 0 | rn | type-label-large | 1 | 0 | 0 | zero |
| 0 | rn | type-label-medium-emphasized | 1 | 0 | 0 | zero |
| 0 | rn | type-label-medium | 1 | 0 | 0 | zero |
| 0 | rn | type-label-small-emphasized | 1 | 0 | 0 | zero |
| 0 | rn | type-label-small | 1 | 0 | 0 | zero |
| 0 | rn | type-title-large-emphasized | 1 | 0 | 0 | zero |
| 0 | rn | type-title-large | 1 | 0 | 0 | zero |
| 0 | rn | type-title-medium-emphasized | 1 | 0 | 0 | zero |
| 0 | rn | type-title-medium | 1 | 0 | 0 | zero |
| 0 | rn | type-title-small-emphasized | 1 | 0 | 0 | zero |
| 0 | rn | type-title-small | 1 | 0 | 0 | zero |

## Cross-boot repeatability

| Boot | App | Scene | Exact px | AA-aware px | Max Δ |
|---:|---|---|---:|---:|---:|
| — | — | — | — | — | — |

## Profile and fonts

Every profile check passed: API 31, 1080×1920, 420dpi, font scale 1.0, locale en-US, animations 0, rotation 0, night mode off, SwiftShader GPU. The Roboto Flex SHA-256 is `9b523f7d82593df0107173849ebb8c817471a1df4b4fb2c3cbf40cfd810c8281` in both APKs and in the source tree; both runtime probes applied the `wdth` axis.

Frozen device, GPU, settings, and cold-boot procedure: `FROZEN_PROFILE.md`. Raw run log: `run.log`.

See `report.html` for side-by-side captures and diff heatmaps, and `results.json` for every per-run hash.

## Threshold-independent metrics (2026-11-28)

The AA-aware count uses pixelmatch 0.1 / `includeAA: false`; threshold 0.1 is a YIQ distance, not a channel delta. These raw columns are threshold-independent. An anti-aliased edge is a pixel with any 8-neighbour differing by more than 8/255 in either image; a flat fill has a uniform 3×3 neighbourhood in both images.

| Scene | Exact px | AA-aware px | Max Δ | Mean Δ (diff px) | Δ > 2 outside AA | Flat fills > 2 |
|---|---:|---:|---:|---:|---:|---:|
| `solid` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `rect` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `text` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `shadow` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `trivial` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-body-large-emphasized` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-body-large` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-body-medium-emphasized` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-body-medium` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-body-small-emphasized` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-body-small` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-display-large-emphasized` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-display-large` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-display-medium-emphasized` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-display-medium` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-display-small-emphasized` | 2340 | 105 | 226 | 87.73 | 0 | 0 |
| `type-display-small` | 2372 | 63 | 226 | 85.19 | 0 | 0 |
| `type-headline-large-emphasized` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-headline-large` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-headline-medium-emphasized` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-headline-medium` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-headline-small-emphasized` | 1592 | 48 | 226 | 85.25 | 0 | 0 |
| `type-headline-small` | 1574 | 53 | 226 | 84.93 | 0 | 0 |
| `type-label-large-emphasized` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-label-large` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-label-medium-emphasized` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-label-medium` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-label-small-emphasized` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-label-small` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-title-large-emphasized` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-title-large` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-title-medium-emphasized` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-title-medium` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-title-small-emphasized` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `type-title-small` | 0 | 0 | 0 | 0.00 | 0 | 0 |
