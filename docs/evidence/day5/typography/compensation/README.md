# U-25.1 — D-001 pipeline and RN-side compensation experiment

**Status:** diagnostic only. No shipped token value, scene, gate, or threshold changed.
**Date:** 2026-11-26
**Device:** API 31 emulator, 1080×1920, 420 dpi (2.625×), font scale 1.0, Roboto Flex
`9b523f7d82593df0107173849ebb8c817471a1df4b4fb2c3cbf40cfd810c8281`.

## 1. What React Native quantizes, and where

D-001 is the residual between Compose's float text layout and React Native's integer text
pipeline. It is not a font-axis or token bug: both apps bundle the same font and receive the same
`fontSize`, `lineHeight`, `letterSpacing`, and weight. The quantization happens at three layout
points (§1.1–§1.3); a fourth, separate rasterization-mode mismatch is described in §1.4.

### 1.1 Font size → integer pixels

RN 0.88.1 `TextAttributes.effectiveFontSize` (`ReactAndroid/.../views/text/TextAttributes.kt:65`)
computes:

```kotlin
Math.ceil(PixelUtil.toPixelFromSP(fontSize, maxFontSizeMultiplier).toDouble()).toInt()
```

`TextLayoutManager` applies that integer through `ReactAbsoluteSizeSpan(textAttributes.fontSize)`
(`TextLayoutManager.kt:314`). Compose keeps the fractional value (`36sp × 2.625 = 94.5 px`); RN
renders at `ceil(94.5) = 95 px`. Every glyph outline and advance is therefore computed at the
integer size. At `displayMedium` the error is `119 − 118.125 = 0.875 px`; at `displaySmall` it is
`95 − 94.5 = 0.5 px`; at `bodyMedium` it is `37 − 36.75 = 0.25 px`.

### 1.2 Line height → integer span height and integer half-leading

`TextAttributeProps.lineHeight` stores pixels (`TextAttributeProps.kt:36`). The span then does
(`internal/span/CustomLineHeightSpan.kt:20`):

```kotlin
val lineHeight: Int = ceil(height.toDouble()).toInt()
val leading = lineHeight - ((-fm.ascent) + fm.descent)   // integer FontMetricsInt
fm.ascent -= ceil(leading / 2.0f).toInt()
fm.descent += floor(leading / 2.0f).toInt()
```

Compose uses `LineHeightStyle(Center, None)` with float metrics and float half-leading. RN rounds
the line height, truncates the font metrics to integers, and splits the remaining leading with
`ceil` above and `floor` below. The baseline can move by up to ~1 px even when the reported layout
height is identical. U-25.2 measures this exactly.

### 1.3 Letter spacing → em against the integer font size

RN converts the requested pixel spacing to em and divides by the **integer** font size
(`TextAttributeProps.kt:169`):

```kotlin
val letterSpacingPixels = toPixelFromSP(letterSpacingInput)
return letterSpacingPixels / fontSize
```

`CustomLetterSpacingSpan` then sets `paint.letterSpacing` to that em value. The inter-glyph spacing
in pixels is preserved to float precision, but the glyph advances themselves are computed at the
integer font size from §1.1, so the total advance width drifts. For an 8-glyph sample the measured
drift is up to **4.57 px** (`displayLarge` is 536.0 px in Compose vs 540.6 px in RN; `bodyMedium`
is 135.0 vs 138.6 px).

### 1.4 Rasterization flags → faithful-mode mismatch

RN's `CustomStyleSpan.apply` sets `isSubpixelText = true` and `isLinearText = true`
(`internal/span/CustomStyleSpan.kt:100`). Compose has two modes:

- `TextMotion.Static = (Linearity.FontHinting, subpixelTextPositioning = false)` — the faithful
  harness default.
- `TextMotion.Animated = (Linearity.Linear, subpixelTextPositioning = true)` — the matched grid.

The faithful comparison therefore differs on **both** rasterization axes: Compose hints and
disables subpixel positioning, while RN uses linear metrics and subpixel origins. The matched grid
uses `Animated`, which matches RN's linear+subpixel flags and isolates the integer layout
quantization. This flag mismatch is part of the faithful AA residual; it is not the baseline
arithmetic in U-25.2.

A bare Android `Paint` reports flags `0x503` (`ANTI_ALIAS | FILTER_BITMAP | DEV_KERN |
EMBEDDED_BITMAP`), but that is not the span paint RN renders with: `CustomStyleSpan` adds subpixel
and linear text at draw time. The `baseline/font-metrics.log` probe is used only for
`FontMetricsInt`/`FontMetrics`.

## 2. Compensation strategies

