# Unverified / unresolved claims

A component cannot be marked DONE while it has an open entry here. Day 0 resolved the six original `UNVERIFIED-1..6`; new open items are listed below with an owner and a resolution day.

**Last updated:** 2026-11-26 (Day 5)

---

## Resolved on Day 0

### U-1 (was UNVERIFIED-1) — Exact Compose Expressive theming API names — **RESOLVED**

Verified from the `material3-1.5.0-sources.jar`:

- `MaterialExpressiveTheme(colorScheme, motionScheme, shapes, typography, content)` — `commonMain/.../MaterialTheme.kt:238`.
- `expressiveLightColorScheme()` — `ColorScheme.kt:1172`. **There is no `expressiveDarkColorScheme()` in 1.5.0.**
- `MotionScheme.standard()` / `MotionScheme.expressive()` — `MotionScheme.kt:123`, `:132`.
- `MaterialShapes` with **35** `RoundedPolygon` values — `MaterialShapes.kt`.
- `MotionScheme` spring tokens: exact values in §U-3 below.
- `Shapes()` includes `largeIncreased` (20dp), `extraLargeIncreased` (32dp), `extraExtraLarge` (48dp).
- `material3-ripple:1.5.0` exists and is a separate artifact.

Source sha256 and file paths: `docs/research/DAY0_SOURCES.md`.

### U-2 (was UNVERIFIED-2) — Any new RN M3E library — **RESOLVED (yes, several)**

- `@expressive-ui/native@0.3.0`, published **2026-11-24**, MIT. Broad M3E surface; React Native/Expo; peer `react-native-svg`; 6,516 LOC `src`; uses RN `Animated` (no Reanimated); no `MaterialShapes`/`RoundedPolygon`; no repository field; 0.x.
- `react-native-platform-components@1.12.0` (native widgets, 2026-11-24).
- `kamp0010/react-native-m3` (GitHub, last push 2026-02-06; 2 stars).
- `@isoline-ui/react-native@2.1.3` (adjacent expressive UI, not M3-specific).
- No RN library found with a published Compose-reference diff suite or a full MaterialShapes/Morph port.

Details and threat assessment: `docs/COMPETITOR_MATRIX.md`.

### U-3 (was UNVERIFIED-3) — Reanimated / Worklets matrix for RN 0.88 — **RESOLVED (pin pending Day 1/7)**

- Expo SDK **58** bundles: `react-native@0.88.0-rc.3`, `react-native-reanimated@4.7.0`, `react-native-worklets@0.13.0`, `react-native-svg@15.15.5`, `react-native-gesture-handler@~3.2.1`, `react-native-safe-area-context@~5.9.1`. Source: `expo@58.0.0/bundledNativeModules.json`.
- Latest standalone: `react-native-reanimated@4.8.0` (2026-11-19) peer range `react-native: 0.87 - 0.89`, `react-native-worklets: 0.14.x`; `react-native-worklets@0.14.0`.
- Latest RN: `0.88.1` (2026-10-27).
- Latest `react-native-skia`: **`react-native-skia@3.13.0`** (2026-11-25, unscoped), peer `react-native-reanimated >=4.0.0`, `react-native-worklets >=0.7.0`.
- **Day 1 re-pin:** Expo SDK **58.0.26** bundles RN **0.88.1**, Reanimated **4.7.1**, Worklets **0.13.0**, safe-area-context **5.11.1**, gesture-handler **3.3.0**, svg **15.16.0**, React **19.3.0**. These supersede the `58.0.0` snapshot above.
- Decision: use the Expo SDK 58 pair in the gallery app; use Reanimated 4.8/Worklets 0.14 only in a bare RN compatibility job. Draft peers in ADR-003; final pin Day 7.

### U-4 (was UNVERIFIED-4) — Paper component coverage in latest alpha — **RESOLVED**

Paper `6.0.0-alpha.4` (2026-11-23); 34 public component exports; signature-set score **2.5/14 = 17.9%**. Full table: `docs/COMPETITOR_MATRIX.md`. Key roadmap facts from issue #5150: new components (Toolbar, ConnectedButtonGroup, Slider) are **6.1**, not 6.0; `NavigationBar` PR #5006 is still unmerged; progress indicators stay flat in 6.0.

### U-5 (was UNVERIFIED-5) — Material Symbols distribution, license, and Roboto Flex license — **RESOLVED (subset plan open, see U-14)**

