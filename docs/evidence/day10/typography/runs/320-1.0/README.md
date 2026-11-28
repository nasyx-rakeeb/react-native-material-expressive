# converter-320-1.0

**Generated:** 2026-11-28T08:41:56.319Z
**Profile:** M3E_API31, API 31, 1080×1920, 320dpi (2×), GPU swiftshader_indirect, font scale 1.0, animations 0.
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
| type-body-large-emphasized | 34,59 116×25 | 34,59 118×25 | 2 |
| type-body-large | 35,59 119×25 | 35,59 119×25 | 0 |
| type-body-medium-emphasized | 34,56 106×22 | 34,57 104×22 | 2 |
| type-body-medium | 34,56 101×22 | 34,57 101×22 | 1 |
| type-body-small-emphasized | 33,54 92×19 | 34,54 92×19 | 1 |
| type-body-small | 34,54 91×19 | 34,54 90×19 | 1 |
| type-display-large-emphasized | 41,68 407×88 | 41,69 407×88 | 1 |
| type-display-large | 41,68 396×88 | 41,69 394×88 | 2 |
| type-display-medium-emphasized | 39,63 322×70 | 39,64 322×70 | 1 |
| type-display-medium | 39,63 316×70 | 39,64 314×70 | 2 |
| type-display-small-emphasized | 37,62 258×56 | 37,63 258×56 | 1 |
| type-display-small | 37,62 253×56 | 37,63 252×56 | 1 |
| type-headline-large-emphasized | 37,61 228×49 | 37,62 229×49 | 1 |
| type-headline-large | 37,61 224×49 | 37,62 223×49 | 1 |
| type-headline-medium-emphasized | 36,61 201×43 | 36,61 201×43 | 0 |
| type-headline-medium | 36,61 196×43 | 36,61 196×43 | 0 |
| type-headline-small-emphasized | 35,60 174×37 | 35,61 172×37 | 2 |
| type-headline-small | 35,60 169×37 | 35,61 168×37 | 1 |
| type-label-large-emphasized | 34,56 107×22 | 34,57 107×22 | 1 |
| type-label-large | 34,56 104×22 | 34,57 102×22 | 2 |
| type-label-medium-emphasized | 34,54 99×19 | 34,54 98×19 | 1 |
| type-label-medium | 34,54 93×19 | 34,54 94×19 | 1 |
| type-label-small-emphasized | 34,54 90×18 | 34,55 90×18 | 1 |
| type-label-small | 34,54 87×18 | 34,55 86×18 | 1 |
| type-title-large-emphasized | 35,58 156×34 | 35,58 158×34 | 2 |
| type-title-large | 35,58 154×34 | 35,58 154×34 | 0 |
| type-title-medium-emphasized | 34,59 124×25 | 34,59 123×25 | 1 |
| type-title-medium | 34,59 117×25 | 34,59 118×25 | 1 |
| type-title-small-emphasized | 34,56 107×22 | 34,57 107×22 | 1 |
| type-title-small | 34,56 104×22 | 34,57 102×22 | 2 |

Strict bounding box of pixels that are not exactly the scene background, including anti-aliased glyph edges and the shadow. No tolerance is applied.

## Scene categories

| Category | Scenes | Σ exact px (scene max) | Σ AA-aware px (scene max) | Max AA-aware % | Gate |
|---|---:|---:|---:|---:|---|
| `text` | 30 | 41,070 | 3,174 | 0.1531% | tracked — no threshold |

Only the `core` category is the five-scene PLAYBOOK §7 gate. The `text` category contains the 30 typography roles (and, when included, the dense label/paragraph probes), tracked separately under U-25; its numbers are a regression ceiling, not a pass/fail claim. ADR-010 is pending.

## Noise split by scene

