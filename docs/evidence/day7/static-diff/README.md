# Day 7 — static shape raster diff

**Device profile:** 1080x1920 px, density 2.625x (emulator).
**Grid:** 5x7, 64dp shapes on a
72dp pitch, 924x1302 px crop.

| Metric | Value |
|---|---:|
| Exact differing pixels | **12157** (1.0105%) |
| AA-aware differing pixels | **0** (0.0000%) |
| Max channel delta | 68 |
| Mean channel delta over differing pixels | 2.40 |
| Mean absolute delta (all pixels/channels) | 0.0163 |
| Pixels with Δ > 2 outside AA edges | **0** (0.0000%) |
| Flat fills with Δ > 2 | **0** |
| Exact bbox | 0,0 924x1302 |
| AA-aware bbox | none |

The two renderers consume the same cubic geometry (verified at `1e-4` in the Day 6
golden) and draw the same `#6750A4` fill on white. The exact-difference mask is the
anti-aliasing fringe along each edge. The max Δ 68 is an edge pixel; no flat fill
differs by more than 1/255. Pixelmatch's AA-aware count (threshold 0.1, includeAA
false) is **0**, which means no pixel exceeded its perceptual threshold outside its
AA heuristic — not that the crops are byte-identical. The threshold-independent
metric (Δ > 2 outside anti-aliased edges) is also **0**. Every shape lands in the same
64dp cell, so the layout-edge delta is zero.

This is a Day 7 renderer probe, not the five-scene PLAYBOOK §7 gate.
