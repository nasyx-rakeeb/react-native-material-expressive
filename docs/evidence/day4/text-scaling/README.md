# Day 4 — text rasterization follow-up

**Generated:** 2026-11-25 (Day 3 follow-up, reported at the start of Day 5)
**Profile:** `M3E_API31`, API 31, 1080×1920, 420 dpi (2.625×), SwiftShader, font scale 1.0, animations 0.
**Font:** Roboto Flex, SHA-256 `9b523f7d82593df0107173849ebb8c817471a1df4b4fb2c3cbf40cfd810c8281`, identical in both APKs.
**Runs:** one warm boot per mode, one repeat per scene, seven scenes. Same-harness determinism is 0 exact px in every mode.

This report closes `U-23` with a root cause, not a threshold change. It does **not** modify the Day 3 gate. The four diagnostic modes are Compose-harness settings used only for analysis; they are not shipped behaviour and they are not gate settings.

## Headline

The cross-stack text difference is caused by **layout quantization**, not a font-file or shaping difference:

1. React Native draws text with `isSubpixelText = true` and `isLinearText = true`. Compose's default `TextMotion.Static` uses font hinting with subpixel text off. Matching RN's flags with `TextMotion.Animated` makes the 12-glyph `text` and `trivial` scenes **exactly 0 px**.
2. React Native rounds every font size **up to an integer physical pixel** (`Math.ceil(PixelUtil.toPixelFromDIP(fontSize))`). Compose keeps fractional sp. Matching RN's integer font size reduces the 195-glyph paragraph from **17,998** AA-aware px to **119** and the 78-glyph label stack from **5,313** to **348**.
3. React Native positions text on the integer pixel grid; Compose offsets with fractional dp. Snapping the Compose offsets to integer pixels removes the remainder: paragraph **1 exact px**, labels **2 exact px**, 0 AA-aware px.

With all three RN constraints matched, 285 non-space glyphs across the two dense scenes differ by **3 exact pixels** (max channel Δ 6), and the original `text` scene differs by **0 px**. The residual is therefore inherent to React Native's Android text layout, not to the library.

## Scenes and glyph counts

| Scene | Text layers | Non-space glyphs | Purpose |
|---|---:|---:|---|
| `text` | 1 | 12 | Day 3 gate scene |
| `paragraph` | 8 | 195 | Paragraph at four sizes and weights |
| `labels` | 10 | 78 | Dense short-label stack |

## Measured results

AA-aware pixels are pixelmatch's anti-aliasing-aware count. Percentages are of 441,000 px (840×525).

| Mode | Text flags | Size | Position | `text` exact / AA | `paragraph` exact / AA | `labels` exact / AA | Max Δ |
|---|---|---|---|---|---:|---:|---:|---:|
| Faithful | `Static` | fractional sp | fractional dp | 1,745 / 4 | 52,139 / 17,998 | 17,793 / 5,313 | 226 |
| Animated | `Animated` | fractional sp | fractional dp | **0 / 0** | 33,091 / 8,575 | 12,314 / 561 | 226 |
| Animated + ceil | `Animated` | integer px (`ceil`) | fractional dp | **0 / 0** | 4,128 / 119 | 4,357 / 348 | 226 |
| Animated + ceil + floor | `Animated` | integer px (`ceil`) | integer px (`floor`) | **0 / 0** | **1 / 0** | **2 / 0** | 6 |

AA-aware percentages for the dense scenes:

| Mode | `paragraph` AA % | `labels` AA % | Existing 0.05% gate |
|---|---:|---:|---|
| Faithful | 4.0812% | 1.2048% | fails on dense diagnostics |
| Animated | 1.9444% | 0.1272% | fails on dense diagnostics |
| Animated + ceil | 0.0270% | 0.0789% | `paragraph` passes, `labels` narrowly fails |
| Animated + ceil + floor | 0.0000% | 0.0000% | passes |

The Day 3 gate scene (`text`) is 4 AA-aware px under the faithful default, which is 0.0009% — below the existing 220.5 px / 0.05% budget. **No threshold is proposed or changed.** The dense scenes are new diagnostics and were never part of the gate.

## Exact non-AA pixels (faithful, `text` scene)

The only four AA-aware pixels are on a single glyph edge:

