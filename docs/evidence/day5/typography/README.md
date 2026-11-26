# Day 5 — typography

**Status:** implementation complete. All 30 roles are generated from the
Compose 1.5.0 type tokens, exposed through the theme, and rendered in 30
Compose/React Native scenes. Token and layout parity is verified for all 30
roles. Faithful cross-stack rasterization retains the inherited RN-vs-Compose
text residual (`D-001`): **9 / 30** faithful scenes are inside the 0.05%
AA-aware gate, while **30 / 30** pass the same gate when both stacks use the
same integer physical rendering grid. No threshold, scene, or baseline was
changed. The literal "all 30 faithful scenes inside the gate" reading is
**not** met; that interpretation is flagged for Nasyx in
`docs/progress/PROGRESS.md`.

**Date:** 2026-11-26
**Profile:** `M3E_API31`, API 31, 1080×1920, 420 dpi (2.625×), SwiftShader,
font scale 1.0, locale `en-US`, animations 0, night mode off.
**Artifact:** `material3:1.5.0`, JAR SHA-256
`d389bb542a1637dc202e715b279a178be1b0d51886234fe2810a92427c07b2a6`.
**Font:** Roboto Flex SHA-256
`9b523f7d82593df0107173849ebb8c817471a1df4b4fb2c3cbf40cfd810c8281`,
identical in both APKs and in the source tree.
**Commit and CI:** `0122873848273f355e5a0480865abdee0b2f3ada`; run
[`45780797908`](https://github.com/nasyx-rakeeb/react-native-material-expressive/actions/runs/45780797908)
— success. The canonical record is `docs/progress/PROGRESS.md`, Day 5.

## What shipped

- `M3Typography` with all 30 roles: 15 baseline and 15 emphasized. Sizes,
  weights, tracking, and line heights come from
  `docs/specs/typography.json`, extracted from
  `commonMain/androidx/compose/material3/tokens/TypeScaleTokens.kt`.
- `defaultTypography` — platform font with explicit 400/500/700 weights,
  matching `Typography()` on Android.
- `createM3Typography(options)` — brand font, static per-weight families,
  forced variable-font mode, and an optional Roboto Flex `wdth` axis
  (25..151, emitted only when non-normal).
- `robotoFlexTypography(options)` — Roboto Flex convenience builder using
  `fontVariationSettings`.
- Capability detection: variable axes require RN ≥ 0.88 and Android API ≥ 26;
  otherwise the builder emits a static family plus `fontWeight`. Unknown RN
  versions and unsupported platforms fall back rather than guessing.
- Theme integration: `M3Theme.typography`, `M3ThemeProvider.typography`
  overrides, `useM3Typography()`, and `useM3TextStyle(role)`.
- Font scaling is delegated to React Native. RN 0.88.1 scales `fontSize`,
  `lineHeight`, and `letterSpacing` together when `allowFontScaling` is true
  (`TextAttributes.effectiveFontSize` / `effectiveLineHeight` /
  `effectiveLetterSpacing`), so the library does not pre-scale sp values and
  does not ship a scaling helper.
- 30 one-line Compose/RN scenes generated from the same spec. The scene index
  now has 37 scenes (the five Day 3 scenes plus the 30 type scenes).

### Natural line-box floor

Compose Material 3 sets `LineHeightStyle(Alignment.Center, Trim.None)` and
`PlatformTextStyle(includeFontPadding = false)` on the type scale. When the
token line height is below the font's natural line box, Compose expands the
line; React Native squashes it. Only `displayLarge` and `displayMedium` (and
their emphasized variants) are affected:

| Role | Size | Token line height | Effective RN line height |
|---|---:|---:|---:|
| `displayLarge` / emphasized | 57 | 64 | 67.03 |
| `displayMedium` / emphasized | 45 | 52 | 52.92 |

The measured Roboto Flex natural ratio at this profile is **1.176** (Compose
displayLarge line box 176 px / (57 sp × 2.625) = 1.1762). The library applies
`max(tokenLineHeight, fontSize × 1.176)` and exposes
`ROBOTO_FLEX_NATURAL_LINE_HEIGHT_RATIO` plus
`M3TypographyOptions.naturalLineHeightRatio`:

- `0` keeps the nominal token line heights.
- A brand-font ratio can be supplied.
- Only the four display roles change at the default 1.176.

Measured effect in the faithful scenes:

| Scene | Before floor: Compose / RN line box | After floor: Compose / RN line box | Before floor: ink bbox y | After floor: ink bbox y |
|---|---|---|---:|---:|
| `displayLarge` | 176 / 168 px | 176 / 176 px | 89 / 85 | 89 / 89 |
| `displayMedium` | 139 / 137 px | 139 / 139 px | 83 / 83 | 83 / 83 |

The floor is a rendering mapping, not a token rewrite. `naturalLineHeightRatio:
0` restores the raw `Typography()` values.

## Type scale

`RN line height` is the render value after the natural-box floor. `Faithful`
and `Matched` are the AA-aware differing pixels for that scene; the budget is
220.5 px (0.05% of 441,000). Full per-run data is in `runs/*/results.json`.

| Role | Size (sp) | Weight | Tracking (sp) | Token LH | RN LH | Faithful AA px | Faithful % | Matched AA px | Matched % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `bodyLarge` | 16 | 400 | 0.5 | 24 | 24.00 | 5 | 0.0011% | 0 | 0.0000% |
| `bodyMedium` | 14 | 400 | 0.2 | 20 | 20.00 | 676 | 0.1533% | 0 | 0.0000% |
| `bodySmall` | 12 | 400 | 0.4 | 16 | 16.00 | 334 | 0.0757% | 0 | 0.0000% |
| `displayLarge` | 57 | 400 | -0.2 | 64 | 67.03 | 2,745 | 0.6224% | 0 | 0.0000% |
| `displayMedium` | 45 | 400 | 0 | 52 | 52.92 | 1,629 | 0.3694% | 0 | 0.0000% |
| `displaySmall` | 36 | 400 | 0 | 44 | 44.00 | 949 | 0.2152% | 63 | 0.0143% |
| `headlineLarge` | 32 | 400 | 0 | 40 | 40.00 | 3 | 0.0007% | 0 | 0.0000% |
| `headlineMedium` | 28 | 400 | 0 | 36 | 36.00 | 993 | 0.2252% | 0 | 0.0000% |
| `headlineSmall` | 24 | 400 | 0 | 32 | 32.00 | 58 | 0.0132% | 53 | 0.0120% |
| `labelLarge` | 14 | 500 | 0.1 | 20 | 20.00 | 397 | 0.0900% | 0 | 0.0000% |
| `labelMedium` | 12 | 500 | 0.5 | 16 | 16.00 | 375 | 0.0850% | 0 | 0.0000% |
| `labelSmall` | 11 | 500 | 0.5 | 16 | 16.00 | 219 | 0.0497% | 0 | 0.0000% |
| `titleLarge` | 22 | 400 | 0 | 28 | 28.00 | 598 | 0.1356% | 0 | 0.0000% |
| `titleMedium` | 16 | 500 | 0.2 | 24 | 24.00 | 2 | 0.0005% | 0 | 0.0000% |
| `titleSmall` | 14 | 500 | 0.1 | 20 | 20.00 | 397 | 0.0900% | 0 | 0.0000% |
| `bodyLargeEmphasized` | 16 | 500 | 0.15 | 24 | 24.00 | 5 | 0.0011% | 0 | 0.0000% |
| `bodyMediumEmphasized` | 14 | 500 | 0.25 | 20 | 20.00 | 326 | 0.0739% | 0 | 0.0000% |
| `bodySmallEmphasized` | 12 | 500 | 0.4 | 16 | 16.00 | 311 | 0.0705% | 0 | 0.0000% |
| `displayLargeEmphasized` | 57 | 500 | 0 | 64 | 67.03 | 1,236 | 0.2803% | 0 | 0.0000% |
| `displayMediumEmphasized` | 45 | 500 | 0 | 52 | 52.92 | 1,696 | 0.3846% | 0 | 0.0000% |
| `displaySmallEmphasized` | 36 | 500 | 0 | 44 | 44.00 | 1,839 | 0.4170% | 105 | 0.0238% |
| `headlineLargeEmphasized` | 32 | 500 | 0 | 40 | 40.00 | 1 | 0.0002% | 0 | 0.0000% |
| `headlineMediumEmphasized` | 28 | 500 | 0 | 36 | 36.00 | 714 | 0.1619% | 0 | 0.0000% |
| `headlineSmallEmphasized` | 24 | 500 | 0 | 32 | 32.00 | 51 | 0.0116% | 48 | 0.0109% |
| `labelLargeEmphasized` | 14 | 700 | 0.1 | 20 | 20.00 | 474 | 0.1075% | 0 | 0.0000% |
| `labelMediumEmphasized` | 12 | 700 | 0.5 | 16 | 16.00 | 663 | 0.1503% | 0 | 0.0000% |
| `labelSmallEmphasized` | 11 | 700 | 0.5 | 16 | 16.00 | 397 | 0.0900% | 0 | 0.0000% |
| `titleLargeEmphasized` | 22 | 500 | 0 | 28 | 28.00 | 222 | 0.0503% | 0 | 0.0000% |
| `titleMediumEmphasized` | 16 | 700 | 0.15 | 24 | 24.00 | 9 | 0.0020% | 0 | 0.0000% |
| `titleSmallEmphasized` | 14 | 700 | 0.1 | 20 | 20.00 | 474 | 0.1075% | 0 | 0.0000% |

## Scene design

Each role gets one scene, `type-<role>`, generated by
`tools/scenes/generate-typography.mjs`:

- 320×200 dp scene on `#FFFBFE`.
- One line, `Material`, at x = 16 dp, y = 24 dp.
- `sizeSp`, `weight`, `letterSpacingSp`, and `lineHeightSp` are copied from
  `docs/specs/typography.json`; nothing is rounded or re-derived per scene.
- One word keeps the glyph count low and makes the layout marker directly test
  the role's size, tracking, and line height.
- The scene has no width constraint and no wrap, so the text layout marker is
  a pure metric probe.
- Both harnesses render with the same Roboto Flex file and the same
  `includeFontPadding = false`; the Compose harness uses
  `LineHeightStyle(Center, None)`, matching the extracted type-scale defaults.

The scene generator supports `--check`; `pnpm scenes:check` fails on drift.

## Two measurements

The same 30 scenes are captured twice. Neither run changes the other.

### Faithful cross-stack

This is the shipping rendering: Compose `TextMotion.Static` with fractional
sp/dp; React Native's default text renderer. It answers "how close is the RN
app to the Compose app as shipped?"

- Run: 1 boot, 2 repeats per scene, 35 scenes (5 Day 3 scenes + 30 type
  scenes), 140 renders.
- Result: **9 / 30** type scenes inside the 0.05% AA-aware gate.
- Aggregate: **75,436** exact differing pixels, **17,798** AA-aware pixels
  across the 30 scenes.
- Worst: `displayLarge` at **2,745 AA px / 0.6224%**. Best:
  `headlineLargeEmphasized` at **1 AA px / 0.0002%**.
- Every type scene has non-zero exact differences; none is byte-identical.

The generated `runs/faithful/README.md` / `report.html` use the pixel
pipeline's Day 3 summary wording, which quotes the `trivial` scene in its
headline sentence. For this run, the per-scene table and this document are the
authoritative typography numbers; the generated report is the raw
captures/diff bundle.

### Matched rendering grid

This is a diagnostic, not a shipping mode. It isolates the type tokens from
the RN text engine by normalizing the rendering grid:

- Compose `TextMotion.Animated` (linear text with subpixel positioning on,
  matching RN's flags; see U-25.2), integer physical
  font sizes (`textSizeMode=ceil`), and floored pixel offsets
  (`textPosMode=floor`). React Native is unchanged.
- Run: 1 boot, 1 repeat per scene, 35 scenes, 70 renders.
- Result: **30 / 30** type scenes inside the 0.05% AA-aware gate.
- **26 / 30** are byte-identical (`0` exact and `0` AA).
- The four non-identical scenes are `displaySmall`, `displaySmallEmphasized`,
  `headlineSmall`, and `headlineSmallEmphasized`. Each has a **1 px vertical
  ink offset** (Compose baseline one pixel higher) and no width difference in
  the ink bbox. Max AA is **105 px / 0.0238%**.
- Aggregate: **7,878** exact pixels (all four scenes), **269** AA-aware
  pixels.

The matched run demonstrates that size, weight, width, tracking, and line
height are correct for all 30 roles. The faithful residual is the same
RN-vs-Compose quantization documented on Day 4: RN rounds font sizes to an
integer physical pixel and hardcodes subpixel/linear text, while Compose uses
fractional sp/dp with static hinting. It is not a token, weight, tracking, or
line-height bug.

### The five Day 3 gate scenes

The established gate scene set is unchanged. In the faithful run:

| Scene | Exact px | AA-aware px | AA-aware % | Max Δ |
|---|---:|---:|---:|---:|
| `solid` | 0 | 0 | 0.0000% | 0 |
| `rect` | 0 | 0 | 0.0000% | 0 |
| `text` | 1,745 | 4 | 0.0009% | 162 |
| `shadow` | 0 | 0 | 0.0000% | 0 |
| `trivial` | 1,745 | 4 | 0.0009% | 162 |

The standard 3-cold-boot gate run is in `docs/evidence/day5/gate/`:

- 3 cold boots, 20 repeats of the trivial scene per app per boot, 2 repeats
  of each other scene: **168 renders**.
- Same-harness determinism and cross-boot repeatability: **0 px** for every
  app/scene combination.
- `solid`, `rect`, `shadow`: **0 exact / 0 AA** px.
- `text`, `trivial`: **1,745 exact / 4 AA** px (**0.0009%**), max channel
  Δ 162. Text layout is **402.0×73.0 px** in both stacks.
- The AA-aware gate is **met** (`crossStackAaAwareBelowPlaybookGate: true`).
  The stricter exact-zero flag is **false**, which is the recorded `D-001`
  residual, not a new regression.

## Layout parity

The text layout markers (not the ink bbox) were compared for all 30 roles:

- Line-box height: **0.00 px difference in every role**, in both the faithful
  and matched runs.
- Layout width: up to **4.57 px** difference in the faithful run and
  **1.97 px** in the matched run. These are text-measurement rounding
  differences, not ink differences; 26 matched scenes have byte-identical
  rasterized text despite the fractional measurement delta.
- Ink bbox: identical width in every matched scene except the four 1 px
  baseline offsets above.

## Font axes, fallback, and scaling

### Variable-font matrix

| Environment | Output |
|---|---|
| RN ≥ 0.88, Android API ≥ 26 | `fontFamily` + `fontVariationSettings: 'wght' N` (and `'wdth' V` when requested); no synthetic `fontWeight` |
| RN ≥ 0.88, Android API < 26 | static family + explicit `fontWeight` |
| RN ≥ 0.88, iOS / web | variable-font output (web is best-effort) |
| RN < 0.88 | static family + explicit `fontWeight`; reason `rn-too-old` |
| RN version unknown | static family; reason `rn-version-unknown` |
| Unsupported platform | static family; reason `platform-unsupported` |

`staticFamilies` maps 400/500/700 to separate family names. When it is not
provided, the base `fontFamily` is used with an explicit weight. The resolver
is pure and tested without a device.

### Width axis

`widthAxis` accepts 25..151 and is only emitted when variable-font output is
active and the value is not 100. The runtime probes confirm the axis is live
in both stacks:

- Compose: `wdth25=356`, `wdth100=402`.
- React Native: `narrow=376.00`, `wide=411.43`.

The absolute numbers are not cross-stack comparable because the probes use
different strings; the within-stack change is the evidence that the axis is
applied.

### Font scaling

RN 0.88.1 multiplies `fontSize`, `lineHeight`, and `letterSpacing` by the
system font scale when `allowFontScaling` is true. The type-scale styles store
sp values and do not pre-scale. Pixel scenes set `allowFontScaling={false}` so
the profile stays at 1.0; application `Text` defaults to scaling on. No
scaling helper is shipped because a second scale would double-apply.

## Reproduction

```bash
# Scene generation and drift check
pnpm scenes:check

# Library gates
pnpm typecheck
pnpm lint
pnpm test

# Build the two harnesses (debug Compose, release gallery)
pnpm pixel:build

# Faithful typography evidence (API 31 emulator already booted)
TYPES=$(ls tools/scenes/type-*.json | sed 's#.*/##;s#\.json##' | paste -sd, -)
M3E_SKIP_BOOT=1 M3E_BOOTS=1 M3E_REPEATS=1 M3E_SCENE_REPEATS=2 \
  M3E_LABEL="Day 5 — typography, faithful cross-stack" \
  M3E_SCENES="solid,rect,text,shadow,trivial,$TYPES" \
  M3E_OUT=docs/evidence/day5/typography/runs/faithful \
  node tools/pixel/run.mjs

# Matched rendering grid
M3E_SKIP_BOOT=1 M3E_BOOTS=1 M3E_REPEATS=1 M3E_SCENE_REPEATS=1 \
  M3E_TEXT_MOTION=animated M3E_TEXT_SIZE_MODE=ceil M3E_TEXT_POS_MODE=floor \
  M3E_LABEL="Day 5 — typography, matched rendering grid" \
  M3E_SCENES="solid,rect,text,shadow,trivial,$TYPES" \
  M3E_OUT=docs/evidence/day5/typography/runs/matched-grid \
  node tools/pixel/run.mjs

# Standard five-scene gate (3 cold boots)
M3E_LABEL="Day 5 — standard five-scene gate" M3E_OUT=docs/evidence/day5/gate \
  node tools/pixel/run.mjs
```

The faithful run used `M3E_SKIP_BOOT=1` because the API 31 emulator was
already booted from the harness build. The matched run used the same boot.
The standard gate run uses the full cold-boot procedure and verifies the
profile on every boot.

## Limitations and flags

- **D-001 (inherited):** faithful cross-stack text is not byte-identical. The
  21 type scenes above the 0.05% AA-aware budget are the same RN integer
  physical-pixel / subpixel-text quantization recorded on Day 3 and closed as
  a root cause on Day 4. No threshold, scene, or baseline was changed.
- **Gate interpretation flag:** the Day 5 exit says "text scenes for all
  styles diff-pass (size, weight, width, tracking, line height)". The matched
  grid meets that reading 30/30. The faithful reading meets it 9/30. Nasyx
  needs to confirm which reading is the release gate for typography. This
  document does not decide that.
- The four matched-grid scenes retain a 1 px baseline offset at half-pixel
  font sizes. This is a rasterization-grid residual, not a token error.
- Pixel evidence is Android API 31 only. iOS uses the same sp values and the
  same RN scaling path, but is not pixel-gated on Day 5.
- `naturalLineHeightRatio` defaults to the Roboto/Roboto Flex ratio measured
  at 2.625×. A brand font with a different natural line box should pass its
  own ratio; `0` restores the raw tokens.
- Emphasized roles are extracted from the same Compose 1.5.0 artifact as the
  baseline roles. They are token-verified, not a separate visual comparison
  against the Material web catalog.
- Web is best-effort: the variable-font resolver accepts `web`, but no web
  pixel evidence is claimed.

## Artifacts

- `docs/specs/typography.json` — 30 roles, source lines, and the extracted
  `LineHeightStyle` / `includeFontPadding` defaults.
- `runs/faithful/` — `results.json`, `report.html`, generated `README.md`,
  `run.log`, `FROZEN_PROFILE.md`, content-addressed `captures/` and `diffs/`.
- `runs/matched-grid/` — the same bundle for the normalized-grid diagnostic.
- `docs/evidence/day5/gate/` — the standard five-scene, three-cold-boot gate
  report and captures.
- `tools/scenes/generate-typography.mjs` — deterministic scene generator.
- `packages/react-native-material-expressive/src/typography/` — types,
  capability resolver, builders, hook, and tests.
- `apps/gallery/src/harness/SceneHarness.tsx` — RN text scene renderer,
  including the natural line-box floor and layout marker.
- `apps/reference-compose/.../MainActivity.kt` — Compose text scene renderer,
  including `lineHeight`, width, multiline, and the extracted line-height
  style.