| Scene | Category | Exact px | Exact % | AA-aware px | AA-aware % | Max Δ | Boots |
|---|---|---:|---:|---:|---:|---:|---:|
| type-body-large-emphasized | text | 927 | 0.3621% | 36 | 0.0141% | 226 | 1 |
| type-body-large | text | 621 | 0.2426% | 15 | 0.0059% | 132 | 1 |
| type-body-medium-emphasized | text | 1,011 | 0.3949% | 165 | 0.0645% | 226 | 1 |
| type-body-medium | text | 885 | 0.3457% | 223 | 0.0871% | 226 | 1 |
| type-body-small-emphasized | text | 686 | 0.2680% | 115 | 0.0449% | 226 | 1 |
| type-body-small | text | 588 | 0.2297% | 133 | 0.0520% | 197 | 1 |
| type-display-large-emphasized | text | 3,192 | 1.2469% | 94 | 0.0367% | 226 | 1 |
| type-display-large | text | 4,591 | 1.7934% | 351 | 0.1371% | 226 | 1 |
| type-display-medium-emphasized | text | 2,662 | 1.0398% | 76 | 0.0297% | 226 | 1 |
| type-display-medium | text | 3,569 | 1.3941% | 392 | 0.1531% | 226 | 1 |
| type-display-small-emphasized | text | 2,141 | 0.8363% | 57 | 0.0223% | 226 | 1 |
| type-display-small | text | 2,291 | 0.8949% | 77 | 0.0301% | 226 | 1 |
| type-headline-large-emphasized | text | 1,969 | 0.7691% | 56 | 0.0219% | 226 | 1 |
| type-headline-large | text | 2,023 | 0.7902% | 56 | 0.0219% | 226 | 1 |
| type-headline-medium-emphasized | text | 584 | 0.2281% | 0 | 0.0000% | 72 | 1 |
| type-headline-medium | text | 639 | 0.2496% | 0 | 0.0000% | 136 | 1 |
| type-headline-small-emphasized | text | 1,824 | 0.7125% | 205 | 0.0801% | 226 | 1 |
| type-headline-small | text | 1,391 | 0.5434% | 42 | 0.0164% | 226 | 1 |
| type-label-large-emphasized | text | 835 | 0.3262% | 81 | 0.0316% | 226 | 1 |
| type-label-large | text | 971 | 0.3793% | 179 | 0.0699% | 226 | 1 |
| type-label-medium-emphasized | text | 626 | 0.2445% | 10 | 0.0039% | 176 | 1 |
| type-label-medium | text | 506 | 0.1977% | 53 | 0.0207% | 165 | 1 |
| type-label-small-emphasized | text | 682 | 0.2664% | 143 | 0.0559% | 226 | 1 |
| type-label-small | text | 804 | 0.3141% | 287 | 0.1121% | 226 | 1 |
| type-title-large-emphasized | text | 833 | 0.3254% | 33 | 0.0129% | 226 | 1 |
| type-title-large | text | 717 | 0.2801% | 5 | 0.0020% | 130 | 1 |
| type-title-medium-emphasized | text | 851 | 0.3324% | 5 | 0.0020% | 215 | 1 |
| type-title-medium | text | 845 | 0.3301% | 25 | 0.0098% | 226 | 1 |
| type-title-small-emphasized | text | 835 | 0.3262% | 81 | 0.0316% | 226 | 1 |
| type-title-small | text | 971 | 0.3793% | 179 | 0.0699% | 226 | 1 |

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

Every profile check passed: API 31, 1080×1920, 320dpi, font scale 1.0, locale en-US, animations 0, rotation 0, night mode off, SwiftShader GPU. Roboto Flex SHA-256 `9b523f7d82593df0107173849ebb8c817471a1df4b4fb2c3cbf40cfd810c8281` and Material Symbols SHA-256 `3b29bd1ca84d209f68cc7ae4127e00d07ba9b8199edcd37ed5e2511e87836c03` match in the source tree, the gallery assets and both APKs; both runtime probes applied the `wdth` axis.

Frozen device, GPU, settings, and cold-boot procedure: `FROZEN_PROFILE.md`. Raw run log: `run.log`.

See `report.html` for side-by-side captures and diff heatmaps, and `results.json` for every per-run hash.
