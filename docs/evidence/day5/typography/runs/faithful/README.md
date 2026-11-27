# Day 5 — typography, faithful cross-stack

**Generated:** 2026-11-26T07:42:53.225Z
**Profile:** M3E_API31, API 31, 1080×1920, 420dpi (2.625×), GPU swiftshader_indirect, font scale 1.0, animations 0.
**Runs:** 1 cold boots × 1 repeats of the trivial scene per app; 2 repeats of each other scene.

## Headline

- Cross-stack exact zero: **not met**.
- Trivial scene exact difference: **1,745 px (0.3957%)**.
- Trivial scene AA-aware difference: **4 px (0.0009%)**.
- Within-harness determinism: **zero exact diffs** across 138 renders; max exact diff per app/scene/boot combination: 0 px.
- Exact-zero scenes in every sampled boot: **solid, rect, shadow**.

See the per-scene table for the exact split. Measured text layout: Compose 402.0×73.0 px, React Native 402.0×73.0 px. This report does **not** tune the scene and does **not** propose or change a threshold. The threshold-independent columns (max channel Δ, mean Δ over differing pixels, Δ &gt; 2 outside AA edges, flat fills &gt; 2) are the evidence for deciding whether a future threshold ADR is needed.

## Measured noise split

**Determinism.** 138 renders across 70 app/scene/boot combinations; maximum exact difference between any repeat and its first run is **0 px**. Per-combination numbers are in the determinism table.

**Text anti-aliasing.** On the trivial scene: **1,745 px** exact (0.3957%), **4 px** after pixelmatch AA detection (0.0009%), max channel Δ **162**. All exact differences fall inside the text bbox.

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
| type-body-medium-emphasized | 44,74 135×29 | 45,74 137×29 | 3 |
| type-body-medium | 45,74 128×29 | 45,74 133×29 | 5 |
| type-body-small-emphasized | 45,70 119×25 | 45,71 122×25 | 3 |
| type-body-small | 45,70 117×25 | 45,71 119×25 | 2 |
| type-display-large-emphasized | 54,89 533×116 | 54,89 535×116 | 2 |
| type-display-large | 54,89 513×116 | 54,89 518×116 | 5 |
| type-display-medium-emphasized | 51,84 421×91 | 51,83 425×92 | 4 |
| type-display-medium | 51,84 411×91 | 51,83 415×92 | 4 |
| type-display-small-emphasized | 49,81 336×74 | 49,82 340×74 | 4 |
| type-display-small | 49,81 328×74 | 49,82 331×74 | 3 |
| type-headline-large-emphasized | 48,81 301×65 | 48,81 301×65 | 0 |
| type-headline-large | 48,81 294×65 | 48,81 293×65 | 1 |
| type-headline-medium-emphasized | 47,79 262×58 | 47,80 265×58 | 3 |
| type-headline-medium | 48,79 254×58 | 48,80 258×58 | 4 |
| type-headline-small-emphasized | 47,78 225×49 | 47,79 225×49 | 1 |
| type-headline-small | 47,78 219×49 | 47,79 220×49 | 1 |
| type-label-large-emphasized | 44,74 138×29 | 45,74 141×29 | 4 |
| type-label-large | 44,74 132×29 | 45,74 134×29 | 3 |
| type-label-medium-emphasized | 45,70 125×25 | 45,71 130×25 | 5 |
| type-label-medium | 45,70 121×25 | 45,71 124×25 | 3 |
| type-label-small-emphasized | 45,72 115×23 | 44,72 119×23 | 3 |
| type-label-small | 45,72 111×23 | 45,72 113×23 | 2 |
| type-title-large-emphasized | 46,76 206×45 | 46,76 208×45 | 2 |
| type-title-large | 46,76 199×45 | 46,76 203×45 | 4 |
| type-title-medium-emphasized | 45,77 161×33 | 45,77 161×33 | 0 |
| type-title-medium | 45,77 155×33 | 45,77 155×33 | 0 |
| type-title-small-emphasized | 44,74 138×29 | 45,74 141×29 | 4 |
| type-title-small | 44,74 132×29 | 45,74 134×29 | 3 |

Strict bounding box of pixels that are not exactly the scene background, including anti-aliased glyph edges and the shadow. No tolerance is applied.

## Scene categories

| Category | Scenes | Σ exact px (scene max) | Σ AA-aware px (scene max) | Max AA-aware % | Gate |
|---|---:|---:|---:|---:|---|
| `core` | 5 | 3,490 | 8 | 0.0009% | 0.05% met |
| `text` | 30 | 75,436 | 17,798 | 0.6224% | tracked — no threshold |

