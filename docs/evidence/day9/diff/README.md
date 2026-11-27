# Day 3 — reference harness and measured noise floor

**Generated:** 2026-11-27T18:29:25.329Z
**Profile:** M3E_API31, API 31, 1080×1920, 420dpi (2.625×), GPU swiftshader_indirect, font scale 1.0, animations 0.
**Runs:** 1 cold boots × 1 repeats of the trivial scene per app; 2 repeats of each other scene.

## Headline

- Cross-stack exact zero: **not met**.
- Trivial scene exact difference: **not in this run**.
- Trivial scene AA-aware difference: **not in this run**.
- Within-harness determinism: **zero exact diffs** across 20 renders; max exact diff per app/scene/boot combination: 0 px.
- Exact-zero scenes in every sampled boot: **none**.

See the per-scene table for the exact split. Text layout markers were not captured. This report does **not** tune the scene and does **not** propose or change a threshold. The threshold-independent columns (max channel Δ, mean Δ over differing pixels, Δ &gt; 2 outside AA edges, flat fills &gt; 2) are the evidence for deciding whether a future threshold ADR is needed.

## Measured noise split

**Determinism.** 20 renders across 10 app/scene/boot combinations; maximum exact difference between any repeat and its first run is **0 px**. Per-combination numbers are in the determinism table.

**Text anti-aliasing.** The trivial scene was not included in this run.

**Shadows.** The elevated rectangle is present and measured, not inferred from an empty scene:

| App | Non-background px outside rect | Max Δ from background | Min Δ from background |
|---|---:|---:|---:|



The shadow scene was not included in this run.

## Layout edges

| Scene | Compose content bbox | React Native content bbox | Max edge Δ |
|---|---|---:|
| interaction-states | 42,100 756×325 | 42,100 756×325 | 0 |
| state-layer-colors | 53,42 735×442 | 53,42 735×442 | 0 |
| focus-rings | 42,179 756×168 | 42,179 756×168 | 0 |
| elevation-levels | 34,107 792×349 | 34,107 792×349 | 0 |
| ripple-frames | 53,179 735×168 | 53,179 735×168 | 0 |

Strict bounding box of pixels that are not exactly the scene background, including anti-aliased glyph edges and the shadow. No tolerance is applied.

## Scene categories

| Category | Scenes | Σ exact px (scene max) | Σ AA-aware px (scene max) | Max AA-aware % | Gate |
|---|---:|---:|---:|---:|---|
| `interaction` | 5 | 389,856 | 0 | 0.0000% | tracked — no threshold |

Only the `core` category is the five-scene PLAYBOOK §7 gate. The `text` category contains the 30 typography roles (and, when included, the dense label/paragraph probes), tracked separately under U-25; its numbers are a regression ceiling, not a pass/fail claim. ADR-010 is pending.

## Noise split by scene

| Scene | Category | Exact px | Exact % | AA-aware px | AA-aware % | Max Δ | Boots |
|---|---|---:|---:|---:|---:|---:|---:|
| interaction-states | interaction | 97,787 | 22.1739% | 0 | 0.0000% | 9 | 1 |
| state-layer-colors | interaction | 187,908 | 42.6095% | 0 | 0.0000% | 9 | 1 |
| focus-rings | interaction | 2,254 | 0.5111% | 0 | 0.0000% | 18 | 1 |
| elevation-levels | interaction | 22,350 | 5.0680% | 0 | 0.0000% | 1 | 1 |
| ripple-frames | interaction | 79,557 | 18.0401% | 0 | 0.0000% | 11 | 1 |

## Non-AA text pixels (boot 1, trivial)

None.

## Determinism

| Boot | App | Scene | Runs | Max exact | Max AA-aware | Status |
|---:|---|---|---:|---:|---:|---|
| 0 | compose | interaction-states | 2 | 0 | 0 | zero |
| 0 | compose | state-layer-colors | 2 | 0 | 0 | zero |
| 0 | compose | focus-rings | 2 | 0 | 0 | zero |
| 0 | compose | elevation-levels | 2 | 0 | 0 | zero |
| 0 | compose | ripple-frames | 2 | 0 | 0 | zero |
| 0 | rn | interaction-states | 2 | 0 | 0 | zero |
| 0 | rn | state-layer-colors | 2 | 0 | 0 | zero |
| 0 | rn | focus-rings | 2 | 0 | 0 | zero |
| 0 | rn | elevation-levels | 2 | 0 | 0 | zero |
| 0 | rn | ripple-frames | 2 | 0 | 0 | zero |

## Cross-boot repeatability

| Boot | App | Scene | Exact px | AA-aware px | Max Δ |
|---:|---|---|---:|---:|---:|
| — | — | — | — | — | — |

## Profile and fonts

Every profile check passed: API 31, 1080×1920, 420dpi, font scale 1.0, locale en-US, animations 0, rotation 0, night mode off, SwiftShader GPU. The Roboto Flex SHA-256 is `9b523f7d82593df0107173849ebb8c817471a1df4b4fb2c3cbf40cfd810c8281` in both APKs and in the source tree; both runtime probes applied the `wdth` axis.

Frozen device, GPU, settings, and cold-boot procedure: `FROZEN_PROFILE.md`. Raw run log: `run.log`.

See `report.html` for side-by-side captures and diff heatmaps, and `results.json` for every per-run hash.