- Material Symbols variable font: `google/material-design-icons/variablefont/MaterialSymbolsOutlined[FILL,GRAD,opsz,wght].ttf` — **10,744,832 bytes**; codepoints file 79,421 bytes; Apache License 2.0 (`LICENSE`).
- Roboto Flex: `google/fonts/ofl/robotoflex/RobotoFlex[...].ttf` — **1,787,292 bytes**; SIL Open Font License 1.1 (`OFL.txt`).
- Expo/RN 0.88 supports `fontVariationSettings` as object or CSS string (RN docs checked 2026-11-25).
- Subsetting/glyph-set strategy is **not** decided; U-14.

### U-6 (was UNVERIFIED-6) — m3.material.io vs Compose 1.5.0 component set — **RESOLVED with deltas**

- m3 catalog snapshot: **37 component families** + XR/index pages. `scroll-fields` was added/updated 2026-11-17 and is in Compose 1.5.0 (`ScrollField.kt`).
- Compose 1.5.0 public surface: **194 public functions** (inventory in `docs/research/DAY0_SOURCES.md`).
- Deltas to §8 are enumerated in `docs/COMPONENT_MATRIX.md` §“Scope deltas vs §8”.
- m3 says segmented buttons are **no longer recommended** in the Expressive update (use connected button group); Compose still ships them. ADR-007.
- m3 toolbars: **docked + floating**. Compose has no `DockedToolbar` composable; the docked behavior is implemented by `FlexibleBottomAppBar` using `DockedToolbarTokens`. Mapping decision is in the matrix.
- m3 side sheets: spec exists, **no public Compose 1.5.0 implementation**. Spec-verified path (ADR-005).

---

## Open items (block DONE)

### U-7 — Expressive dark color scheme is absent in Compose 1.5.0 — **RESOLVED (ADR-006)**

- **Claim:** The plan says “expressive color schemes” (plural). Compose 1.5.0 ships only `expressiveLightColorScheme()`; its KDoc says to use `darkColorScheme()` for dark mode.
- **Resolution:** ADR-006 accepted. Defaults mirror Compose (expressive light, standard dark). A generated `expressiveDarkColorScheme(seed)` ships at full quality via `material-color-utilities`, documented as non-reference. Dark roles with Compose counterparts are checked against `darkColorScheme()` and recorded in `docs/specs/color-dark.json`.
- **Blocks:** Nothing; color system still due Day 4.

### U-8 — Expressive/emphasized typography is not wired into the default theme — **RESOLVED (ADR-006)**

- **Claim:** The plan says “custom brand font across the entire type scale” and “baseline + emphasized scales”.
- **Evidence:** `TypographyTokens.kt`/`TypeScaleTokens.kt` contain 15 emphasized styles, but `MaterialExpressiveTheme` passes `Typography()` and contains `// TODO: replace with calls to Expressive typography default` (`MaterialTheme.kt` ~line 264).
- **Resolution:** ADR-006 accepted. Emphasized styles ship as opt-in tokens; the default theme stays on standard `Typography()` so Compose renders match. Day 5 implemented all 30 roles, theme wiring, and scenes; evidence: `docs/evidence/day5/typography/`.
- **Blocks:** Nothing; Day 5 implementation complete. The faithful-vs-matched gate reading is `U-25`.

### U-9 — m3 chips page does not mark an Expressive update, but Compose Chip supports shape morph

- **Evidence:** m3 chips overview has an “Updates” section, not “M3 Expressive update”; `Chip.kt` exposes `ChipShapes` and `FilterChip(shapes=...)` with KDoc describing corner morphing; `ChipShapes`/`FilterChipDefaults.shapes` exist in 1.5.0.
- **Impact:** Whether chip morph is release-gated as an Expressive feature.
- **Resolution:** Treat Compose as truth (Core Rule 1); document the m3 page lag. Verify the exact `ChipShapes` defaults on Day 17.
- **Blocks:** Chips DONE (Day 17).

### U-10 — `SideSheet` has no Compose 1.5.0 reference — **RESOLVED (ADR-005)**

- **Evidence:** No `SideSheet` symbol in the 1.5.0 sources; m3 side-sheets spec exists.
- **Impact:** Cannot produce a Compose diff for this row.
- **Resolution:** ADR-005 accepted. Implement as **spec-verified** against measured m3 assertions + own regression baseline; never call it Compose-verified.
- **Blocks:** Nothing; SideSheet still due Day 29.

### U-11 — Paper-only parity components have no Compose reference — **RESOLVED (ADR-005)**

- **Components:** Banner, Avatar, DataTable, HelperText (as a distinct component), Accordion/expandable list.
- **Impact:** Release Gate #1 cannot apply as written.
- **Resolution:** ADR-005 accepted: **spec-verified** against measured m3/Paper assertions + self-regression baseline. Not Compose-verified.
- **Blocks:** Nothing; Day 38 parity extras remain in scope.

### U-12 — CMP iOS runtime coverage for 10 source-differing files

