# day10-core-gate

**Generated:** 2026-11-28T10:41:07.831Z
**Profile:** M3E_API31, API 31, 1080×1920, 420dpi (2.625×), GPU swiftshader_indirect, font scale 1.0, animations 0.
**Runs:** 1 cold boots × 1 repeats of the trivial scene per app; 1 repeats of each other scene.

## Headline

- Cross-stack exact zero: **not met**.
- Trivial scene exact difference: **1,745 px (0.3957%)**.
- Trivial scene AA-aware difference: **4 px (0.0009%)**.
- Within-harness determinism: **zero exact diffs** across 10 renders; max exact diff per app/scene/boot combination: 0 px.
- Exact-zero scenes in every sampled boot: **solid, rect, shadow**.

See the per-scene table for the exact split. Measured text layout: Compose 402.0×73.0 px, React Native 402.0×73.0 px. This report does **not** tune the scene and does **not** propose or change a threshold. The threshold-independent columns (max channel Δ, mean Δ over differing pixels, Δ &gt; 2 outside AA edges, flat fills &gt; 2) are the evidence for deciding whether a future threshold ADR is needed.

## Measured noise split

**Determinism.** 10 renders across 10 app/scene/boot combinations; maximum exact difference between any repeat and its first run is **0 px**. Per-combination numbers are in the determinism table.

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

Strict bounding box of pixels that are not exactly the scene background, including anti-aliased glyph edges and the shadow. No tolerance is applied.

## Scene categories

| Category | Scenes | Σ exact px (scene max) | Σ AA-aware px (scene max) | Max AA-aware % | Gate |
|---|---:|---:|---:|---:|---|
| `core` | 5 | 3,490 | 8 | 0.0009% | 0.05% met |

Only the `core` category is the five-scene PLAYBOOK §7 gate. The `text` category contains the 30 typography roles (and, when included, the dense label/paragraph probes), tracked separately under U-25; its numbers are a regression ceiling, not a pass/fail claim. ADR-010 is pending.

## Noise split by scene

| Scene | Category | Exact px | Exact % | AA-aware px | AA-aware % | Max Δ | Boots |
|---|---|---:|---:|---:|---:|---:|---:|
| solid | core | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| rect | core | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| text | core | 1,745 | 0.3957% | 4 | 0.0009% | 162 | 1 |
| shadow | core | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| trivial | core | 1,745 | 0.3957% | 4 | 0.0009% | 162 | 1 |

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
| 0 | compose | solid | 1 | 0 | 0 | zero |
| 0 | compose | rect | 1 | 0 | 0 | zero |
| 0 | compose | text | 1 | 0 | 0 | zero |
| 0 | compose | shadow | 1 | 0 | 0 | zero |
| 0 | compose | trivial | 1 | 0 | 0 | zero |
| 0 | rn | solid | 1 | 0 | 0 | zero |
| 0 | rn | rect | 1 | 0 | 0 | zero |
| 0 | rn | text | 1 | 0 | 0 | zero |
| 0 | rn | shadow | 1 | 0 | 0 | zero |
| 0 | rn | trivial | 1 | 0 | 0 | zero |

## Cross-boot repeatability

| Boot | App | Scene | Exact px | AA-aware px | Max Δ |
|---:|---|---|---:|---:|---:|
| — | — | — | — | — | — |

## Profile and fonts

Every profile check passed: API 31, 1080×1920, 420dpi, font scale 1.0, locale en-US, animations 0, rotation 0, night mode off, SwiftShader GPU. Roboto Flex SHA-256 `9b523f7d82593df0107173849ebb8c817471a1df4b4fb2c3cbf40cfd810c8281` and Material Symbols SHA-256 `3b29bd1ca84d209f68cc7ae4127e00d07ba9b8199edcd37ed5e2511e87836c03` match in the source tree, the gallery assets and both APKs; both runtime probes applied the `wdth` axis.

Frozen device, GPU, settings, and cold-boot procedure: `FROZEN_PROFILE.md`. Raw run log: `run.log`.

See `report.html` for side-by-side captures and diff heatmaps, and `results.json` for every per-run hash.
