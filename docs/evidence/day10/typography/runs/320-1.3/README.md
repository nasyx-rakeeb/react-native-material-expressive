# converter-320-1.3

**Generated:** 2026-11-28T08:50:40.767Z
**Profile:** M3E_API31, API 31, 1080×1920, 320dpi (2×), GPU swiftshader_indirect, font scale 1.3, animations 0.
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
| type-body-large-emphasized | 35,62 147×31 | 35,62 150×32 | 3 |
| type-body-large | 36,62 150×31 | 36,62 152×32 | 2 |
| type-body-medium-emphasized | 35,59 138×30 | 35,59 141×30 | 3 |
| type-body-medium | 35,59 134×30 | 35,59 137×30 | 3 |
| type-body-small-emphasized | 35,55 119×25 | 35,56 122×25 | 3 |
| type-body-small | 35,55 117×25 | 35,56 119×25 | 2 |
| type-display-large-emphasized | 41,68 407×88 | 41,69 407×88 | 1 |
| type-display-large | 41,68 395×88 | 41,69 393×88 | 2 |
| type-display-medium-emphasized | 39,63 322×70 | 39,64 322×70 | 1 |
| type-display-medium | 39,63 316×70 | 39,64 314×70 | 2 |
| type-display-small-emphasized | 37,62 258×56 | 37,63 258×56 | 1 |
| type-display-small | 37,62 253×56 | 37,63 252×56 | 1 |
| type-headline-large-emphasized | 37,61 228×49 | 37,62 229×49 | 1 |
| type-headline-large | 37,61 224×49 | 37,62 223×49 | 1 |
| type-headline-medium-emphasized | 36,61 206×45 | 36,62 208×45 | 2 |
| type-headline-medium | 36,61 199×45 | 36,62 203×45 | 4 |
| type-headline-small-emphasized | 36,61 186×41 | 36,62 190×41 | 4 |
| type-headline-small | 36,61 182×41 | 36,62 185×41 | 3 |
| type-label-large-emphasized | 34,59 142×30 | 35,59 145×30 | 4 |
| type-label-large | 35,59 135×30 | 35,59 138×30 | 3 |
| type-label-medium-emphasized | 35,55 125×25 | 35,56 130×25 | 5 |
| type-label-medium | 35,55 121×25 | 35,56 124×25 | 3 |
| type-label-small-emphasized | 35,57 115×23 | 34,57 119×23 | 3 |
| type-label-small | 35,57 111×23 | 35,57 113×23 | 2 |
| type-title-large-emphasized | 36,59 179×39 | 36,59 179×39 | 0 |
| type-title-large | 36,59 175×39 | 36,59 174×39 | 1 |
| type-title-medium-emphasized | 35,62 153×31 | 35,62 157×32 | 4 |
| type-title-medium | 35,62 148×31 | 35,62 151×32 | 3 |
| type-title-small-emphasized | 34,59 142×30 | 35,59 145×30 | 4 |
| type-title-small | 35,59 135×30 | 35,59 138×30 | 3 |

Strict bounding box of pixels that are not exactly the scene background, including anti-aliased glyph edges and the shadow. No tolerance is applied.

## Scene categories

| Category | Scenes | Σ exact px (scene max) | Σ AA-aware px (scene max) | Max AA-aware % | Gate |
|---|---:|---:|---:|---:|---|
| `text` | 30 | 59,992 | 9,480 | 0.2801% | tracked — no threshold |

Only the `core` category is the five-scene PLAYBOOK §7 gate. The `text` category contains the 30 typography roles (and, when included, the dense label/paragraph probes), tracked separately under U-25; its numbers are a regression ceiling, not a pass/fail claim. ADR-010 is pending.

## Noise split by scene