- **Evidence:** 245 shared files, 235 byte-identical; 10 differ: `BasicTooltip`, `Checkbox`, `MaterialTheme`, `NavigationItem`, `RadioButton`, `ScrollField`, `SearchBar`, `ShortNavigationBar`, `TimePicker`, `WideNavigationRail`.
- **Impact:** Which iOS components can be structurally diffed vs only inspected.
- **Resolution:** Day 3 spike: build the CMP iOS app on the fixed simulator, render the scene matrix, compare; record per-component `REF` vs `inspect`.
- **Blocks:** ADR-004 final acceptance.

### U-13 — 1.6.0-alpha01 already exists; baseline drift risk

- **Evidence:** `material3:1.6.0-alpha01` published 2026-11-18; `material3-ripple:1.6.0-alpha01`; adaptive 1.4.0-alpha03.
- **Impact:** Google may ship fixes/expressive changes before our 1.0.
- **Resolution:** Pin 1.5.0 (ADR-000). Re-run the extractor against 1.6.0-alpha01 as a reviewable diff; do not adopt without an ADR.
- **Blocks:** None now; affects Day 2 extractor design (must record source version in every JSON record).

### U-14 — Material Symbols subsetting and glyph coverage

- **Evidence:** Full outlined variable TTF is 10.7 MB; full codepoints 79 KB. Apache-2.0.
- **Impact:** Bundle size budget and offline icon coverage.
- **Resolution:** Day 5/10 spike: subset to the internal component glyph set + document how apps add their own icons; use `fonttools`/`pyftsubset`; verify license/NOTICE. Keep the full font out of the default bundle.
- **Blocks:** Icon DONE (Day 10).

### U-15 — Docked toolbar naming and API mapping

- **Evidence:** m3 has “docked toolbar”; Compose 1.5.0 has no `DockedToolbar` composable; `FlexibleBottomAppBar` uses `DockedToolbarTokens` (`AppBar.kt:2344`, `:2352`).
- **Impact:** Public RN API naming and docs.
- **Resolution:** Day 36: implement docked behavior via `BottomAppBar`/`FlexibleBottomAppBar` tokens; document the mapping; verify against m3 toolbars specs. Do not invent a component that contradicts Compose.
- **Blocks:** Toolbars DONE (Day 36).

### U-16 — Paper native shape-morph implementation is unverified

- **Evidence:** Paper Button/IconButton use CSS `transitionDuration`/`transitionTimingFunction` style props; FAB/Switch use Reanimated springs.
- **Impact:** Competitor claims; not our spec.
- **Resolution:** Day 53 competitor re-check: test Paper alpha.4 on the reference Android emulator; record whether the morph actually runs natively.
- **Blocks:** None (competitor matrix accuracy only).

### U-17 — iOS pixel-diff reliability vs CMP

- **Evidence:** CMP iOS renders through Skia/UIKit text; Android Compose uses the Android text stack. Shadows/safe areas differ.
- **Impact:** iOS diff thresholds and claims.
- **Resolution:** Day 3/41: quantify on the fixed simulator; use structural thresholds and human review; never claim iOS pixel parity.
- **Blocks:** iOS baseline sign-off (Day 41).

### U-18 — `@expressive-ui/native` quality claims

- **Evidence:** 0.3.0, no repository field, no tests in package, RN `Animated`, no MaterialShapes/RoundedPolygon.
- **Impact:** Competitive threat assessment.
- **Resolution:** Day 53: install and test a sample; check a11y, motion, and fidelity. Do not cite it as production-ready until then.
- **Blocks:** None.

### U-19 — `fontVariationSettings` support below RN 0.88 / Android API 26 — **RESOLVED (fallback implemented; runtime API 24/25 not measured)**

- **Evidence:** RN 0.88 exposes `fontVariationSettings` as an object or CSS string; older RN versions and Android API <26 handle variable fonts inconsistently. ADR-001 sets the peer floor at RN 0.81 and Android minSdk 24.
- **Resolution (Day 5):** `resolveVariableFontSupport()` gates on RN ≥ 0.88 and, on Android, API ≥ 26; `createM3Typography()` emits a static family plus explicit `fontWeight` on every unsupported branch and never emits `fontVariationSettings` there. `staticFamilies` maps 400/500/700 when the app supplies separate files; otherwise the base family is used with a synthetic weight. The resolver is unit-tested for RN 0.87, API 25, unknown RN versions, and unsupported platforms. RN's `ReactTypefaceUtils.parseFontVariationSettings` is source-verified to ignore the axis below API 26. Evidence: `packages/react-native-material-expressive/src/typography/support.ts`, `createTypography.ts`, `__tests__/typography.test.ts`, and the fallback matrix in `docs/evidence/day5/typography/README.md`.
- **Remaining:** No API 24/25 system image is installed, so the static fallback has not been rendered on a device. This is deterministic and tested, but a runtime confirmation belongs to the Day 42 Android compatibility matrix. It does not block Day 5.
- **Blocks:** Nothing for Day 5; API 24/25 runtime confirmation tracked under the compatibility matrix.

