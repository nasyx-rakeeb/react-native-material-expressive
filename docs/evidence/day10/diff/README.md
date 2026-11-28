# day10

**Generated:** 2026-11-28T07:16:43.441Z
**Profile:** M3E_API31, API 31, 1080×1920, 420dpi (2.625×), GPU swiftshader_indirect, font scale 1.0, animations 0.
**Runs:** 3 cold boots × 1 repeats of the trivial scene per app; 1 repeats of each other scene.

## Headline

- Cross-stack exact zero: **met**.
- Trivial scene exact difference: **not in this run**.
- Trivial scene AA-aware difference: **not in this run**.
- Within-harness determinism: **zero exact diffs** across 6 renders; max exact diff per app/scene/boot combination: 0 px.
- Exact-zero scenes in every sampled boot: **icon-symbols**.

See the per-scene table for the exact split. Text layout markers were not captured. This report does **not** tune the scene and does **not** propose or change a threshold. The threshold-independent columns (max channel Δ, mean Δ over differing pixels, Δ &gt; 2 outside AA edges, flat fills &gt; 2) are the evidence for deciding whether a future threshold ADR is needed.

## Measured noise split

**Determinism.** 6 renders across 6 app/scene/boot combinations; maximum exact difference between any repeat and its first run is **0 px**. Per-combination numbers are in the determinism table.

**Text anti-aliasing.** The trivial scene was not included in this run.

**Shadows.** The elevated rectangle is present and measured, not inferred from an empty scene:

| App | Non-background px outside rect | Max Δ from background | Min Δ from background |
|---|---:|---:|---:|



The shadow scene was not included in this run.

## Layout edges

| Scene | Compose content bbox | React Native content bbox | Max edge Δ |
|---|---|---:|
| icon-symbols | 102,47 641×445 | 102,47 641×445 | 0 |

Strict bounding box of pixels that are not exactly the scene background, including anti-aliased glyph edges and the shadow. No tolerance is applied.

## Scene categories

| Category | Scenes | Σ exact px (scene max) | Σ AA-aware px (scene max) | Max AA-aware % | Gate |
|---|---:|---:|---:|---:|---|
| `icon` | 1 | 0 | 0 | 0.0000% | tracked — no threshold |

Only the `core` category is the five-scene PLAYBOOK §7 gate. The `text` category contains the 30 typography roles (and, when included, the dense label/paragraph probes), tracked separately under U-25; its numbers are a regression ceiling, not a pass/fail claim. ADR-010 is pending.

## Noise split by scene

| Scene | Category | Exact px | Exact % | AA-aware px | AA-aware % | Max Δ | Boots |
|---|---|---:|---:|---:|---:|---:|---:|
| icon-symbols | icon | 0 | 0.0000% | 0 | 0.0000% | 0 | 3 |

## Non-AA text pixels (boot 1, trivial)

None.

## Determinism

| Boot | App | Scene | Runs | Max exact | Max AA-aware | Status |
|---:|---|---|---:|---:|---:|---|
| 0 | compose | icon-symbols | 1 | 0 | 0 | zero |
| 0 | rn | icon-symbols | 1 | 0 | 0 | zero |
| 1 | compose | icon-symbols | 1 | 0 | 0 | zero |
| 1 | rn | icon-symbols | 1 | 0 | 0 | zero |
| 2 | compose | icon-symbols | 1 | 0 | 0 | zero |
| 2 | rn | icon-symbols | 1 | 0 | 0 | zero |

## Cross-boot repeatability

| Boot | App | Scene | Exact px | AA-aware px | Max Δ |
|---:|---|---|---:|---:|---:|
| 1 | compose | icon-symbols | 0 | 0 | 0 |
| 1 | rn | icon-symbols | 0 | 0 | 0 |
| 2 | compose | icon-symbols | 0 | 0 | 0 |
| 2 | rn | icon-symbols | 0 | 0 | 0 |

## Profile and fonts

Every profile check passed: API 31, 1080×1920, 420dpi, font scale 1.0, locale en-US, animations 0, rotation 0, night mode off, SwiftShader GPU. Roboto Flex SHA-256 `9b523f7d82593df0107173849ebb8c817471a1df4b4fb2c3cbf40cfd810c8281` and Material Symbols SHA-256 `3b29bd1ca84d209f68cc7ae4127e00d07ba9b8199edcd37ed5e2511e87836c03` match in the source tree, the gallery assets and both APKs; both runtime probes applied the `wdth` axis.

Frozen device, GPU, settings, and cold-boot procedure: `FROZEN_PROFILE.md`. Raw run log: `run.log`.

See `report.html` for side-by-side captures and diff heatmaps, and `results.json` for every per-run hash.
