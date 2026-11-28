# Day 10 — Compose font-scale converter matrix

**Date:** 2026-11-28
**Scope:** `Text` / Typography foundation under ADR-010. 30 `type-*` scenes ×
4 density/font-scale profiles, Compose 1.5.0 vs React Native 0.88.1.
**Change under test:** the library `Text` now maps `fontSize`, `lineHeight` and
`letterSpacing` through the Compose UI 1.12.0 non-linear `FontScaleConverter`
and sets `allowFontScaling={false}`. Before this change RN scaled linearly, so
the 1.3 profiles carried a generic 1.3× vs ~1.24× size mismatch.

## Headline

- **119/120** role-profile combinations pass the ADR-010 *faithful* text budget
  (`AA ≤ 450 per 1,000 ink` **and** `AA ≤ 3.0 per glyph per font px`).
- The converter removes the 1.3 blow-up: 420/1.3 **214,694 → 22,658** AA px
  (**−89.4%**), 320/1.3 **118,751 → 9,480** (**−92.0%**).
- 420/1.0 is unchanged at **17,798** AA px, so the converter is a no-op at
  scale 1.0 and does not regress the token-exact profile.
- The single miss is `type-label-medium-emphasized` at 320/1.3: **453.7 per
  1,000 ink** vs the 450 cap (0.8% over), while its per-glyph value **2.845**
  passes the 3.0 cap. ADR-010 was approved on 2026-11-28; the miss is recorded
  in `D-001`, and `Typography` and `Text` are `[x] T` / Android-DONE in
  `COMPONENT_MATRIX.md`.

## Method

- Scene: `tools/scenes/type-<role>.json`, 320×200 dp, single-line 8-glyph
  sample `"Material"` (7 advances + 1 glyph), foreground/background from the
  light scheme. 30 roles: 15 baseline + 15 emphasized.
- Stacks: Compose Material3 1.5.0 reference app and the RN gallery, both
  installed on `emulator-5554` (Pixel 2 AVD, API 31, 1080×1920). The scene is
  captured once per stack per profile; the per-stack determinism line in the
  log is therefore trivial at one run.
- Profiles: 420 dpi / scale 1.0, 420 dpi / 1.3, 320 dpi / 1.0, 320 dpi / 1.3.
  Density is set with `wm density`; scale with `settings put system font_scale`.
  At 420 dpi a 320×200 dp scene is 840×525 px; at 320 dpi it is 640×400 px.
- AA pixels are pixelmatch AA-aware differences (`threshold: 0.1`,
  `includeAA: false`). Ink is the Compose non-background pixel count. The
  per-glyph-per-font-px denominator is `AA ÷ 8 ÷ fontPx`, where `fontPx` is the
  effective Compose size after the converter.
- Threshold-independent metrics come from the same captures: max channel Δ,
  mean Δ over differing pixels, Δ > 2 outside AA edges, and flat fills > 2.

## Summary

| Profile | Total AA px | 0.05% pass | Faithful pass | Matched pass | Compensated pass | Worst AA / 1,000 ink | Worst AA / glyph / font px |
|---|---:|---:|---:|---:|---:|---:|---:|
| 420 dpi / 1.0 | 17,798 | 9/30 | **30/30** | 8/30 | 18/30 | 410.0 | 2.63 |
| 420 dpi / 1.3 | 22,658 | 3/30 | **30/30** | 2/30 | 18/30 | 309.6 | 2.72 |
| 320 dpi / 1.0 | 3,174 | 20/30 | **30/30** | 13/30 | 29/30 | 398.6 | 1.63 |
| 320 dpi / 1.3 | 9,480 | 8/30 | **29/30** | 8/30 | 25/30 | 453.7 | 2.84 |

The original image-area 0.05% gate is **not** the text gate; it is reported for
continuity with Day 5. It fails for 21/30 at 420/1.0 because the whole-image
budget (220.5 px) is smaller than the AA difference of one 14sp label. ADR-010
exists to replace that denominator for text.

## Per role

Cells are `AA px (AA per 1,000 ink; AA per glyph per font px)`. The last column
is the faithful verdict across all four profiles.

