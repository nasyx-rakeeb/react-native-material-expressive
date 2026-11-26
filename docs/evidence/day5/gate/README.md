# Day 5 — standard five-scene gate

**Generated:** 2026-11-26T07:56:41.610Z
**Profile:** M3E_API31, API 31, 1080×1920, 420dpi (2.625×), GPU swiftshader_indirect, font scale 1.0, animations 0.
**Runs:** 3 cold boots × 20 repeats of the trivial scene per app; 2 repeats of each other scene.

## Headline

- Cross-stack exact zero: **not met**.
- Trivial scene exact difference: **1,745 px (0.3957%)**.
- Trivial scene AA-aware difference: **4 px (0.0009%)**.
- Within-harness determinism: **zero exact diffs** across 168 renders; max exact diff per app/scene/boot combination: 0 px.
- Exact-zero scenes in every sampled boot: **solid, rect, shadow**.

The cross-stack difference is text-only. Measured text layout: Compose 402.0×73.0 px, React Native 402.0×73.0 px. The frameworks rasterize some glyph edges differently. This report does **not** tune the scene and does **not** propose a new threshold.

## Measured noise split

**Determinism.** 168 renders across 30 app/scene/boot combinations; maximum exact difference between any repeat and its first run is **0 px**. Per-combination numbers are in the determinism table.

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

## Noise split by scene

| Scene | Exact px | Exact % | AA-aware px | AA-aware % | Max Δ | Boots |
|---|---:|---:|---:|---:|---:|---:|
| solid | 0 | 0.0000% | 0 | 0.0000% | 0 | 3 |
| rect | 0 | 0.0000% | 0 | 0.0000% | 0 | 3 |
| text | 1,745 | 0.3957% | 4 | 0.0009% | 162 | 3 |
| shadow | 0 | 0.0000% | 0 | 0.0000% | 0 | 3 |
| trivial | 1,745 | 0.3957% | 4 | 0.0009% | 162 | 3 |

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
| 0 | compose | trivial | 20 | 0 | 0 | zero |
| 0 | rn | solid | 2 | 0 | 0 | zero |
| 0 | rn | rect | 2 | 0 | 0 | zero |
| 0 | rn | text | 2 | 0 | 0 | zero |
| 0 | rn | shadow | 2 | 0 | 0 | zero |
| 0 | rn | trivial | 20 | 0 | 0 | zero |
| 1 | compose | solid | 2 | 0 | 0 | zero |
| 1 | compose | rect | 2 | 0 | 0 | zero |
| 1 | compose | text | 2 | 0 | 0 | zero |
| 1 | compose | shadow | 2 | 0 | 0 | zero |
| 1 | compose | trivial | 20 | 0 | 0 | zero |
| 1 | rn | solid | 2 | 0 | 0 | zero |
| 1 | rn | rect | 2 | 0 | 0 | zero |
| 1 | rn | text | 2 | 0 | 0 | zero |
| 1 | rn | shadow | 2 | 0 | 0 | zero |
| 1 | rn | trivial | 20 | 0 | 0 | zero |
| 2 | compose | solid | 2 | 0 | 0 | zero |
| 2 | compose | rect | 2 | 0 | 0 | zero |
| 2 | compose | text | 2 | 0 | 0 | zero |
| 2 | compose | shadow | 2 | 0 | 0 | zero |
| 2 | compose | trivial | 20 | 0 | 0 | zero |
| 2 | rn | solid | 2 | 0 | 0 | zero |
| 2 | rn | rect | 2 | 0 | 0 | zero |
| 2 | rn | text | 2 | 0 | 0 | zero |
| 2 | rn | shadow | 2 | 0 | 0 | zero |
| 2 | rn | trivial | 20 | 0 | 0 | zero |

## Cross-boot repeatability

| Boot | App | Scene | Exact px | AA-aware px | Max Δ |
|---:|---|---|---:|---:|---:|
| 1 | compose | solid | 0 | 0 | 0 |
| 1 | compose | rect | 0 | 0 | 0 |
| 1 | compose | text | 0 | 0 | 0 |
| 1 | compose | shadow | 0 | 0 | 0 |
| 1 | compose | trivial | 0 | 0 | 0 |
| 1 | rn | solid | 0 | 0 | 0 |
| 1 | rn | rect | 0 | 0 | 0 |
| 1 | rn | text | 0 | 0 | 0 |
| 1 | rn | shadow | 0 | 0 | 0 |
| 1 | rn | trivial | 0 | 0 | 0 |
| 2 | compose | solid | 0 | 0 | 0 |
| 2 | compose | rect | 0 | 0 | 0 |
| 2 | compose | text | 0 | 0 | 0 |
| 2 | compose | shadow | 0 | 0 | 0 |
| 2 | compose | trivial | 0 | 0 | 0 |
| 2 | rn | solid | 0 | 0 | 0 |
| 2 | rn | rect | 0 | 0 | 0 |
| 2 | rn | text | 0 | 0 | 0 |
| 2 | rn | shadow | 0 | 0 | 0 |
| 2 | rn | trivial | 0 | 0 | 0 |

## Profile and fonts

Every profile check passed: API 31, 1080×1920, 420dpi, font scale 1.0, locale en-US, animations 0, rotation 0, night mode off, SwiftShader GPU. The Roboto Flex SHA-256 is `9b523f7d82593df0107173849ebb8c817471a1df4b4fb2c3cbf40cfd810c8281` in both APKs and in the source tree; both runtime probes applied the `wdth` axis.

Frozen device, GPU, settings, and cold-boot procedure: `FROZEN_PROFILE.md`. Raw run log: `run.log`.

See `report.html` for side-by-side captures and diff heatmaps, and `results.json` for every per-run hash.