| Coordinate | Compose | React Native |
|---|---|---|
| 416, 111 | rgb(255, 251, 254) | rgb(170, 167, 170) |
| 417, 111 | rgb(148, 145, 149) | rgb(255, 251, 254) |
| 417, 113 | rgb(29, 27, 32) | rgb(170, 167, 170) |
| 417, 114 | rgb(29, 27, 32) | rgb(57, 55, 60) |

AA bbox: `x=416 y=111 w=2 h=4`; max channel Δ 162. The `trivial` scene repeats the same four pixels at y+294 because the scene is translated, not rasterized differently.

## Why each step matters

- **Flags alone** remove the simple-scene difference but only 5–10% of dense-scene pixels. Dense text has many fractional font sizes; the flag change does not alter glyph advance widths.
- **Integer font sizes** change glyph advances and therefore line width. That is why dense-scene differences drop by an order of magnitude. The Compose probe width at weight 500 moved from 169 px at 36.75 px to 176 px at 37 px, showing that the rounding boundary is real.
- **Integer offsets** remove the last sub-pixel placement differences. At that point the glyphs are drawn with the same rasterizer settings on the same pixel grid.

## Source evidence

| Fact | Source |
|---|---|
| Compose 1.5 exposes only `TextMotion.Static` (`Linearity.FontHinting`, subpixel `false`) and `TextMotion.Animated` (`Linearity.Linear`, subpixel `true`). There is no `Linear` alias. | `androidx.compose.ui:ui-text-android:1.12.0`, `androidMain/androidx/compose/ui/text/style/TextMotion.android.kt:37-38`; `TextPaintExtensions.android.kt:179-183` |
| RN hardcodes subpixel + linear text on the style span. | `react-native@0.88.1`, `ReactAndroid/src/main/java/com/facebook/react/views/text/internal/span/CustomStyleSpan.kt:100-101` |
| RN rounds font sizes up to an integer physical pixel. | `react-native@0.88.1`, `ReactAndroid/src/main/java/com/facebook/react/views/text/ReactTextView.java:490-494` |
| Compose's default harness uses exact fractional sizes and dp offsets. | `apps/reference-compose/app/src/main/java/com/nasyxrakeeb/m3ereference/MainActivity.kt` |

Quoted excerpts and URLs are in `SOURCE_EVIDENCE.md`. Android Views are laid out at integer pixels; React Native's text view inherits that. Compose's `Modifier.offset(x.dp, y.dp)` preserves fractional dp.

## Reproduce

```sh
# Faithful (gate settings)
M3E_SKIP_BOOT=1 M3E_BOOTS=1 M3E_REPEATS=1 M3E_SCENE_REPEATS=1 \
M3E_SCENES=solid,rect,text,shadow,trivial,paragraph,labels \
M3E_OUT=/tmp/m3e-text-final3/faithful node tools/pixel/run.mjs

# Animated text flags
M3E_TEXT_MOTION=animated ...
# Animated + integer physical-pixel font sizes
M3E_TEXT_MOTION=animated M3E_TEXT_SIZE_MODE=ceil ...
# Animated + integer sizes + integer offsets
M3E_TEXT_MOTION=animated M3E_TEXT_SIZE_MODE=ceil M3E_TEXT_POS_MODE=floor ...
```

Raw logs are in `runs/<mode>/run.log`; each run directory contains its own `results.json`, generated `README.md`, `report.html`, captures, and diff images. `summary.json` consolidates the four runs and includes the four pixel values above.

## Decision

- `U-23` is resolved: the difference is an inherent RN-vs-Compose text-layout quantization difference, not an implementation bug.
- The existing AA-aware gate remains unchanged. No `KNOWN_DEVIATIONS.md` threshold exception and no ADR are proposed. The deviation is documented for future text components.
- Any future claim of byte-exact cross-stack text parity remains false under faithful Compose defaults; the accurate claim is **4 AA-aware px on the Day 3 gate scene, 0 exact px when RN's integer text grid is matched in both harnesses**.
- The diagnostic modes must not become shipped defaults without an ADR: `ceil` grows glyphs by up to 1 physical pixel and `floor` changes text placement.

## Files

- `summary.json` — consolidated metrics, glyph counts, exact pixel colours, gate flags.
- `runs/faithful/`, `runs/animated/`, `runs/ceil/`, `runs/floor/` — raw capture, diff, report, and log evidence.
- `SOURCE_EVIDENCE.md` — quoted framework source excerpts and URLs.