### U-20 — Compose's emphasized cubic-bezier is m3's standard fallback, not the Android emphasized path

- **Evidence (Day 2 spot-check):** m3's Easing & Duration token page defines Android emphasized easing as a multi-segment `pathInterpolator(M 0,0 C 0.05,0 … )`, with the CSS column marked “N/A (Use Standard as a fallback)”. Compose 1.5.0 `MotionTokens.kt:39` exposes `EasingEmphasizedCubicBezier = CubicBezierEasing(0.2, 0, 0, 1)`, which is numerically the same as `EasingStandardCubicBezier` (`MotionTokens.kt:64`).
- **Impact:** A cubic-bezier-only motion foundation cannot reproduce m3's Android emphasized curve. Components driven by the expressive motion scheme use springs, so this affects the legacy duration/easing path rather than spring-driven morphs.
- **Resolution:** Day 8: implement the m3 multi-segment emphasized path as a sampled/keyframe easing (or document a deliberate fallback), keep the Compose cubic value for API compatibility, and record the decision in `docs/specs/motion.behavior.md`. Do not claim the cubic value is the m3 Android emphasized curve.
- **Blocks:** Motion DONE (Day 8).

### U-22 — Compose 1.5.0 XS button padding diverges from m3.material.io

- **Evidence (Day 2 behavior spot-check):** Compose `ButtonXSmallTokens.kt` uses `LeadingSpace = 16dp`, `TrailingSpace = 16dp`, `IconLabelSpace = 8dp`. The rendered m3 buttons specs page (captured 2026-11-25) resolves `md.comp.button.xsmall.leading-space = 12dp`, `trailing-space = 12dp`, and `icon-label-space = 4dp`. Container height (32dp), S/M/L/XL heights, and all other sampled button sizes/paddings match.
- **Impact:** XS button width, label/icon gap, and hit-area padding. It does not affect S–XL.
- **Resolution:** Day 11, before Button's DONE cell: decide whether 1.0 follows Compose 1.5.0 (the pinned authority) or exposes an m3-XS-parity option. Record the decision in `docs/specs/button.behavior.md`; do not silently change either source. Until resolved, use Compose 16/16/8 and do not claim m3 XS parity.
- **Blocks:** Button DONE (Day 11) for the XS variant only.

### U-23 — Cross-stack text rasterization is not byte-identical on the Day 3 trivial scene — **RESOLVED**

- **Evidence (Day 3):** Both harnesses load the same Roboto Flex file (SHA-256 `9b523f7d82593df0107173849ebb8c817471a1df4b4fb2c3cbf40cfd810c8281`), the measured text layout is identical (402.0×73.0 px), and the strict content bbox is identical (68,75 395×59). The trivial and text scenes nevertheless differ by **1,745 px (0.3957%)** exact RGB; pixelmatch AA detection reduces this to **4 non-AA px (0.0009%)** at max channel Δ 162. Solid, rect, and shadow are exact-zero across 3 cold boots. Evidence: `docs/evidence/day3/README.md`, `results.json`, `report.html`.
- **Root cause (Day 4 follow-up):** RN hardcodes `isSubpixelText = true` and `isLinearText = true` on `CustomStyleSpan` and rounds font sizes **up to an integer physical pixel** (`Math.ceil(PixelUtil.toPixelFromDIP(fontSize))`). Compose's default `TextMotion.Static` uses font hinting with subpixel text off and keeps fractional sp/dp. Matching RN's flags (`TextMotion.Animated`) makes `text` and `trivial` **0 / 0**; adding integer font sizes reduces a 195-glyph paragraph to 119 AA-aware px and a 78-glyph label stack to 348; adding integer offsets leaves **1 + 2 exact px** (max Δ 6), 0 AA-aware. Evidence: `docs/evidence/day4/text-scaling/README.md`, `summary.json`, `SOURCE_EVIDENCE.md`, and `runs/{faithful,animated,ceil,floor}/`.
- **Impact:** The Day 3 gate scene remains at 4 AA-aware px, below the existing 220.5 px / 0.05% budget. Dense text scenes inherit RN's integer-pixel quantization; no library-side fix exists without changing text metrics. This is not a font-file, shaping, or renderer defect.
- **Resolution:** Resolved by measurement. The existing AA-aware gate is unchanged and no per-category threshold or ADR is proposed. `KNOWN_DEVIATIONS.md` records the inherent deviation. Any future “byte-exact cross-stack text under faithful Compose defaults” claim remains false; the accurate claims are **4 AA-aware px on the Day 3 gate scene** and **0 exact px when both harnesses use RN's integer text grid**.
- **Blocks:** None. Day 3 closed; Day 4 text follow-up complete.


