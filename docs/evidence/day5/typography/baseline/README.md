# U-25.2 — the four matched-grid 1 px baseline offsets

**Status:** explained with device metrics; no code change. Proposed ±1 px baseline rule is in
ADR-010 (awaiting approval).
**Date:** 2026-11-26
**Device:** API 31 emulator, 1080×1920, 420 dpi (2.625×), font scale 1.0.

## 1. The observation

The matched-grid run (`docs/evidence/day5/typography/runs/matched-grid/`) puts 26/30 scenes at
byte-identical AA, but four scenes have a **+1 px ink-bbox top edge**:

| Scene | Compose bbox | RN bbox | Δy | AA px |
|---|---|---|---:|---:|
| type-display-small | 49,81 331×74 | 49,82 331×74 | +1 | 63 |
| type-display-small-emphasized | 49,81 340×74 | 49,82 340×74 | +1 | 105 |
| type-headline-small | 47,78 220×49 | 47,79 220×49 | +1 | 53 |
| type-headline-small-emphasized | 47,78 225×49 | 47,79 225×49 | +1 | 48 |

Width and height match exactly; only the vertical glyph phase differs. The same four roles are
`displaySmall` and `headlineSmall` (regular and emphasized) — the two roles whose font size and
line height land on exact integers at 2.625× (`36sp → 94.5 px` is ceil-snapped by the matched
grid; `24sp → 63 px`; line heights `44sp → 115.5 px`, `32sp → 84 px`).

## 2. Exact metrics

The metrics below are from the on-device `Paint` probe
(`docs/evidence/day5/typography/baseline/font-metrics.log`), Roboto Flex at wght 500. Vertical
metrics do not vary with weight. `hhea` ascent/descent are `1900/−500` over `unitsPerEm 2048`, so
the float values are exact at these sizes. Android's `FontMetricsInt` truncates toward zero.

| | displaySmall | headlineSmall |
|---|---:|---:|
| Compose font size (matched grid) | 95 px | 63 px |
| Compose line height | 115.5 px | 84 px |
| Compose float ascent / descent | −88.134766 / 23.193360 | −58.447266 / 15.380859 |
| Compose float natural height | 111.328126 | 73.828125 |
| Compose half-leading | (115.5 − 111.328126)/2 = 2.085937 | (84 − 73.828125)/2 = 5.085938 |
| **Compose baseline** | **90.220703** | **63.533203** |
| RN integer ascent / descent | −88 / 23 | −58 / 15 |
| RN span line height (`ceil`) | 116 | 84 |
| RN leading | 116 − 111 = 5 | 84 − 73 = 11 |
| RN half-leading (`ceil(leading/2)`) | 3 | 6 |
| **RN baseline** | **91** | **64** |
| Predicted baseline Δ | **+0.779297** | **+0.466797** |
| Observed ink-top Δ | **+1** | **+1** |

Formula used:

```
Compose:  baseline = -floatAscent + (lineHeight - (-floatAscent + floatDescent)) / 2
RN:       baseline = -intAscent  + ceil((ceil(lineHeight) - (-intAscent + intDescent)) / 2)
```

The predicted sub-pixel offsets are `+0.78 px` and `+0.47 px`; the rasterizer turns each into a
one-pixel ink shift. Cap height is `1456/2048 = 0.7109375 em`:

- displaySmall: cap top `90.220703 − 67.539063 = 22.681640` (Compose) vs
  `91 − 67.539063 = 23.460938` (RN) → first ink row 22 vs 23.
- headlineSmall: cap top `63.533203 − 44.789063 = 18.744141` vs
  `64 − 44.789063 = 19.210938` → first ink row 18 vs 19.

The matched grid deliberately uses Compose `TextMotion.Animated` = `(Linearity.Linear,
subpixelTextPositioning = true)`. That is the same rasterization mode RN uses: `CustomStyleSpan`
sets `isSubpixelText = true` and `isLinearText = true`. Both stacks therefore share the
rasterization flags; the +1 px is the **baseline offset alone**. Compose's fractional baseline
(90.2207 / 63.5332) and RN's integer baseline (91 / 64) differ by 0.78 / 0.47 px, which straddles
the rounding boundary, so the ink top lands one row lower in RN.

This is separate from the **faithful** run, where Compose uses `TextMotion.Static` =
`(Linearity.FontHinting, subpixelTextPositioning = false)` while RN uses linear text with subpixel
positioning on. There the rasterization mode itself differs, which adds horizontal and vertical
phase differences on top of the baseline offset; that is why faithful ink bboxes can move by ±1 px
in either direction. The four matched scenes isolate the baseline part.

## 3. Why `lineHeight` cannot fix it

`CustomLineHeightSpan` computes the integer leading from `ceil(height)` and the integer font
metrics, then splits it with `ceil` above and `floor` below. For displaySmall the leading is
`116 − 111 = 5`; there is no integer split that produces a half-leading of `2.086`. To move the RN
baseline from 91 to 90 the span height would have to be 115, not 116 — a **1 px layout-height
change**. The same holds for headlineSmall: baseline 63 requires height 83, not 84. The two
constraints (same layout height, same baseline) cannot both be met by RN's integer span.

A negative `translateY` on every text node would move the ink but is a per-role, per-density hack;
it also moves the text outside its layout box and is not a library-level fix. It is not proposed.

## 4. Conclusion

The four scenes are **layout-exact** (same width and height) and differ only in the internal
baseline by the predicted `0.47–0.78 px`, rasterized as `+1 px`. This is the documented ±1 px
baseline allowance proposed in ADR-010, not an implementation bug. The standard five-scene gate is
unaffected: its `text` and `trivial` scenes remain at 0 layout-edge delta.

## 5. Evidence

- `docs/evidence/day5/typography/baseline/font-metrics.log` — the raw `FontMetricsInt`/`FontMetrics`
  probe for every relevant integer and fractional size.
- `docs/evidence/day5/typography/runs/matched-grid/README.md` — the four bbox rows and AA counts.
- `node_modules/.pnpm/react-native@0.88.1_*/node_modules/react-native/ReactAndroid/src/main/java/com/facebook/react/views/text/internal/span/CustomLineHeightSpan.kt`
  — the integer `ceil`/`floor` half-leading code.
- `androidx.compose.ui:ui-text-android:1.12.0`, `TextMotion.android.kt:37-38` —
  `Static = (FontHinting, false)`, `Animated = (Linear, true)`; `TextPaintExtensions.android.kt`
  maps `subpixelTextPositioning` to `Paint.SUBPIXEL_TEXT_FLAG`.
- `react-native@0.88.1`, `ReactAndroid/.../views/text/internal/span/CustomStyleSpan.kt:100-101` —
  `isSubpixelText = true`, `isLinearText = true`.