Only the `core` category is the five-scene PLAYBOOK §7 gate. The `text` category contains the 30 typography roles (and, when included, the dense label/paragraph probes), tracked separately under U-25; its numbers are a regression ceiling, not a pass/fail claim. ADR-010 is pending.

## Noise split by scene

| Scene | Category | Exact px | Exact % | AA-aware px | AA-aware % | Max Δ | Boots |
|---|---|---:|---:|---:|---:|---:|---:|
| solid | core | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| rect | core | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| text | core | 1,745 | 0.3957% | 4 | 0.0009% | 162 | 1 |
| shadow | core | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| trivial | core | 1,745 | 0.3957% | 4 | 0.0009% | 162 | 1 |
| type-body-large-emphasized | text | 988 | 0.2240% | 5 | 0.0011% | 226 | 1 |
| type-body-large | text | 994 | 0.2254% | 5 | 0.0011% | 181 | 1 |
| type-body-medium-emphasized | text | 1,614 | 0.3660% | 326 | 0.0739% | 226 | 1 |
| type-body-medium | text | 1,884 | 0.4272% | 676 | 0.1533% | 226 | 1 |
| type-body-small-emphasized | text | 1,369 | 0.3104% | 311 | 0.0705% | 226 | 1 |
| type-body-small | text | 1,397 | 0.3168% | 334 | 0.0757% | 226 | 1 |
| type-display-large-emphasized | text | 5,374 | 1.2186% | 1,236 | 0.2803% | 226 | 1 |
| type-display-large | text | 8,034 | 1.8218% | 2,745 | 0.6224% | 226 | 1 |
| type-display-medium-emphasized | text | 6,175 | 1.4002% | 1,696 | 0.3846% | 226 | 1 |
| type-display-medium | text | 6,180 | 1.4014% | 1,629 | 0.3694% | 226 | 1 |
| type-display-small-emphasized | text | 5,235 | 1.1871% | 1,839 | 0.4170% | 226 | 1 |
| type-display-small | text | 4,378 | 0.9927% | 949 | 0.2152% | 226 | 1 |
| type-headline-large-emphasized | text | 1,366 | 0.3098% | 1 | 0.0002% | 171 | 1 |
| type-headline-large | text | 1,646 | 0.3732% | 3 | 0.0007% | 184 | 1 |
| type-headline-medium-emphasized | text | 3,367 | 0.7635% | 714 | 0.1619% | 226 | 1 |
| type-headline-medium | text | 3,680 | 0.8345% | 993 | 0.2252% | 226 | 1 |
| type-headline-small-emphasized | text | 1,877 | 0.4256% | 51 | 0.0116% | 226 | 1 |
| type-headline-small | text | 1,912 | 0.4336% | 58 | 0.0132% | 226 | 1 |
| type-label-large-emphasized | text | 1,692 | 0.3837% | 474 | 0.1075% | 226 | 1 |
| type-label-large | text | 1,683 | 0.3816% | 397 | 0.0900% | 226 | 1 |
| type-label-medium-emphasized | text | 1,762 | 0.3995% | 663 | 0.1503% | 226 | 1 |
| type-label-medium | text | 1,439 | 0.3263% | 375 | 0.0850% | 226 | 1 |
| type-label-small-emphasized | text | 1,369 | 0.3104% | 397 | 0.0900% | 226 | 1 |
| type-label-small | text | 1,139 | 0.2583% | 219 | 0.0497% | 226 | 1 |
| type-title-large-emphasized | text | 1,681 | 0.3812% | 222 | 0.0503% | 226 | 1 |
| type-title-large | text | 2,168 | 0.4916% | 598 | 0.1356% | 226 | 1 |
| type-title-medium-emphasized | text | 843 | 0.1912% | 9 | 0.0020% | 205 | 1 |
| type-title-medium | text | 815 | 0.1848% | 2 | 0.0005% | 226 | 1 |
| type-title-small-emphasized | text | 1,692 | 0.3837% | 474 | 0.1075% | 226 | 1 |
| type-title-small | text | 1,683 | 0.3816% | 397 | 0.0900% | 226 | 1 |

## Non-AA text pixels (boot 1, trivial)

| Coordinate | Compose | React Native |
|---|---|---|
| 416, 405 | rgb(255,251,254) | rgb(170,167,170) |
| 417, 405 | rgb(148,145,149) | rgb(255,251,254) |
| 417, 407 | rgb(29,27,32) | rgb(170,167,170) |
| 417, 408 | rgb(29,27,32) | rgb(57,55,60) |