### U-24 — API 34+ dynamic-colour role resources are source-derived, not emulator-verified

- **Evidence:** On API 31, the release gallery app returned a native tonal payload and all **96** values (48 light + 48 dark roles) matched Compose’s `dynamicLightColorScheme` / `dynamicDarkColorScheme` exactly. On API 34+, the native module reads 43 `system_*` role resources and fills `error`, `onError`, `errorContainer`, `onErrorContainer`, and `scrim` from the Compose baseline; the mapping is derived from Compose’s `DynamicTonalPalette.android.kt` and Android’s resource names. No API 34/35 system image is installed in the current environment, so this path has not run on a device.
- **Impact:** A renamed or missing role resource on API 34+ would make dynamic colour fall back to static colours (the JS loader catches malformed payloads), not crash. A wrong mapping could produce a plausible but incorrect scheme.
- **Resolution:** Day 42 Android compatibility matrix (or earlier): boot an API 34/35 emulator, run the gallery `M3E_DYNAMIC_PAYLOAD` probe, and compare against Compose’s dynamic schemes on the same device. Until then, do not claim API 34+ dynamic-colour exactness. API 31–33 is verified.
- **Blocks:** The API 34+ dynamic-colour claim only; Day 4 exit is met on API 31.

### U-25 — Day 5 typography gate interpretation: faithful vs matched rendering grid

- **Evidence:** The 30 one-line type scenes were captured twice with the same tokens and font. Faithful (Compose `TextMotion.Static`, fractional sp/dp): **9/30** scenes inside the 0.05% AA-aware budget, worst **2,745 px / 0.6224%** (`displayLarge`), **17,798 AA px = 10.64% of text ink** but only **0.040% of the image**. Matched rendering grid (Compose `TextMotion.Animated`, integer physical font sizes, floored offsets): **30/30** inside the budget, **26/30** byte-identical, four scenes with a 1 px baseline offset and max **105 px / 0.0238%**, **269 AA px = 0.16% of ink**. The standard five-scene gate is unchanged and green. Evidence: `docs/evidence/day5/typography/README.md`, `runs/{faithful,matched-grid}/`, `docs/evidence/day5/gate/`.
- **Impact:** PLAYBOOK Day 5 says “text scenes for all styles diff-pass (size, weight, width, tracking, line height)”. The parenthetical is met 30/30 on the matched grid; the faithful rasterized diff is 9/30. The image-area denominator is also the wrong budget for Day 11 components: a single 14sp label can exceed the 220.5 px image budget while its geometry is exact.
- **Resolution (2026-11-26):** Nasyx approved keeping the 30 type scenes as **tracked scenes in a separate “text” category**; the five-scene gate and all thresholds are unchanged for now. Follow-up completed:
  - U-25.1: precise D-001 pipeline (font size, line height/half-leading, letter spacing/em, glyph origin/subpixel) and the C1–C4 compensation experiment on the 21 failures. Best measured: C4 **994 AA px / 21-of-21** under the image gate, but per-string/per-density and not shippable. Evidence: `docs/evidence/day5/typography/compensation/`.
  - U-25.2: the four matched-grid +1 px baselines are explained by integer half-leading; predicted +0.779 px (`displaySmall`) and +0.467 px (`headlineSmall`), observed +1. The matched grid is linear+subpixel on both stacks, so the shift is the baseline offset alone; the faithful run additionally differs in rasterization mode (Compose hinting/non-subpixel vs RN linear/subpixel). `lineHeight` cannot fix it without a 1 px layout-height change. Evidence: `docs/evidence/day5/typography/baseline/`.
  - U-25.3: **ADR-010** (revised 2026-11-27) proposes an ink-normalized text metric: faithful **≤450 AA px / 1,000 ink px and ≤3.0 AA px / glyph / font px**; compensated **≤250 / 1,000 and ≤1.5** only if a generic compensation layer is approved; matched **≤15 / 1,000 and ≤0.2**. It also proposes a ±1 px ink-baseline rule. C2 and C4 are rejected as per-profile/per-string fits; the generic Compose `FontScaleConverter` is the proposed shipping layer for font scale ≥1.03 and remains a Day 10 prerequisite. All 30 roles and the dialog/list projections are in ADR-010. **Not applied; ADR-010 awaits Nasyx’s approval before Day 11.**
  - U-25.4: PLAYBOOK §9.1 adds the “never claim pixel-perfect text” wording rule.
