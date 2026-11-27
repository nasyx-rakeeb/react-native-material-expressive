# U-25.5 — C2 profile matrix: does the fixed compensation table generalize?

**Status:** diagnostic. No shipped token, scene, gate, or threshold is changed by this
evidence. ADR-010 remains **proposed**.

**Date:** 2026-11-26 / 2026-11-27
**Question (Nasyx):** Does C2 hold at two or more other density/font-scale combinations,
including font scale 1.3? If it does, it becomes the shipping text renderer. Also list the
roles that still fail the original 0.05% image gate under C2, and reject C4-style
per-string/per-density tuning unless it can be made generic.

## 1. What C2 is

C2 is not a typographic rule. It is a per-role, per-sample **advance-width fit**:

1. Compose lays out at the fractional size `F × d × s` px, where `F` is the role's token
   size in sp, `d` is density and `s` is font scale. RN lays out at
   `N = ceil(F × d × s)` px (`TextAttributeProps.setFontSize` calls
   `Math.ceil(PixelUtil.toPixelFromSP(...))` and stores an `Int`).
2. If `N` differs from `round(F × d × s)`, C1 first replaces `F` with
   `(round(F × d × s) − 0.001) / (d × s)` so RN's `ceil` lands on the nearest integer.
3. C2 measures the sample string's advance width on both stacks. It replaces the role's
   absolute `letterSpacing` `L0` with

   ```text
   L = L0 + (W_compose − W_rn_at_C1) / ((g − 1) × d × s)
   ```

   where `g` is the glyph count (8 for `"Material"`) and `W_rn_at_C1` is the measured RN
   width scaled to the C1 integer size when C1 applies. The width error is spread over the
   `g − 1` inter-glyph gaps.

The committed table (`docs/evidence/day5/typography/compensation.json`,
`strategies.c2`) is this formula evaluated on the 8-glyph `"Material"` sample at 420 dpi
(2.625×), font scale 1.0. `tools/typography/derive-c2.mjs` reproduces all 21 values from
the faithful run; the worst difference is **0.00004 sp** (rounding to 4 decimals).

**Why it works at the fitted profile:** RN's integer font size changes every glyph
advance by an amount proportional to the quantization error
`ε = N − F × d × s`. Over 8 glyphs the error accumulates to 1.5–4.6 px. Matching the
total advance removes that cumulative horizontal drift, so the glyph edges land at the
same x positions for this sample. C2 does **not** change vertical metrics, line-height
rounding, or rasterization flags (Compose `TextMotion.Static` hints with subpixel
positioning off; RN is linear with subpixel on). That is why C2 still leaves a residual.

