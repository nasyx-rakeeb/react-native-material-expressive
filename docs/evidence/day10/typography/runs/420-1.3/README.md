# converter-420-1.3

**Generated:** 2026-11-28T08:38:06.955Z
**Profile:** M3E_API31, API 31, 1080×1920, 420dpi (2.625×), GPU swiftshader_indirect, font scale 1.3, animations 0.
**Runs:** 1 cold boots × 1 repeats of the trivial scene per app; 1 repeats of each other scene.

## Headline

- Cross-stack exact zero: **not met**.
- Trivial scene exact difference: **not in this run**.
- Trivial scene AA-aware difference: **not in this run**.
- Within-harness determinism: **zero exact diffs** across 60 renders; max exact diff per app/scene/boot combination: 0 px.
- Exact-zero scenes in every sampled boot: **none**.

See the per-scene table for the exact split. Text layout markers were not captured. This report does **not** tune the scene and does **not** propose or change a threshold. The threshold-independent columns (max channel Δ, mean Δ over differing pixels, Δ &gt; 2 outside AA edges, flat fills &gt; 2) are the evidence for deciding whether a future threshold ADR is needed.

## Measured noise split

**Determinism.** 60 renders across 60 app/scene/boot combinations; maximum exact difference between any repeat and its first run is **0 px**. Per-combination numbers are in the determinism table.

**Text anti-aliasing.** The trivial scene was not included in this run.

**Shadows.** The elevated rectangle is present and measured, not inferred from an empty scene:

| App | Non-background px outside rect | Max Δ from background | Min Δ from background |
|---|---:|---:|---:|



The shadow scene was not included in this run.

## Layout edges

| Scene | Compose content bbox | React Native content bbox | Max edge Δ |
|---|---|---:|
| type-body-large-emphasized | 46,81 193×41 | 46,81 197×42 | 4 |
| type-body-large | 47,81 197×41 | 47,81 200×42 | 3 |
| type-body-medium-emphasized | 45,78 182×38 | 46,78 185×39 | 4 |
| type-body-medium | 46,78 176×38 | 46,78 179×39 | 3 |
| type-body-small-emphasized | 46,73 153×32 | 46,74 156×32 | 3 |
| type-body-small | 46,73 150×32 | 46,74 153×32 | 3 |
| type-display-large-emphasized | 54,89 533×116 | 54,89 535×116 | 2 |
| type-display-large | 54,89 512×116 | 54,89 517×116 | 5 |
| type-display-medium-emphasized | 51,84 421×91 | 51,83 425×92 | 4 |
| type-display-medium | 51,84 411×91 | 51,83 415×92 | 4 |
| type-display-small-emphasized | 49,81 336×74 | 49,82 340×74 | 4 |
| type-display-small | 49,81 328×74 | 49,82 331×74 | 3 |
| type-headline-large-emphasized | 48,81 301×65 | 48,81 301×65 | 0 |
| type-headline-large | 48,81 294×65 | 48,81 293×65 | 1 |
| type-headline-medium-emphasized | 48,81 269×59 | 48,81 272×59 | 3 |
| type-headline-medium | 48,81 263×59 | 48,81 265×59 | 2 |
| type-headline-small-emphasized | 47,81 246×54 | 47,81 251×55 | 5 |
| type-headline-small | 47,81 241×54 | 47,81 244×55 | 3 |
| type-label-large-emphasized | 45,78 190×38 | 46,78 190×39 | 1 |
| type-label-large | 45,78 179×38 | 46,78 181×39 | 3 |
| type-label-medium-emphasized | 46,73 162×32 | 45,74 167×32 | 4 |
| type-label-medium | 46,73 156×32 | 46,74 159×32 | 3 |
| type-label-small-emphasized | 45,74 152×30 | 45,75 156×30 | 4 |
| type-label-small | 46,74 145×30 | 45,75 149×30 | 3 |
| type-title-large-emphasized | 47,77 233×51 | 47,78 236×51 | 3 |
| type-title-large | 47,77 228×51 | 47,78 230×51 | 2 |
| type-title-medium-emphasized | 46,81 205×41 | 46,81 207×42 | 2 |
| type-title-medium | 46,81 194×41 | 46,81 199×42 | 5 |
| type-title-small-emphasized | 45,78 190×38 | 46,78 190×39 | 1 |
| type-title-small | 45,78 179×38 | 46,78 181×39 | 3 |

Strict bounding box of pixels that are not exactly the scene background, including anti-aliased glyph edges and the shadow. No tolerance is applied.

## Scene categories

| Category | Scenes | Σ exact px (scene max) | Σ AA-aware px (scene max) | Max AA-aware % | Gate |
|---|---:|---:|---:|---:|---|
| `text` | 30 | 93,257 | 22,658 | 0.6503% | tracked — no threshold |