- **Blocks:** **ADR-010 approval before Day 11** (first component with text is diffed). Day 5’s PASS label is resolved: PASS with the text category tracked separately. No implementation, gate, or threshold change is pending.

### U-26 — Static shape rasterization and the Compose shape diff are not yet verified — **RESOLVED**

- **Evidence (original):** Day 6 verified cubic geometry, feature mapping, and morph interpolation in a JVM golden. It made no rendering claim.
- **Resolution (2026-11-26):** Day 7 added a 35-shape Compose reference activity and a matching RN screen (5×7, 64dp shapes, 72dp pitch, identical `#6750A4` fill). A 924×1302 px crop was compared with the same AA-aware pixelmatch used by the scene gate: **0 AA-aware differing pixels**, 12,157 exact pixels (1.0105%, all classified as anti-aliasing fringe), max channel delta 68, mean absolute delta 0.0163. The exact bbox spans the grid because every shape's AA edge differs; the AA-aware bbox is empty, and every shape lands in the same 64dp cell (zero layout-edge delta). Evidence: `docs/evidence/day7/static-diff/README.md`, `apps/reference-compose/.../ShapeGridActivity.kt`, `apps/gallery/src/shapes/ShapeDiffScreen.tsx`, `tools/shapes/diff-static.mjs`.
- **Blocks:** Nothing. Shape rasterization parity is verified for the static grid.

### U-27 — The shape engine has not run on Hermes or the UI thread — **RESOLVED**

- **Evidence (original):** The Day 6 engine was pure TypeScript with no platform imports and no `'worklet'` directives. It was exercised only by Jest on Node.
- **Resolution (2026-11-26):** Day 7 ran the engine in the release gallery on Hermes, New Architecture, on both SVG and Skia. `interpolateGeometry`, `interpolate`, `geometryToSvgPath` and `formatCoordinate` carry `'worklet'` and execute on the UI thread; the spike's `useFrameCallback` measured 840–960 frames per 18 s run with no JS-thread per-frame work (progress is a shared value).
- **Crash found and fixed:** The first animated run failed with `[Worklets] Tried to synchronously call a Remote Function … interpolateGeometry_pathGeometryTs1` because `interpolateGeometry` was a worklet but its helper `interpolate` was not. The fix was to mark `interpolate` as a worklet and inline `Math.fround` instead of capturing the `f32` alias. `MorphingShape`, `ShapeContainer` and `PathCanvas` now animate on the UI thread. Evidence: `docs/evidence/day7/frame-times.md`, `apps/gallery/src/spike/ShapeSpike.tsx`, `packages/react-native-material-expressive/src/shapes/pathGeometry.ts`.
- **Install requirement:** consumers need the Worklets Babel plugin; `babel-preset-expo` adds it when `react-native-worklets` is installed. Recorded in ADR-003.
- **Blocks:** Nothing.

### U-28 — Morph goldens sample five progress values only — **RESOLVED**

- **Evidence:** The Day 6 golden covered progress `0, 0.25, 0.5, 0.75, 1`. Intermediate curves relied on the shared cubic interpolation; there was no golden for `0.1`, `0.33`, `0.6`, `0.9`, and no out-of-range sample.
- **Resolution (2026-11-26):** The JVM golden now samples `-0.1, 0, 0.1, 0.25, 0.33, 0.5, 0.6, 0.75, 0.9, 1, 1.1` on all 50 morphs: **550 samples / 25,806 cubic comparisons**, max **1.3594e-6** (`Gem -> Ghostish` @ `-0.1`), **0 failures over 1e-4**. `Morph.asCubics` and `interpolateGeometry` extrapolate; they do not clamp. `LoadingIndicator` uses a damping-ratio-0.6 spring on an `Animatable(0f) -> 1f` and passes the overshooting value into `Morph`, so this is the behavior the primitive must preserve. The TS suite also checks `-0.5` and `1.5` against `Morph.asCubics`. Evidence: `docs/evidence/day6/shapes/README.md` §“Morph progress outside [0, 1]”, `ShapeGoldenTest.kt`, `shapes.test.ts`.
- **Blocks:** Nothing. `MorphingShape` can pass spring progress straight through.

### U-29 — Day 7 frame times are emulator-only until a physical device is measured — **RESOLVED (2026-11-27)**