## Determinism

| Boot | App | Scene | Runs | Max exact | Max AA-aware | Status |
|---:|---|---|---:|---:|---:|---|
| 0 | compose | solid | 2 | 0 | 0 | zero |
| 0 | compose | rect | 2 | 0 | 0 | zero |
| 0 | compose | text | 2 | 0 | 0 | zero |
| 0 | compose | shadow | 2 | 0 | 0 | zero |
| 0 | compose | trivial | 1 | 0 | 0 | zero |
| 0 | compose | type-body-large-emphasized | 2 | 0 | 0 | zero |
| 0 | compose | type-body-large | 2 | 0 | 0 | zero |
| 0 | compose | type-body-medium-emphasized | 2 | 0 | 0 | zero |
| 0 | compose | type-body-medium | 2 | 0 | 0 | zero |
| 0 | compose | type-body-small-emphasized | 2 | 0 | 0 | zero |
| 0 | compose | type-body-small | 2 | 0 | 0 | zero |
| 0 | compose | type-display-large-emphasized | 2 | 0 | 0 | zero |
| 0 | compose | type-display-large | 2 | 0 | 0 | zero |
| 0 | compose | type-display-medium-emphasized | 2 | 0 | 0 | zero |
| 0 | compose | type-display-medium | 2 | 0 | 0 | zero |
| 0 | compose | type-display-small-emphasized | 2 | 0 | 0 | zero |
| 0 | compose | type-display-small | 2 | 0 | 0 | zero |
| 0 | compose | type-headline-large-emphasized | 2 | 0 | 0 | zero |
| 0 | compose | type-headline-large | 2 | 0 | 0 | zero |
| 0 | compose | type-headline-medium-emphasized | 2 | 0 | 0 | zero |
| 0 | compose | type-headline-medium | 2 | 0 | 0 | zero |
| 0 | compose | type-headline-small-emphasized | 2 | 0 | 0 | zero |
| 0 | compose | type-headline-small | 2 | 0 | 0 | zero |
| 0 | compose | type-label-large-emphasized | 2 | 0 | 0 | zero |
| 0 | compose | type-label-large | 2 | 0 | 0 | zero |
| 0 | compose | type-label-medium-emphasized | 2 | 0 | 0 | zero |
| 0 | compose | type-label-medium | 2 | 0 | 0 | zero |
| 0 | compose | type-label-small-emphasized | 2 | 0 | 0 | zero |
| 0 | compose | type-label-small | 2 | 0 | 0 | zero |
| 0 | compose | type-title-large-emphasized | 2 | 0 | 0 | zero |
| 0 | compose | type-title-large | 2 | 0 | 0 | zero |
| 0 | compose | type-title-medium-emphasized | 2 | 0 | 0 | zero |
| 0 | compose | type-title-medium | 2 | 0 | 0 | zero |
| 0 | compose | type-title-small-emphasized | 2 | 0 | 0 | zero |
| 0 | compose | type-title-small | 2 | 0 | 0 | zero |
| 0 | rn | solid | 2 | 0 | 0 | zero |
| 0 | rn | rect | 2 | 0 | 0 | zero |
| 0 | rn | text | 2 | 0 | 0 | zero |
| 0 | rn | shadow | 2 | 0 | 0 | zero |
| 0 | rn | trivial | 1 | 0 | 0 | zero |
| 0 | rn | type-body-large-emphasized | 2 | 0 | 0 | zero |
| 0 | rn | type-body-large | 2 | 0 | 0 | zero |
| 0 | rn | type-body-medium-emphasized | 2 | 0 | 0 | zero |
| 0 | rn | type-body-medium | 2 | 0 | 0 | zero |
| 0 | rn | type-body-small-emphasized | 2 | 0 | 0 | zero |
| 0 | rn | type-body-small | 2 | 0 | 0 | zero |
| 0 | rn | type-display-large-emphasized | 2 | 0 | 0 | zero |
| 0 | rn | type-display-large | 2 | 0 | 0 | zero |
| 0 | rn | type-display-medium-emphasized | 2 | 0 | 0 | zero |
| 0 | rn | type-display-medium | 2 | 0 | 0 | zero |
| 0 | rn | type-display-small-emphasized | 2 | 0 | 0 | zero |
| 0 | rn | type-display-small | 2 | 0 | 0 | zero |
| 0 | rn | type-headline-large-emphasized | 2 | 0 | 0 | zero |
| 0 | rn | type-headline-large | 2 | 0 | 0 | zero |
| 0 | rn | type-headline-medium-emphasized | 2 | 0 | 0 | zero |
| 0 | rn | type-headline-medium | 2 | 0 | 0 | zero |
| 0 | rn | type-headline-small-emphasized | 2 | 0 | 0 | zero |
| 0 | rn | type-headline-small | 2 | 0 | 0 | zero |
| 0 | rn | type-label-large-emphasized | 2 | 0 | 0 | zero |
| 0 | rn | type-label-large | 2 | 0 | 0 | zero |
| 0 | rn | type-label-medium-emphasized | 2 | 0 | 0 | zero |
| 0 | rn | type-label-medium | 2 | 0 | 0 | zero |
| 0 | rn | type-label-small-emphasized | 2 | 0 | 0 | zero |
| 0 | rn | type-label-small | 2 | 0 | 0 | zero |
| 0 | rn | type-title-large-emphasized | 2 | 0 | 0 | zero |
| 0 | rn | type-title-large | 2 | 0 | 0 | zero |
| 0 | rn | type-title-medium-emphasized | 2 | 0 | 0 | zero |
| 0 | rn | type-title-medium | 2 | 0 | 0 | zero |
| 0 | rn | type-title-small-emphasized | 2 | 0 | 0 | zero |
| 0 | rn | type-title-small | 2 | 0 | 0 | zero |

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
| `text` | 1745 | 4 | 162 | 36.33 | 0 | 0 |
| `shadow` | 0 | 0 | 0 | 0.00 | 0 | 0 |
| `trivial` | 1745 | 4 | 162 | 36.33 | 0 | 0 |
| `type-body-large-emphasized` | 988 | 5 | 226 | 56.26 | 0 | 0 |
| `type-body-large` | 994 | 5 | 181 | 42.08 | 0 | 0 |
| `type-body-medium-emphasized` | 1614 | 326 | 226 | 106.58 | 0 | 0 |
| `type-body-medium` | 1884 | 676 | 226 | 128.42 | 78 | 76 |
| `type-body-small-emphasized` | 1369 | 311 | 226 | 113.78 | 0 | 0 |
| `type-body-small` | 1397 | 334 | 226 | 114.66 | 0 | 0 |
| `type-display-large-emphasized` | 5374 | 1236 | 226 | 129.00 | 0 | 0 |
| `type-display-large` | 8034 | 2745 | 226 | 138.40 | 741 | 611 |
| `type-display-medium-emphasized` | 6175 | 1696 | 226 | 132.07 | 226 | 220 |
| `type-display-medium` | 6180 | 1629 | 226 | 121.93 | 222 | 217 |
| `type-display-small-emphasized` | 5235 | 1839 | 226 | 142.37 | 296 | 294 |
| `type-display-small` | 4378 | 949 | 226 | 126.33 | 0 | 0 |
| `type-headline-large-emphasized` | 1366 | 1 | 171 | 57.57 | 0 | 0 |
| `type-headline-large` | 1646 | 3 | 184 | 55.72 | 0 | 0 |
| `type-headline-medium-emphasized` | 3367 | 714 | 226 | 132.13 | 0 | 0 |
| `type-headline-medium` | 3680 | 993 | 226 | 131.36 | 106 | 106 |
| `type-headline-small-emphasized` | 1877 | 51 | 226 | 81.03 | 0 | 0 |
| `type-headline-small` | 1912 | 58 | 226 | 83.34 | 0 | 0 |
| `type-label-large-emphasized` | 1692 | 474 | 226 | 120.82 | 67 | 67 |
| `type-label-large` | 1683 | 397 | 226 | 108.35 | 0 | 0 |
| `type-label-medium-emphasized` | 1762 | 663 | 226 | 142.93 | 147 | 144 |
| `type-label-medium` | 1439 | 375 | 226 | 117.15 | 0 | 0 |
| `type-label-small-emphasized` | 1369 | 397 | 226 | 123.06 | 39 | 38 |
| `type-label-small` | 1139 | 219 | 226 | 109.31 | 0 | 0 |
| `type-title-large-emphasized` | 1681 | 222 | 226 | 113.48 | 0 | 0 |
| `type-title-large` | 2168 | 598 | 226 | 132.35 | 43 | 41 |
| `type-title-medium-emphasized` | 843 | 9 | 205 | 62.37 | 0 | 0 |
| `type-title-medium` | 815 | 2 | 226 | 51.28 | 0 | 0 |
| `type-title-small-emphasized` | 1692 | 474 | 226 | 120.82 | 67 | 67 |
| `type-title-small` | 1683 | 397 | 226 | 108.35 | 0 | 0 |
