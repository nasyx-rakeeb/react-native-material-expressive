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
  - U-25.3: **ADR-010** proposes an ink-normalized text metric (faithful ≤450 AA px / 1,000 ink px and ≤250 px/glyph; matched ≤15 / 1,000 and ≤15/glyph) plus a ±1 px baseline rule, with all 30 roles and dialog/list projections. **Not applied.**
  - U-25.4: PLAYBOOK §9.1 adds the “never claim pixel-perfect text” wording rule.
- **Blocks:** **ADR-010 approval before Day 11** (first component with text is diffed). Day 5’s PASS label is resolved: PASS with the text category tracked separately. No implementation, gate, or threshold change is pending.

### U-26 — Static shape rasterization and the Compose shape diff are not yet verified

- **Evidence:** Day 6 verifies cubic geometry, feature mapping, and morph interpolation in a JVM golden. It makes no rendering claim. The shape gallery and the static-shape Compose diff are Day 7 exit items.
- **Impact:** A renderer can draw the correct cubics with a different fill rule, antialiasing, or clipping and still pass the Day 6 tests. No screenshot evidence exists yet.
- **Resolution:** Day 7: render all 35 shapes in the gallery and in a Compose reference scene, run the AA-aware pixel diff, and record the result in `docs/evidence/day7/shapes/README.md`. Do not claim shape rasterization parity before that report exists.
- **Blocks:** Day 7 exit; the shapes `diff` and `gallery` matrix cells.

### U-27 — The shape engine has not run on Hermes or the UI thread

- **Evidence:** The Day 6 engine is pure TypeScript with no platform imports and no `'worklet'` directives. It is exercised only by Jest on Node. Day 7 adds `PathCanvas`, which decides where the interpolation runs.
- **Impact:** Hermes numeric behavior, worklet serialization of `PathGeometry`, and UI-thread allocation costs are unmeasured. A Node-only pass does not prove the engine can run per frame on the UI thread.
- **Resolution:** Day 7: run the shape spike and `PathCanvas` in the release gallery on Hermes, verify the worklet path, and record frame/behavior evidence. Add worklet directives only where the UI-thread path requires them.
- **Blocks:** `PathCanvas` DONE and the Day 7 renderer decision.

### U-28 — Morph goldens sample five progress values only

- **Evidence:** The Day 6 golden covers progress `0, 0.25, 0.5, 0.75, 1`. Intermediate curves rely on the shared cubic interpolation; there is no golden for `0.1`, `0.33`, `0.6`, or `0.9`, and no out-of-range sample.
- **Impact:** A bug that only appears between the sampled values would pass. Out-of-range behavior (spring overshoot, negative progress) is not covered at all.
- **Resolution:** Day 6 follow-up: add intermediate samples and out-of-range samples to the JVM golden, test the TS port against them, and document whether `Morph` clamps or extrapolates. This item closes when the new samples pass.
- **Blocks:** Any morphing component that can overshoot (Day 7 `MorphingShape` and later spring-driven components).

### U-29 — Day 7 frame times are emulator-only until a physical device is measured

- **Evidence:** The only Android target is `emulator-5554`, API 31, 1080×1920, 420 dpi, SwiftShader software rendering. Day 7’s 35-shape cycle, 10 concurrent morphs, and clipping benchmarks run there.
- **Impact:** SwiftShader frame times are not representative of a mid-range phone GPU. They can compare SVG vs Skia relative behavior, but they cannot justify a production performance claim or a hard frame-time budget.
- **Resolution:** Build the release spike APK and collect `dumpsys gfxinfo` on Nasyx's physical Android phone (or a connected adb device) before the frame-time part of ADR-002 is final. Label every emulator number **emulator-only / SwiftShader**. Binary-size, install friction, and clipping correctness can be decided from the current build.
- **Blocks:** The frame-time portion of ADR-002; not the renderer’s functional decision.

### U-30 — `react-native-skia` and `react-native-svg` are not runtime-verified with RN 0.88.1

- **Evidence:** `react-native-svg@15.16.0` is the Expo SDK 58 pin; `react-native-skia@3.13.1` is the current package. Both are installed in the gallery for the Day 7 spike, but neither has a committed release-build run yet.
- **Impact:** A native build failure, New Architecture incompatibility, or missing worklet support would invalidate the spike. Package metadata alone is not evidence.
- **Resolution:** Day 7: build and run the release gallery with each renderer, record the build result, APK size, and on-device behavior, then pin the chosen peer versions in ADR-003.
- **Blocks:** ADR-002 and ADR-003 finalization.

### U-31 — The approved “text” scene category is not yet represented in the schema or report

- **Evidence:** Nasyx approved keeping the 30 type scenes as tracked scenes in a separate **“text”** category. The scenes exist as `type-*` files, but the scene schema, index, and report have no category field or grouping; the five-scene gate is unchanged.
- **Impact:** Reports cannot separate the text category from the five-scene gate, so the approved structure is not auditable.
- **Resolution:** Add a `category` field to the scene schema/index (`core` for the five gate scenes, `text` for the 30 type scenes), surface it in the report, and keep the five-scene gate selection unchanged. Close this item with the commit and a regenerated report.
- **Blocks:** Nothing at runtime; it blocks the U-25 reporting claim until implemented.