- **Evidence:** The only Android target is `emulator-5554`, API 31, 1080×1920, 420 dpi, SwiftShader software rendering. Day 7’s 35-shape cycle, 10 concurrent morphs, and clipped gradient ran there. The final readout build measured: cycle avg **16.76 ms SVG / 16.68 ms Skia**; concurrent **16.73 / 16.85**; clip **16.67 / 16.70**. All are pinned at the 60 Hz vsync ceiling; the six final-build averages stayed within 0.18 ms of each other and maxima ranged from 16.67 ms to 83.33 ms. An earlier 2026-11-27 pass ran at host load 10–15 and measured 28–73 ms; it is excluded because SwiftShader is host-CPU-bound. Full table and the host-load caveat: `docs/evidence/day7/frame-times.md`; the on-screen card is `docs/evidence/day7/frame-times-card.png`.
- **Impact:** SwiftShader frame times are not representative of a mid-range phone GPU. They cannot justify a production performance claim or a hard frame-time budget, and they cannot separate the renderers.
- **Resolution:** Two artifacts exist. The universal emulator APK is **203,440,223 bytes**, SHA-256 `612c6921c6444fbd8fae58b1acd8b548b64896a05ebd6a6e593d7b34653d9a28`. The phone APK is arm64-only, **58,369,090 bytes**, SHA-256 `7436712f45663084bd77558b10ff775052eecbd5107f6a51fe83ddcc26a82e2f`, built with `-PreactNativeArchitectures=arm64-v8a`. Both keep the on-screen FPS/frame-time card. The Xiaomi 2201116SI is rooted; MIUI rejects plain `adb install`, so it was installed from a root shell (`adb push` + `su -c 'pm install -r …'`). Steps and the capture script: `docs/evidence/day7/u29-device-steps.md`.
- **Result (2026-11-27):** Xiaomi 2201116SI, SoC **SM6375** (`holi`), Android 13 / API 33, 1080×2400, 440 dpi (2.750×), **60 Hz active mode** (`mActiveModeId=2`; 120 Hz panel, 120 Hz not tested). Last 20 s line per mode:

  | Mode | Renderer | Frames | Avg (ms) | Max (ms) |
  |---|---|---:|---:|---:|
  | `cycle` | SVG | 1080 | 17.22 | 33.54 |
  | `cycle` | Skia | 1140 | 16.72 | 33.55 |
  | `concurrent` | SVG | 1020 | 18.20 | 50.05 |
  | `concurrent` | Skia | 1140 | 16.71 | 16.96 |
  | `clip` | SVG | 1080 | 17.42 | 33.53 |
  | `clip` | Skia | 1140 | 16.71 | 17.07 |

  Skia holds the 60 Hz ceiling (16.71 ms) in all three modes. SVG is 0.5–1.5 ms above it and drops frames in the 10-concurrent-morph case (18.20 ms average, 50.05 ms maximum, ~51 fps). **ADR-002 is unchanged** (SVG wins on binary size 0.77 MB vs 29.78 MB per arm64 ABI, build/install friction and RN-child clipping), but the frame-time claim is scoped: SVG holds 60 fps for a single morph and the clipped-gradient scene, not for ten concurrent morphs on this device. Skia is smoother if a screen needs many simultaneous path animations. Card: `docs/evidence/day7/frame-times-device.png`; full table and method: `docs/evidence/day7/frame-times.md#physical-device-u-29`.
- **Blocks:** None. The production frame-time claim is recorded and scoped; Day 31/32 are no longer blocked by missing device data.

### U-30 — `react-native-skia` and `react-native-svg` are not runtime-verified with RN 0.88.1 — **RESOLVED**

- **Evidence (original):** `react-native-svg@15.16.0` was the Expo SDK 58 pin; `react-native-skia@3.13.1` was the current package. Both were installed in the gallery for the Day 7 spike, but neither had a committed release-build run.
- **Resolution (2026-11-26):** Both renderers built into a release APK, installed, and ran on `emulator-5554` (API 31), RN 0.88.1, New Architecture, Hermes. Grid, cycle, concurrent, clip and clipchildren modes all rendered on both. The renderer-evidence APK is **203,432,215 bytes**, SHA-256 `03057091286a7ee68993aa99dd16c21f02edfb3de389e9fc31d500d91ed9c5ca`, with both renderers; per-ABI cost is SVG **0.77 MB** vs Skia **29.78 MB** (`docs/evidence/day7/renderer/README.md`). The later U-29 spike artifact adds the on-screen FPS card and the clip probe: **203,440,223 bytes**, SHA-256 `612c6921c6444fbd8fae58b1acd8b548b64896a05ebd6a6e593d7b34653d9a28`; the 8,008 B delta is verification chrome. U-30 previously quoted **203,431,419 bytes** from an earlier build in the same session; that artifact was 1,796 B smaller. The final count is the one paired with the recorded hash and is authoritative. SVG is pinned as the peer in ADR-003; Skia remains a gallery-only spike dependency.
- **Blocks:** Nothing. ADR-002 and ADR-003 are finalized.