The harness accepts `M3E_RN_TEXT_COMP=<none|c1|c2|c3|c4>`; the default is `none`. Only the RN
side is overridden. Compose always renders the token-exact values. Overrides are generated in
`docs/evidence/day5/typography/compensation.json` and applied only by
`apps/gallery/src/harness/text-compensation.generated.ts`.

| Strategy | Adjusts | Rule |
|---|---|---|
| **C1** | `fontSize` | Force RN's `ceil(fontPx)` to `round(fontPx)` by passing `(N − 0.001)/density` sp. |
| **C2** | C1 + `letterSpacing` | Match Compose's measured advance width for the 8-glyph sample: estimate glyph advance, rescale for the new integer size, solve for the per-role spacing. |
| **C3** | C2 + `lineHeight` | Snap the three `.5 px` line heights down by 1 px (`displaySmall`, `headlineMedium`, `titleLarge`). |
| **C4** | C3 + `letterSpacing` | Re-solve spacing against the **ink bbox width** instead of the measured advance width. |

C2–C4 are per-role, per-string fits to one 8-glyph sample (`"Material"`). They are not a general
typographic rule and must not ship as token values. `tools/typography/derive-c2.mjs` re-derives the
committed C2 table from the faithful run and writes `derived-c2.json`; the worst difference against
`compensation.json` is 0 after 4-decimal rounding. The fixed table was then tested at four
density/font-scale profiles — see `../profile-matrix/` and ADR-010.

## 3. Results — the 21 faithful failures

Full 30-role faithful baseline: **17,798 AA-aware px**, 9/30 inside the 0.05% image budget. The 21
failures account for **17,445 px**. Values are AA-aware differing pixels; percentages are of the
441,000 px scene.

| Scene | Baseline | C1 size | C2 size+tracking | C3 C2+line-height | C4 C3+ink-bbox width |
|---|---:|---:|---:|---:|---:|
| type-body-medium-emphasized | 326 (0.0739%) | 326 (0.0739%) | 38 (0.0086%) | 38 (0.0086%) | 38 (0.0086%) |
| type-body-medium | 676 (0.1533%) | 676 (0.1533%) | 127 (0.0288%) | 127 (0.0288%) | 11 (0.0025%) |
| type-body-small-emphasized | 311 (0.0705%) | 311 (0.0705%) | 135 (0.0306%) | 135 (0.0306%) | 114 (0.0259%) |
| type-body-small | 334 (0.0757%) | 334 (0.0757%) | 308 (0.0698%) | 308 (0.0698%) | 167 (0.0379%) |
| type-display-large-emphasized | 1236 (0.2803%) | 1236 (0.2803%) | 4 (0.0009%) | 4 (0.0009%) | 4 (0.0009%) |
| type-display-large | 2745 (0.6224%) | 2745 (0.6224%) | 8 (0.0018%) | 8 (0.0018%) | 29 (0.0066%) |
| type-display-medium-emphasized | 1696 (0.3846%) | 1 (0.0002%) | 0 (0.0000%) | 0 (0.0000%) | 0 (0.0000%) |
| type-display-medium | 1629 (0.3694%) | 0 (0.0000%) | 1 (0.0002%) | 1 (0.0002%) | 1 (0.0002%) |
| type-display-small-emphasized | 1839 (0.4170%) | 1839 (0.4170%) | 129 (0.0293%) | 5 (0.0011%) | 178 (0.0404%) |
| type-display-small | 949 (0.2152%) | 949 (0.2152%) | 68 (0.0154%) | 2 (0.0005%) | 68 (0.0154%) |
| type-headline-medium-emphasized | 714 (0.1619%) | 714 (0.1619%) | 64 (0.0145%) | 5 (0.0011%) | 64 (0.0145%) |
| type-headline-medium | 993 (0.2252%) | 993 (0.2252%) | 58 (0.0132%) | 3 (0.0007%) | 103 (0.0234%) |
| type-label-large-emphasized | 474 (0.1075%) | 474 (0.1075%) | 90 (0.0204%) | 90 (0.0204%) | 1 (0.0002%) |
| type-label-large | 397 (0.0900%) | 397 (0.0900%) | 83 (0.0188%) | 83 (0.0188%) | 6 (0.0014%) |
| type-label-medium-emphasized | 663 (0.1503%) | 663 (0.1503%) | 187 (0.0424%) | 187 (0.0424%) | 88 (0.0200%) |
| type-label-medium | 375 (0.0850%) | 375 (0.0850%) | 140 (0.0317%) | 140 (0.0317%) | 100 (0.0227%) |
| type-label-small-emphasized | 397 (0.0900%) | 397 (0.0900%) | 73 (0.0166%) | 73 (0.0166%) | 13 (0.0029%) |
| type-title-large-emphasized | 222 (0.0503%) | 222 (0.0503%) | 2 (0.0005%) | 62 (0.0141%) | 0 (0.0000%) |
| type-title-large | 598 (0.1356%) | 598 (0.1356%) | 2 (0.0005%) | 48 (0.0109%) | 2 (0.0005%) |
| type-title-small-emphasized | 474 (0.1075%) | 474 (0.1075%) | 90 (0.0204%) | 90 (0.0204%) | 1 (0.0002%) |
| type-title-small | 397 (0.0900%) | 397 (0.0900%) | 83 (0.0188%) | 83 (0.0188%) | 6 (0.0014%) |
| **Total (21)** | **17,445** | **14,121** | **1,690** | **1,492** | **994** |
| **Within 0.05%** | **0/21** | **2/21** | **20/21** | **20/21** | **21/21** |

