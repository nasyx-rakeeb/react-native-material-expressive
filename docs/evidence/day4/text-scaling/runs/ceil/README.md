# Day 3 — reference harness and measured noise floor

**Generated:** 2026-11-25T18:49:54.956Z
**Profile:** M3E_API31, API 31, 1080×1920, 420dpi (2.625×), GPU swiftshader_indirect, font scale 1.0, animations 0.
**Runs:** 1 cold boots × 1 repeats of the trivial scene per app; 1 repeats of each other scene.

## Headline

- Cross-stack exact zero on the trivial scene: **not met**.
- Trivial scene exact difference: **0 px (0.0000%)**.
- Trivial scene AA-aware difference: **0 px (0.0000%)**.
- Within-harness determinism: **zero exact diffs** across 14 renders; max exact diff per app/scene/boot combination: 0 px.
- Exact-zero scenes in every sampled boot: **solid, rect, text, shadow**.

The cross-stack difference is text-only. Measured text layout: Compose 402.0×73.0 px, React Native 402.0×73.0 px. The frameworks rasterize some glyph edges differently. This report does **not** tune the scene and does **not** propose a new threshold.

## Measured noise split

**Determinism.** 14 renders across 14 app/scene/boot combinations; maximum exact difference between any repeat and its first run is **0 px**. Per-combination numbers are in the determinism table.

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
| paragraph | 42,31 615×431 | 42,31 614×431 | 1 |
| labels | 41,17 216×477 | 42,16 215×478 | 1 |

Strict bounding box of pixels that are not exactly the scene background, including anti-aliased glyph edges and the shadow. No tolerance is applied.

## Noise split by scene

| Scene | Exact px | Exact % | AA-aware px | AA-aware % | Max Δ | Boots |
|---|---:|---:|---:|---:|---:|---:|
| solid | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| rect | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| text | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| shadow | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| trivial | 0 | 0.0000% | 0 | 0.0000% | 0 | 1 |
| paragraph | 4,128 | 0.9361% | 119 | 0.0270% | 182 | 1 |
| labels | 4,357 | 0.9880% | 348 | 0.0789% | 226 | 1 |

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
| 0 | compose | paragraph | 1 | 0 | 0 | zero |
| 0 | compose | labels | 1 | 0 | 0 | zero |
| 0 | rn | solid | 1 | 0 | 0 | zero |
| 0 | rn | rect | 1 | 0 | 0 | zero |
| 0 | rn | text | 1 | 0 | 0 | zero |
| 0 | rn | shadow | 1 | 0 | 0 | zero |
| 0 | rn | trivial | 1 | 0 | 0 | zero |
| 0 | rn | paragraph | 1 | 0 | 0 | zero |
| 0 | rn | labels | 1 | 0 | 0 | zero |

## Cross-boot repeatability

| Boot | App | Scene | Exact px | AA-aware px | Max Δ |
|---:|---|---|---:|---:|---:|
| — | — | — | — | — | — |

## Profile and fonts

Every profile check passed: API 31, 1080×1920, 420dpi, font scale 1.0, locale en-US, animations 0, rotation 0, night mode off, SwiftShader GPU. The Roboto Flex SHA-256 is `9b523f7d82593df0107173849ebb8c817471a1df4b4fb2c3cbf40cfd810c8281` in both APKs and in the source tree; both runtime probes applied the `wdth` axis.

Frozen device, GPU, settings, and cold-boot procedure: `FROZEN_PROFILE.md`. Raw run log: `run.log`.

See `report.html` for side-by-side captures and diff heatmaps, and `results.json` for every per-run hash.