| Role | sp | 420/1.0 | 420/1.3 | 320/1.0 | 320/1.3 | Faithful |
|---|---:|---|---|---|---|---|
| `type-body-large` | 16 | 5 (2; 0.01) | 645 (217; 1.52) | 15 (12; 0.06) | 301 (168; 0.93) | yes |
| `type-body-large-emphasized` | 16 | 5 (2; 0.01) | 937 (272; 2.21) | 36 (26; 0.14) | 343 (161; 1.06) | yes |
| `type-body-medium` | 14 | 676 (406; 2.30) | 620 (233; 1.57) | 223 (228; 1.00) | 367 (212; 1.22) | yes |
| `type-body-medium-emphasized` | 14 | 326 (179; 1.11) | 533 (183; 1.35) | 165 (150; 0.74) | 291 (156; 0.97) | yes |
| `type-body-small` | 12 | 334 (264; 1.33) | 380 (197; 1.16) | 133 (168; 0.69) | 295 (244; 1.18) | yes |
| `type-body-small-emphasized` | 12 | 311 (229; 1.23) | 438 (197; 1.34) | 115 (130; 0.60) | 298 (225; 1.19) | yes |
| `type-display-large` | 57 | 2745 (128; 2.29) | 2868 (134; 2.40) | 351 (27; 0.38) | 383 (30; 0.42) | yes |
| `type-display-large-emphasized` | 57 | 1236 (50; 1.03) | 1236 (50; 1.03) | 94 (6; 0.10) | 94 (6; 0.10) | yes |
| `type-display-medium` | 45 | 1629 (120; 1.72) | 1629 (120; 1.72) | 392 (48; 0.54) | 392 (48; 0.54) | yes |
| `type-display-medium-emphasized` | 45 | 1696 (109; 1.79) | 1696 (109; 1.79) | 76 (8; 0.11) | 76 (8; 0.11) | yes |
| `type-display-small` | 36 | 949 (106; 1.26) | 949 (106; 1.26) | 77 (14; 0.13) | 77 (14; 0.13) | yes |
| `type-display-small-emphasized` | 36 | 1839 (179; 2.43) | 1839 (179; 2.43) | 57 (9; 0.10) | 57 (9; 0.10) | yes |
| `type-headline-large` | 32 | 3 (0; 0.00) | 3 (0; 0.00) | 56 (13; 0.11) | 56 (13; 0.11) | yes |
| `type-headline-large-emphasized` | 32 | 1 (0; 0.00) | 1 (0; 0.00) | 56 (12; 0.11) | 56 (12; 0.11) | yes |
| `type-headline-medium` | 28 | 993 (176; 1.69) | 165 (28; 0.27) | 0 (0; 0.00) | 688 (194; 1.49) | yes |
| `type-headline-medium-emphasized` | 28 | 714 (112; 1.21) | 381 (57; 0.63) | 0 (0; 0.00) | 320 (79; 0.69) | yes |
| `type-headline-small` | 24 | 58 (14; 0.12) | 868 (177; 1.57) | 42 (16; 0.11) | 508 (171; 1.20) | yes |
| `type-headline-small-emphasized` | 24 | 51 (11; 0.10) | 1507 (269; 2.72) | 205 (72; 0.53) | 717 (208; 1.70) | yes |
| `type-label-large` | 14 | 397 (218; 1.35) | 448 (154; 1.13) | 179 (163; 0.80) | 293 (157; 0.97) | yes |
| `type-label-large-emphasized` | 14 | 474 (217; 1.61) | 262 (72; 0.66) | 81 (63; 0.36) | 419 (184; 1.39) | yes |
| `type-label-medium` | 12 | 375 (276; 1.49) | 391 (176; 1.19) | 53 (60; 0.28) | 365 (276; 1.46) | yes |
| `type-label-medium-emphasized` | 12 | 663 (410; 2.63) | 675 (255; 2.06) | 10 (9; 0.05) | 710 (454; 2.84) | **no** |
| `type-label-small` | 11 | 219 (186; 0.95) | 375 (201; 1.25) | 287 (399; 1.63) | 210 (178; 0.92) | yes |
| `type-label-small-emphasized` | 11 | 397 (276; 1.72) | 522 (230; 1.74) | 143 (165; 0.81) | 397 (276; 1.74) | yes |
| `type-title-large` | 22 | 598 (169; 1.29) | 421 (92; 0.80) | 5 (2; 0.01) | 0 (0; 0.00) | yes |
| `type-title-large-emphasized` | 22 | 222 (55; 0.48) | 677 (133; 1.29) | 33 (14; 0.09) | 0 (0; 0.00) | yes |
| `type-title-medium` | 16 | 2 (1; 0.01) | 1066 (310; 2.51) | 25 (18; 0.10) | 407 (191; 1.26) | yes |
| `type-title-medium-emphasized` | 16 | 9 (3; 0.03) | 416 (99; 0.98) | 5 (3; 0.02) | 648 (260; 2.00) | yes |
| `type-title-small` | 14 | 397 (218; 1.35) | 448 (154; 1.13) | 179 (163; 0.80) | 293 (157; 0.97) | yes |
| `type-title-small-emphasized` | 14 | 474 (217; 1.61) | 262 (72; 0.66) | 81 (63; 0.36) | 419 (184; 1.39) | yes |

## The one miss

`type-label-medium-emphasized` at 320 dpi / 1.3:

| Metric | Value | Cap | Verdict |
|---|---:|---:|---|
| AA pixels | 710 | — | — |
| Ink pixels | 1,565 | — | — |
| AA / 1,000 ink | **453.7** | 450 | **0.8% over** |
| AA / glyph / font px | **2.845** | 3.0 | pass |
| AA / glyph | 88.75 | — | — |
| Max channel Δ | 226 | — | glyph edge |
| Δ > 2 outside AA | 175 | — | glyph interiors |
| Flat fills > 2 | 174 | — | glyph interiors |