| Scene | Category | Exact px | Exact % | AA-aware px | AA-aware % | Max Δ | Boots |
|---|---|---:|---:|---:|---:|---:|---:|
| type-body-large-emphasized | text | 1,834 | 0.7164% | 343 | 0.1340% | 226 | 1 |
| type-body-large | text | 1,782 | 0.6961% | 301 | 0.1176% | 226 | 1 |
| type-body-medium-emphasized | text | 1,519 | 0.5934% | 291 | 0.1137% | 226 | 1 |
| type-body-medium | text | 1,607 | 0.6277% | 367 | 0.1434% | 226 | 1 |
| type-body-small-emphasized | text | 1,308 | 0.5109% | 298 | 0.1164% | 226 | 1 |
| type-body-small | text | 1,316 | 0.5141% | 295 | 0.1152% | 226 | 1 |
| type-display-large-emphasized | text | 3,192 | 1.2469% | 94 | 0.0367% | 226 | 1 |
| type-display-large | text | 4,694 | 1.8336% | 383 | 0.1496% | 226 | 1 |
| type-display-medium-emphasized | text | 2,662 | 1.0398% | 76 | 0.0297% | 226 | 1 |
| type-display-medium | text | 3,569 | 1.3941% | 392 | 0.1531% | 226 | 1 |
| type-display-small-emphasized | text | 2,141 | 0.8363% | 57 | 0.0223% | 226 | 1 |
| type-display-small | text | 2,291 | 0.8949% | 77 | 0.0301% | 226 | 1 |
| type-headline-large-emphasized | text | 1,969 | 0.7691% | 56 | 0.0219% | 226 | 1 |
| type-headline-large | text | 2,023 | 0.7902% | 56 | 0.0219% | 226 | 1 |
| type-headline-medium-emphasized | text | 2,329 | 0.9098% | 320 | 0.1250% | 226 | 1 |
| type-headline-medium | text | 2,766 | 1.0805% | 688 | 0.2687% | 226 | 1 |
| type-headline-small-emphasized | text | 2,611 | 1.0199% | 717 | 0.2801% | 226 | 1 |
| type-headline-small | text | 2,398 | 0.9367% | 508 | 0.1984% | 226 | 1 |
| type-label-large-emphasized | text | 1,678 | 0.6555% | 419 | 0.1637% | 226 | 1 |
| type-label-large | text | 1,518 | 0.5930% | 293 | 0.1145% | 226 | 1 |
| type-label-medium-emphasized | text | 1,743 | 0.6809% | 710 | 0.2773% | 226 | 1 |
| type-label-medium | text | 1,402 | 0.5477% | 365 | 0.1426% | 226 | 1 |
| type-label-small-emphasized | text | 1,369 | 0.5348% | 397 | 0.1551% | 226 | 1 |
| type-label-small | text | 1,127 | 0.4402% | 210 | 0.0820% | 226 | 1 |
| type-title-large-emphasized | text | 835 | 0.3262% | 0 | 0.0000% | 157 | 1 |
| type-title-large | text | 998 | 0.3898% | 0 | 0.0000% | 162 | 1 |
| type-title-medium-emphasized | text | 2,187 | 0.8543% | 648 | 0.2531% | 226 | 1 |
| type-title-medium | text | 1,928 | 0.7531% | 407 | 0.1590% | 226 | 1 |
| type-title-small-emphasized | text | 1,678 | 0.6555% | 419 | 0.1637% | 226 | 1 |
| type-title-small | text | 1,518 | 0.5930% | 293 | 0.1145% | 226 | 1 |

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

Every profile check passed: API 31, 1080×1920, 320dpi, font scale 1.3, locale en-US, animations 0, rotation 0, night mode off, SwiftShader GPU. Roboto Flex SHA-256 `9b523f7d82593df0107173849ebb8c817471a1df4b4fb2c3cbf40cfd810c8281` and Material Symbols SHA-256 `3b29bd1ca84d209f68cc7ae4127e00d07ba9b8199edcd37ed5e2511e87836c03` match in the source tree, the gallery assets and both APKs; both runtime probes applied the `wdth` axis.

Frozen device, GPU, settings, and cold-boot procedure: `FROZEN_PROFILE.md`. Raw run log: `run.log`.

See `report.html` for side-by-side captures and diff heatmaps, and `results.json` for every per-run hash.
