# Day 7 — static shape raster diff

**Device profile:** 1080x1920 px, density 2.625x (emulator).
**Grid:** 5x7, 64dp shapes on a
72dp pitch, 924x1302 px crop.

| Metric | Value |
|---|---:|
| Exact differing pixels | **12157** (1.0105%) |
| AA-aware differing pixels | **0** (0.0000%) |
| Max channel delta | 68 |
| Mean absolute delta | 0.0163 |
| Exact bbox | 0,0 924x1302 |
| AA-aware bbox | none |

The two renderers consume the same cubic geometry (verified at `1e-4` in the Day 6
golden) and draw the same `#6750A4` fill on white. The exact-difference mask is the
anti-aliasing fringe along each edge (mean absolute delta
0.0163); the AA-aware mask, which ignores pixels that
sit on a colour gradient in both captures, is **empty**. Every shape lands in the same
64dp cell, so the layout-edge delta is zero.

This is a Day 7 renderer probe, not the five-scene PLAYBOOK §7 gate.