Only the `core` category is the five-scene PLAYBOOK §7 gate. The `text` category contains the 30 typography roles (and, when included, the dense label/paragraph probes), tracked separately under U-25; its numbers are a regression ceiling, not a pass/fail claim. ADR-010 is pending.

## Noise split by scene

| Scene | Category | Exact px | Exact % | AA-aware px | AA-aware % | Max Δ | Boots |
|---|---|---:|---:|---:|---:|---:|---:|
| type-body-large-emphasized | text | 3,066 | 0.6952% | 937 | 0.2125% | 226 | 1 |
| type-body-large | text | 2,669 | 0.6052% | 645 | 0.1463% | 226 | 1 |
| type-body-medium-emphasized | text | 2,489 | 0.5644% | 533 | 0.1209% | 226 | 1 |
| type-body-medium | text | 2,553 | 0.5789% | 620 | 0.1406% | 226 | 1 |
| type-body-small-emphasized | text | 1,969 | 0.4465% | 438 | 0.0993% | 226 | 1 |
| type-body-small | text | 1,889 | 0.4283% | 380 | 0.0862% | 226 | 1 |
| type-display-large-emphasized | text | 5,374 | 1.2186% | 1,236 | 0.2803% | 226 | 1 |
| type-display-large | text | 8,110 | 1.8390% | 2,868 | 0.6503% | 226 | 1 |
| type-display-medium-emphasized | text | 6,175 | 1.4002% | 1,696 | 0.3846% | 226 | 1 |
| type-display-medium | text | 6,180 | 1.4014% | 1,629 | 0.3694% | 226 | 1 |
| type-display-small-emphasized | text | 5,235 | 1.1871% | 1,839 | 0.4170% | 226 | 1 |
| type-display-small | text | 4,378 | 0.9927% | 949 | 0.2152% | 226 | 1 |
| type-headline-large-emphasized | text | 1,366 | 0.3098% | 1 | 0.0002% | 171 | 1 |
| type-headline-large | text | 1,646 | 0.3732% | 3 | 0.0007% | 184 | 1 |
| type-headline-medium-emphasized | text | 2,344 | 0.5315% | 381 | 0.0864% | 226 | 1 |
| type-headline-medium | text | 2,016 | 0.4571% | 165 | 0.0374% | 226 | 1 |
| type-headline-small-emphasized | text | 4,151 | 0.9413% | 1,507 | 0.3417% | 226 | 1 |
| type-headline-small | text | 3,644 | 0.8263% | 868 | 0.1968% | 226 | 1 |
| type-label-large-emphasized | text | 2,077 | 0.4710% | 262 | 0.0594% | 226 | 1 |
| type-label-large | text | 2,374 | 0.5383% | 448 | 0.1016% | 226 | 1 |
| type-label-medium-emphasized | text | 2,221 | 0.5036% | 675 | 0.1531% | 226 | 1 |
| type-label-medium | text | 1,899 | 0.4306% | 391 | 0.0887% | 226 | 1 |
| type-label-small-emphasized | text | 1,886 | 0.4277% | 522 | 0.1184% | 226 | 1 |
| type-label-small | text | 1,771 | 0.4016% | 375 | 0.0850% | 226 | 1 |
| type-title-large-emphasized | text | 2,975 | 0.6746% | 677 | 0.1535% | 226 | 1 |
| type-title-large | text | 2,760 | 0.6259% | 421 | 0.0955% | 226 | 1 |
| type-title-medium-emphasized | text | 2,404 | 0.5451% | 416 | 0.0943% | 226 | 1 |
| type-title-medium | text | 3,185 | 0.7222% | 1,066 | 0.2417% | 226 | 1 |
| type-title-small-emphasized | text | 2,077 | 0.4710% | 262 | 0.0594% | 226 | 1 |
| type-title-small | text | 2,374 | 0.5383% | 448 | 0.1016% | 226 | 1 |

## Non-AA text pixels (boot 1, trivial)

None.

## Determinism

| Boot | App | Scene | Runs | Max exact | Max AA-aware | Status |
|---:|---|---|---:|---:|---:|---|
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

Every profile check passed: API 31, 1080×1920, 420dpi, font scale 1.3, locale en-US, animations 0, rotation 0, night mode off, SwiftShader GPU. Roboto Flex SHA-256 `9b523f7d82593df0107173849ebb8c817471a1df4b4fb2c3cbf40cfd810c8281` and Material Symbols SHA-256 `3b29bd1ca84d209f68cc7ae4127e00d07ba9b8199edcd37ed5e2511e87836c03` match in the source tree, the gallery assets and both APKs; both runtime probes applied the `wdth` axis.

Frozen device, GPU, settings, and cold-boot procedure: `FROZEN_PROFILE.md`. Raw run log: `run.log`.

See `report.html` for side-by-side captures and diff heatmaps, and `results.json` for every per-run hash.