Ink-bbox deltas (Compose minus RN; absolute maxima over the 21 scenes):

| Strategy | Δx | Δy | Δwidth | Δheight |
|---|---:|---:|---:|---:|
| none (baseline) | 0 | 0 | 5 | 0 |
| C1 | 1 | 1 | 5 | 0 |
| C2 | 1 | 1 | 2 | 0 |
| C3 | 1 | 1 | 2 | 1 |
| C4 | 1 | 1 | 0 | 0 |

### What each strategy proves

- **C1 (font size only)** fixes only `displayMedium` and its emphasized pair, because those are the
  only failing roles whose fractional pixel size rounds *down* (`118.125 → 118`). The `.5` roles
  round to the same integer RN already uses, so C1 cannot help them.
- **C2 (width compensation)** removes most of the error: 17,445 → 1,690 px, 20/21. It is a
  per-string fit: the letter spacing is solved from one 8-glyph sample and would be wrong for a
  different string.
- **C3 (line-height snap)** improves `displaySmall` and `headlineMedium` but **regresses
  `titleLarge`** (2 → 48/62 px) and changes the layout height by 1 px. Trading a layout box for a
  baseline is not acceptable under the gate.
- **C4 (ink-bbox width)** is the only strategy that reaches 21/21 and zero width-bbox delta, but it
  regresses `displaySmallEmphasized` (5 → 178), `headlineMedium` (3 → 103), `displaySmall` (2 → 68),
  and `headlineMediumEmphasized` (5 → 64). It is an overfit lookup table, not a rule. A computed
  per-scene hybrid of C2/C3/C4 would reach 575 px, but it is the same lookup table with a lower
  floor and is not proposed.

## 4. Conclusion

The residual is **inherent to RN's integer text pipeline**, not a token or font defect. No
density-independent, string-independent compensation exists inside RN's public text API:

- font size can be snapped to the nearest integer (C1), which is principled but only helps
  fractional sizes above `.5`;
- letter spacing can be fitted to one measured string (C2/C4), which does not generalize;
- line height can be snapped, but that changes the layout box (C3) and violates the gate.

The shipped theme therefore stays token-exact. U-25.3 proposes a text-category metric that
normalizes the AA residual by text ink instead of image area. The compensation harness remains
diagnostic (`M3E_RN_TEXT_COMP`, default `none`).

## 5. Reproduction

```bash
# Build the gallery with the diagnostic overrides.
rm -f apps/gallery/android/app/build/generated/assets/react/release/index.android.bundle
(cd apps/gallery/android && ./gradlew :app:assembleRelease)
adb install -r apps/gallery/android/app/build/outputs/apk/release/app-release.apk

SCENES=$(node -e "const r=require('./docs/evidence/day5/typography/runs/faithful/results.json');const c=r.boots[0].crossStack;console.log(Object.keys(c).filter(k=>k.startsWith('type-')&&c[k].aaAwareDiffPercent>0.05).join(','))")
M3E_SKIP_BOOT=1 M3E_BOOTS=1 M3E_REPEATS=1 M3E_SCENE_REPEATS=1 \
  M3E_RN_TEXT_COMP=c4 M3E_SCENES="$SCENES" \
  M3E_OUT=docs/evidence/day5/typography/compensation/runs/c4 \
  node tools/pixel/run.mjs
```

The four diagnostic runs were captured under
`/private/var/folders/_n/mz9_62997j5c7cy66p0bn5mw0000gn/T/opencode/m3e-u25-{c1,c2,c3,c4}`; the
per-scene numbers are reproduced above. Raw captures are not committed (they are ~1 MB per run).
The override table is committed at `docs/evidence/day5/typography/compensation.json`.