**Why it is not generic:** `ε` changes with density and font scale, and the required
spacing depends on the sample's glyph advances. A fixed table encodes one `ε` per role at
one profile and one string. At another profile the same table over- or under-corrects.
Re-fitting at each profile would require Compose's fractional advance at runtime; RN does
not expose it before layout, and `onTextLayout` is post-layout (a visible reflow that still
cannot undo RN's quantization). A per-profile or per-string table is therefore not a
shipping renderer.

## 2. Method

- Same 30 `type-*` scenes and the same two APKs as the Day 5 faithful run.
- The RN harness is launched with `fontScaling=1` so `allowFontScaling` matches shipping
  behavior and the system font scale is honored on both stacks. At font scale 1.0 this is
  pixel-identical to the committed faithful run (control: **17,798 AA px, 21/30 failures**,
  exactly the Day 5 numbers).
- Profiles:
  - `420/1.0` — the frozen gate profile (control).
  - `420/1.3` — the required font-scale check.
  - `320/1.0` — a different density.
  - `320/1.3` — both changed at once (extra robustness).
- For each profile, two runs: `M3E_RN_TEXT_COMP=none` (token-exact baseline) and
  `M3E_RN_TEXT_COMP=c2` (the fixed table above). One capture per scene, no repeats;
  determinism is not the question here.
- Density is set with `adb shell wm density`; font scale with
  `settings put system font_scale`. The pixel harness gained opt-in
  `M3E_DENSITY` / `M3E_FONT_SCALE` overrides for these runs; the frozen profile is
  unchanged when the variables are absent.

Raw captures stay in the temp run directory. `results.json` for each run and the
aggregated `summary.json` / `summary.md` are committed.

## 3. Results

### 3.1 Summary

| Profile | Strategy | Total AA px | Image-gate failures | Worst AA % | Worst AA / 1,000 ink | Worst AA / glyph / font px |
|---|---|---:|---:|---:|---:|---:|
| 420dpi / 1.0 | token-exact | 17,798 | 21/30 | 0.6224% | 410.0 | 2.63 |
| 420dpi / 1.0 | C2 | 2,043 | 1/30 | 0.0698% | 243.3 | 1.22 |
| 420dpi / 1.3 | token-exact | 214,694 | 30/30 | 8.2952% | 1,542.6 | 30.56 |
| 420dpi / 1.3 | C2 | 213,357 | 25/30 | 8.0739% | 1,513.9 | 29.75 |
| 320dpi / 1.0 | token-exact | 3,174 | 10/30 | 0.1531% | 398.6 | 1.63 |
| 320dpi / 1.0 | C2 | 9,331 | 19/30 | 0.9191% | 423.7 | 2.58 |
| 320dpi / 1.3 | token-exact | 118,751 | 24/30 | 8.3996% | 1,482.5 | 23.58 |
| 320dpi / 1.3 | C2 | 117,608 | 27/30 | 8.2117% | 1,446.3 | 23.05 |

AA pixels are AA-aware differences. `AA/1,000 ink` is normalized by the Compose
non-background pixel count for the 8-glyph sample. `AA/glyph/font px` is the
scale-invariant per-glyph metric: `AA_px ÷ glyphs ÷ (sizeSp × densityScale × fontScale)`.

### 3.2 C2 versus token-exact

| Profile | Improved | Regressed | Net AA px | C2 failures | Token-exact failures |
|---|---:|---:|---:|---:|---:|
| 320/1.0 | 3 | 18 | +6,157 | 19 | 10 |
| 320/1.3 | 11 | 10 | −1,143 | 27 | 24 |
| 420/1.0 | 21 | 0 | −15,755 | 1 | 21 |
| 420/1.3 | 10 | 11 | −1,337 | 25 | 30 |

### 3.3 Roles failing the original 0.05% image gate under C2

The original gate is `≤0.05%` of the whole image (`441,000 px` at 420 dpi → `220.5 px`;
`256,000 px` at 320 dpi → `128 px`).

### 3.3.1 420/1.0 — the fitted profile (1 failure)

| Role | AA px | AA % | Budget px | Over px | Ratio |
|---|---:|---:|---:|---:|---:|
| `type-body-small` | 308 | 0.0698% | 220.5 | 87.5 | 1.40× |

### 3.3.2 320/1.0 (19 failures)

| Role | AA px | AA % | Budget px | Over px | Ratio |
|---|---:|---:|---:|---:|---:|
| `type-display-large` | 2,353 | 0.9191% | 128 | 2,225 | 18.38× |
| `type-display-small` | 802 | 0.3133% | 128 | 674 | 6.27× |
| `type-display-small-emphasized` | 794 | 0.3102% | 128 | 666 | 6.20× |
| `type-display-large-emphasized` | 676 | 0.2641% | 128 | 548 | 5.28× |
| `type-headline-medium` | 525 | 0.2051% | 128 | 397 | 4.10× |
| `type-body-medium` | 414 | 0.1617% | 128 | 286 | 3.23× |
| `type-headline-medium-emphasized` | 401 | 0.1566% | 128 | 273 | 3.13× |
| `type-label-large` | 322 | 0.1258% | 128 | 194 | 2.52× |
| `type-title-small` | 322 | 0.1258% | 128 | 194 | 2.52× |
| `type-body-medium-emphasized` | 300 | 0.1172% | 128 | 172 | 2.34× |
| `type-label-small` | 287 | 0.1121% | 128 | 159 | 2.24× |
| `type-title-large` | 287 | 0.1121% | 128 | 159 | 2.24× |
| `type-display-medium` | 251 | 0.0980% | 128 | 123 | 1.96× |
| `type-label-medium-emphasized` | 233 | 0.0910% | 128 | 105 | 1.82× |
| `type-label-small-emphasized` | 232 | 0.0906% | 128 | 104 | 1.81× |
| `type-headline-small-emphasized` | 205 | 0.0801% | 128 | 77 | 1.60× |
| `type-body-small` | 178 | 0.0695% | 128 | 50 | 1.39× |
| `type-label-large-emphasized` | 142 | 0.0555% | 128 | 14 | 1.11× |
| `type-title-small-emphasized` | 142 | 0.0555% | 128 | 14 | 1.11× |

### 3.3.3 Font scale 1.3 (25 and 27 failures)

These failures are **not** evidence about C2's width fit: they are dominated by the
Compose-vs-RN font-scale mismatch in §4. They are listed because question (c) asks for
the roles that still fail under C2 at every measured profile.

**420/1.3 — 25 failures, 1.70× to 161.48× over budget.** Worst five:

| Role | AA px | AA % | Budget px | Over px | Ratio |
|---|---:|---:|---:|---:|---:|
| `type-display-large-emphasized` | 35,606 | 8.0739% | 220.5 | 35,385.5 | 161.48× |
| `type-display-large` | 32,024 | 7.2617% | 220.5 | 31,803.5 | 145.23× |
| `type-display-medium-emphasized` | 22,815 | 5.1735% | 220.5 | 22,594.5 | 103.47× |
| `type-display-medium` | 20,577 | 4.6660% | 220.5 | 20,356.5 | 93.32× |
| `type-display-small-emphasized` | 13,793 | 3.1277% | 220.5 | 13,572.5 | 62.55× |

The 25 roles: `bodyLargeEmphasized`, `bodyLarge`, `bodyMediumEmphasized`, `bodyMedium`,
`displayLargeEmphasized`, `displayLarge`, `displayMediumEmphasized`, `displayMedium`,
`displaySmallEmphasized`, `displaySmall`, `headlineLargeEmphasized`, `headlineLarge`,
`headlineMediumEmphasized`, `headlineMedium`, `headlineSmallEmphasized`, `headlineSmall`,
`labelLargeEmphasized`, `labelLarge`, `labelSmall`, `titleLargeEmphasized`, `titleLarge`,
`titleMediumEmphasized`, `titleMedium`, `titleSmallEmphasized`, `titleSmall`.

**320/1.3 — 27 failures, 1.44× to 164.23× over budget.** Worst five:

| Role | AA px | AA % | Budget px | Over px | Ratio |
|---|---:|---:|---:|---:|---:|
| `type-display-large-emphasized` | 21,022 | 8.2117% | 128 | 20,894 | 164.23× |
| `type-display-large` | 18,428 | 7.1984% | 128 | 18,300 | 143.97× |
| `type-display-medium-emphasized` | 12,567 | 4.9090% | 128 | 12,439 | 98.18× |
| `type-display-medium` | 11,043 | 4.3137% | 128 | 10,915 | 86.27× |
| `type-display-small-emphasized` | 7,721 | 3.0160% | 128 | 7,593 | 60.32× |

The 27 roles are the 25 above plus `bodySmall` and `labelMediumEmphasized`.
Full per-role tables: `summary.md` / `summary.json` in this directory.

## 4. The font-scale finding: Compose is non-linear above 1.03

At font scale 1.3 the matrix does **not** test C2 in isolation. Compose UI 1.12.0
applies a non-linear font-scale converter whenever `fontScale ≥ 1.03`
(`FontScaleConverterFactory.isNonLinearFontScalingActive`), on API 31 as well as newer
APIs. RN 0.88.1 `TextAttributeProps.setFontSize` applies `fontScale` linearly
(`PixelUtil.toPixelFromSP`). The two stacks therefore lay out different font sizes before
any letterSpacing compensation:

| Role | Token sp | Compose 1.3 effective sp | RN 1.3 effective sp | Ratio (Compose/Rt) |
|---|---:|---:|---:|---:|
| bodyLarge | 16 | 20.2 | 20.8 | 0.971 |
| titleLarge | 22 | 25.0 | 28.6 | 0.874 |
| headlineSmall | 24 | 26.4 | 31.2 | 0.846 |
| headlineMedium | 28 | 28.8 | 36.4 | 0.791 |
| headlineLarge | 32 | 32.0 | 41.6 | 0.769 |
| displayLarge | 57 | 57.0 | 74.1 | 0.769 |

The Compose values are the `FontScaleConverterFactory` 1.3 table
(`8→10.4, 10→13.0, 12→15.6, 14→18.8, 18→21.6, 20→23.6, 24→26.4, 30→30, 100→100`,
linear interpolation between points). The table predicts the measured Compose 1.3/1.0
width ratios for all 30 roles within 0.7–2.4% (most within 1%). A fresh-launch check at
320 dpi reproduces the same curve: `bodyLarge` width 125→159 px (1.272×), `displayLarge`
414→413 px (1.000×).

This is a **generic** cross-stack mismatch, not a C2 width issue. C2 cannot fix it: the
fixed table changes spacing, not font size, and at 1.3 it improves 10 roles while
regressing 11 (net −1,337 AA px). The generic fix is to emulate Compose's converter in the
library's text path:

1. Read the system font scale (`PixelRatio.getFontScale()`).
2. If it is ≥ 1.03, map `fontSize`, `lineHeight`, and `letterSpacing` through the Compose
   table (sp→dp) before passing them to RN.
3. Set `allowFontScaling={false}` so RN does not apply the linear scale a second time.

This is generic across roles, strings, densities, and scales. It is a Day 10 prerequisite
for claiming 1.3 parity, not a text-threshold exemption. It is also not C4: there is no
per-string or per-density lookup table, only the platform's published font-scale curve.

## 5. Conclusion

C2 does **not** generalize, so it does not become the shipping text renderer.

- At the fitted profile (420/1.0) C2 cuts AA from 17,798 to 2,043 px (−88.5%) and leaves one
  image-gate failure: `bodySmall`, 308 px against a 220.5 px budget (1.40×). This is a real
  improvement, but it is a profile-specific width fit.
- At 320/1.0 the same fixed table **regresses 18 of 30 roles**, raises total AA from 3,174 to
  9,331 px, and raises image-gate failures from 10 to 19. The worst is `displayLarge`, 2,353 px
  against 128 px (18.38×). A compensation table that harms a second density cannot ship.
- At font scale 1.3, C2 is not the right instrument at all. Compose applies its non-linear
  converter for scales ≥1.03 while RN scales linearly, so the two stacks start from different
  font sizes. C2 changes spacing, not size. At 420/1.3 it improves 10 roles and regresses 11
  (25 failures remain); at 320/1.3 it improves 11 and regresses 10 but raises failures from 24
  to 27. The remaining failures are 1.44×–164.23× over budget and are dominated by the
  font-scale mismatch.
- C4-style per-string/per-density tuning is rejected. It is strictly more specific than C2 and
  would need a post-layout reflow to obtain Compose's fractional advance. The generic fix is to
  emulate Compose's published `FontScaleConverter` and pass converted dp values with
  `allowFontScaling={false}`; that is a Day 10 prerequisite and is measured separately.
- The revised ADR-010 thresholds therefore apply only to residuals that the generic converter
  and a width fit cannot remove. No text threshold waives the 1.3 mismatch: until the converter
  ships and is re-measured at ≥2 profiles, font scale ≥1.03 is **not** claimed.

## 6. Answers to the four review questions

**(a) What C2 does, precisely, and why it works.**
C1 first snaps the token size to the nearest integer physical px: when
`ceil(F·d·s) ≠ round(F·d·s)`, it replaces `F` with `(round(F·d·s) − 0.001)/(d·s)` so RN's
`ceil` lands on the nearest integer. C2 then measures the 8-glyph sample's advance width on
both stacks and replaces the absolute letterSpacing `L0` with
`L0 + (W_compose − W_rn_at_C1)/((g − 1)·d·s)`. At 420/1.0 RN's `ceil` error is constant per
glyph, so the horizontal drift is linear in glyph index and a uniform spacing delta cancels
it. C2 does not correct vertical metrics, line-height rounding, or rasterization flags.

**(b) Does C2 hold at two other density/scale combinations, including 1.3?**
No. At 320/1.0 it improves 3/30, regresses 18/30, adds +6,157 AA px, and raises image-gate
failures 10 → 19. At 420/1.3 it improves 10 and regresses 11; all 25 remaining failures are
dominated by the font-scale mismatch. The extra 320/1.3 profile improves 11 and regresses 10
but raises failures 24 → 27. C2 therefore does not become the shipping renderer.

**(c) Which roles still fail the original 0.05% gate under C2, and by how much?**
At 420/1.0: only `bodySmall` (308 px vs 220.5, 1.40×). At 320/1.0: 19 roles, from 1.11× to
18.38×; worst `displayLarge` (2,353 vs 128). At 420/1.3: 25 roles, 1.70×–161.48×; worst
`displayLargeEmphasized` (35,606 vs 220.5). At 320/1.3: 27 roles, 1.44×–164.23×; worst
`displayLargeEmphasized` (21,022 vs 128). Complete tables are in §3.3 and `summary.md`.

**(d) Reject C4-style per-string/per-density tuning unless it can be made generic.**
Accepted and rejected. C4 is a lookup table keyed by sample and profile; it cannot be derived
from RN's pre-layout API, would need a visible post-layout reflow, and the matrix shows that
even the fixed C2 table regresses at a second density. No per-string or per-density table
ships. The only generic layer is Compose's published `FontScaleConverter` plus a width fit
measured at ≥2 profiles; neither is C4.

## 7. Reproduction

```bash
# device: API 31, 1080×1920, 420 dpi, font scale 1.0
adb shell wm density 420
adb shell settings put system font_scale 1.0

SCENES=$(node -e "const fs=require('fs');console.log(fs.readdirSync('tools/scenes').filter(f=>f.endsWith('.json')&&f.startsWith('type-')).map(f=>f.replace(/\.json$/,'')).join(','))")
M3E_SKIP_BOOT=1 M3E_BOOTS=1 M3E_REPEATS=1 M3E_SCENE_REPEATS=1 \
M3E_FONT_SCALE=1.0 M3E_RN_TEXT_COMP=none M3E_RN_FONT_SCALING=1 \
M3E_SCENES="$SCENES" M3E_OUT=/tmp/m3e-profiles/none-420-1.0 \
M3E_LABEL=none-420-1.0 node tools/pixel/run.mjs
# repeat with M3E_RN_TEXT_COMP=c2, then M3E_DENSITY=320 and M3E_FONT_SCALE=1.3
node tools/typography/analyze-profile-matrix.mjs \
  --root /tmp/m3e-profiles --out /tmp/m3e-profiles/summary.json
```

The analyzer writes `summary.json` and `summary.md`. The committed copies are `summary.json`
and `summary.md` in this directory; each run's `results.json` is in `runs/<profile>/`. Raw
captures (Compose, RN, and diff PNGs) stay in the temp run directory.