The two caps disagree because this is a short 8-glyph string at 12sp × 1.3.
The ink denominator is harsh for short strings; the per-glyph-per-font-px
denominator is the scale-invariant one and passes. **Recommendation:** keep the
450 cap and record this combination in `D-001`. The alternative — accept 500
per 1,000 — is a threshold decision for Nasyx, not a code change. Do not tune
the scene or the sample to make it pass.

## Threshold-independent metrics

| Profile | Max Δ | Role | Mean Δ over differing | Role | Δ>2 outside AA | Flat fills >2 |
|---|---|---:|---|---:|---|---:|---:|
| 420/1.0 | 226 | `type-body-large-emphasized` | 142.93 | `type-label-medium-emphasized` | 2,032 | 1,881 |
| 420/1.3 | 226 | `type-body-large-emphasized` | 142.81 | `type-headline-small-emphasized` | 2,688 | 2,531 |
| 320/1.0 | 226 | `type-body-large-emphasized` | 107.79 | `type-display-medium` | 0 | 0 |
| 320/1.3 | 226 | `type-body-large-emphasized` | 140.58 | `type-label-medium-emphasized` | 610 | 496 |

Max Δ 226 is a glyph edge pixel, not a flat fill. The non-zero Δ > 2 and
flat-fill counts are glyph interiors where the stroke rasterizes at a different
subpixel offset (RN's integer advance and linear/subpixel text). This is the
known D-001 advance difference: both stacks use the same token colours, and the
differing pixels sit inside glyph strokes, not in a flat background or shape
fill. At 320/1.0 both counts are zero, which is the cleanest profile.

## Implementation

- `packages/react-native-material-expressive/src/typography/fontScale.ts` ports
  the Compose UI 1.12.0 `FontScaleConverter` tables (0.85–2.0) and interpolates
  between entries. Unit tests compare every table entry.
- `Text` applies `composeFontScale` to `fontSize` and `letterSpacing`, and
  `composeLineHeight` to the line height:
  - ratio `< 1.03`: linear (Compose does not apply the converter below 1.03);
  - ratio `1.03–1.05`: the global converter;
  - ratio `> 1.05`: preserve the `lineHeight / fontSize` multiplier.
  `allowFontScaling` is true only in `linear` mode; `compose` mode scales
  explicitly.
- Spot check at 1.3: `type-body-large` height is 80 px on both stacks (width
  209.76 vs 208).
- Modes: `fontScaleMode="compose"` (default), `"linear"` (RN behavior), `"none"`.

## Reproduce

```bash
export ANDROID_SERIAL=emulator-5554
TYPES=$(ls tools/scenes/type-*.json | sed 's#.*/##;s#\.json##' | paste -sd, -)

for profile in 420-1.0 420-1.3 320-1.0 320-1.3; do
  density=${profile%-*}
  scale=${profile#*-}
  adb -s "$ANDROID_SERIAL" shell wm density "$density"
  adb -s "$ANDROID_SERIAL" shell settings put system font_scale "$scale"
  sleep 2
  M3E_SKIP_BOOT=1 M3E_BOOTS=1 M3E_REPEATS=1 M3E_SCENE_REPEATS=1 \
    M3E_SCENES="$TYPES" M3E_OUT="/tmp/m3e-converter/$profile" \
    M3E_LABEL="converter-$profile" node tools/pixel/run.mjs
done

adb -s "$ANDROID_SERIAL" shell wm density reset
adb -s "$ANDROID_SERIAL" shell settings put system font_scale 1.0

node tools/typography/analyze-profile-matrix.mjs \
  --root docs/evidence/day10/typography/runs \
  --out docs/evidence/day10/typography/summary.json \
  --markdown docs/evidence/day10/typography/summary.md
```

The stored run directories are `runs/<profile>/` with `captures/`, `diffs/`,
`results.json` and `report.html`. The analyzer output is `summary.json` +
`summary.md`; this README is the human summary.

## Limitations

- One capture per stack per profile; determinism across cold boots was measured
  for the icon scene, not repeated for all 120 combinations.
- The 8-glyph `"Material"` sample is the Day 5 sample, kept so the numbers are
  comparable. It is not a full paragraph: line wrapping, bidi and fallback
  fonts are outside this matrix.
- The emulator is API 31 with the Roboto Flex variable font bundled by the
  gallery. A physical device with a different font/scale may rasterize
  differently; the Xiaomi run covers the icon and overlay surfaces, not this
  matrix.
- Thresholds are **approved** (ADR-010, 2026-11-28); the matrix reports pass
  counts against them, it does not change the PLAYBOOK five-scene gate. Re-run
  the matrix whenever text code or fonts change.