### U-31 — The approved “text” scene category is not yet represented in the schema or report — **RESOLVED**

- **Evidence:** Nasyx approved keeping the 30 type scenes as tracked scenes in a separate **“text”** category. The scenes existed as `type-*` files, but the scene schema, index, and report had no category field or grouping.
- **Resolution (2026-11-26):** `category` is now a required scene field with values `core` or `text`. The five gate scenes are `core`; the 30 typography roles are `text`; the dense `labels` and `paragraph` probes are also `text`. `tools/scenes/index.json` and `apps/gallery/src/scenes.generated.ts` carry the category. The report adds a scene-category table, scopes the 0.05% gate to `core`, and reports `text` as tracked without a pass/fail threshold. The default `--scenes solid,rect,text,shadow,trivial` selection is unchanged. The gate, typography-faithful, and typography-matched reports were regenerated: the faithful run shows `core` 5 scenes / 8 AA px / 0.05% met and `text` 30 scenes / 17,798 AA px / tracked. Evidence: `tools/scenes/build.mjs`, `tools/pixel/report.mjs`, `docs/evidence/day5/typography/runs/faithful/results.json` (`gate.categories`).
- **Blocks:** Nothing. U-25 reporting structure is now auditable.

### U-32 — `foreignObject` clips visually but does not lay out, touch or expose the RN subtree — **RESOLVED (scope decision, ADR-017)**

- **Evidence:** The Day 7 probe (`apps/gallery/src/shapes/ClipProbeScreen.tsx`, route `m3egallery://?screen=clipprobe`) clipped a 300 dp RN subtree to `Clover4Leaf` on `emulator-5554` (API 31, 1080×1920, 420 dpi, SwiftShader, release APK, RN 0.88.1, New Architecture, Hermes, `react-native-svg@15.16.0`). Visual clipping and animated children work: the dot moved from x = 601.7 px to x = 631.1 px in 1 s. Touch and accessibility do not. Taps at the inside-zone centre (537, 849) and the clipped-away outside-zone corner (180, 492) produced no `[M3E] clipprobe_tap`; a swipe produced no `[M3E] clipprobe_scroll`; the Pause button outside the SVG did toggle, proving input dispatch. `uiautomator` reports the child container as `[146,458][146,458]` (0×0) and the zones as `[167,479][146,458]` / `[461,773][146,458]` (negative size), although the nodes are `clickable=true` and `focusable=true`. TalkBack is not installed on the emulator image, so a live screen-reader pass was not possible. Evidence: `docs/evidence/day7/foreign-object/README.md`, `accessibility-tree.xml`, `01-clip-running.png` … `03-clip-paused.png`.
- **Root cause:** `react-native-svg`’s `ForeignObjectView` extends `GroupView`; `drawGroup` manually draws non-virtual children with `child.draw(canvas)`, but `VirtualView.onLayout` never lays out those children. The RN wrapper therefore keeps a zero Android layout size, so `ViewGroup.dispatchTouchEvent` skips it and accessibility bounds collapse to the parent origin. `RNSVGForeignObjectShadowNode` is a `YogaLayoutableShadowNode` (PR #2833, merged 2025-11-26), but that does not lay out the mounted RN subtree. Open upstream issues #1389 (`ForeignObject onPress() event not firing`, since 2020-05-26) and #1906 (`ForeignObject working wrong`, since 2022-11-04) describe the same class of failure.
- **Impact:** `ShapeContainer` is visual-only. Any button, scroll view, text input or screen-reader target inside it is unreachable. `Shape` and `MorphingShape` are unaffected, and the Day 7 renderer decision is unaffected: SVG still wins on binary size, build/install friction and visual RN-child clipping. The `ShapeContainer` row in `docs/COMPONENT_MATRIX.md` stays **not DONE**.
- **Decision (2026-11-27, ADR-017):** The Compose 1.5.0 audit found no component that needs interactive or screen-reader-focusable children clipped to a non-rounded-rect MaterialShape (only `LoadingIndicator` uses `MaterialShapes`, and it has no child slot). Interactive containers therefore use RN `borderRadius` in 1.0.0. `ShapeContainer` is decorative-only: the required `decorative` prop is a type-level guard, a dev-only traversal warns on pressable/accessible children, and the subtree is hidden from assistive technology with `pointerEvents="none"` so it cannot expose broken nodes or swallow input.
- **Remaining (post-1.0):** A native mask spike (normal RN view plus a native `clipPath`/mask host) is in `docs/BACKLOG.md`; the live TalkBack pass for polygon-clipped interactive content ships with it. This does not block 1.0.
- **Blocks:** Nothing in 1.0. The native mask capability and its TalkBack pass are post-1.0 backlog.
