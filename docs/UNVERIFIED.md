# Unverified / unresolved claims

A component cannot be marked DONE while it has an open entry here. Day 0 resolved the six original `UNVERIFIED-1..6`; new open items are listed below with an owner and a resolution day.

**Last updated:** 2026-11-25 (Day 0)

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
- Decision: use the Expo SDK 58 pair in the gallery/dev-client app (4.7.0/0.13.0); use 4.8.0/0.14.0 only in the bare RN 0.88 compatibility job. Final pin is ADR-003 (Day 7).

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
- m3 side sheets: spec exists, **no public Compose 1.5.0 implementation**. NCR.

---

## Open items (block DONE)

### U-7 — Expressive dark color scheme is absent in Compose 1.5.0

- **Claim:** The plan says “expressive color schemes” (plural). Compose 1.5.0 ships only `expressiveLightColorScheme()`; its KDoc says to use `darkColorScheme()` for dark mode.
- **Impact:** Public provider API and dark-mode appearance.
- **Resolution:** ADR-006 (proposed): mirror Compose (light expressive, dark standard). Revisit if Compose ships a dark scheme.
- **Blocks:** Color system DONE (Day 4).

### U-8 — Expressive/emphasized typography is not wired into the default theme

- **Claim:** The plan says “custom brand font across the entire type scale” and “baseline + emphasized scales”.
- **Evidence:** `TypographyTokens.kt`/`TypeScaleTokens.kt` contain 15 emphasized styles, but `MaterialExpressiveTheme` passes `Typography()` and contains `// TODO: replace with calls to Expressive typography default` (`MaterialTheme.kt` ~line 264).
- **Impact:** Default type scale vs opt-in emphasized styles.
- **Resolution:** ADR-006: expose emphasized styles, do not make them default. Confirm with Nasyx.
- **Blocks:** Typography DONE (Day 5).

### U-9 — m3 chips page does not mark an Expressive update, but Compose Chip supports shape morph

- **Evidence:** m3 chips overview has an “Updates” section, not “M3 Expressive update”; `Chip.kt` exposes `ChipShapes` and `FilterChip(shapes=...)` with KDoc describing corner morphing; `ChipShapes`/`FilterChipDefaults.shapes` exist in 1.5.0.
- **Impact:** Whether chip morph is release-gated as an Expressive feature.
- **Resolution:** Treat Compose as truth (Core Rule 1); document the m3 page lag. Verify the exact `ChipShapes` defaults on Day 17.
- **Blocks:** Chips DONE (Day 17).

### U-10 — `SideSheet` has no Compose 1.5.0 reference

- **Evidence:** No `SideSheet` symbol in the 1.5.0 sources; m3 side-sheets spec exists.
- **Impact:** Cannot produce a Compose diff for this row.
- **Resolution:** ADR-005 (proposed NCR exception). If approved, implement to m3 spec + own regression baseline.
- **Blocks:** SideSheet DONE (Day 29).

### U-11 — Paper-only parity components have no Compose reference

- **Components:** Banner, Avatar, DataTable, HelperText (as a distinct component), Accordion/expandable list.
- **Impact:** Release Gate #1 cannot apply as written.
- **Resolution:** ADR-005. Do not implement until approved (Day 38).
- **Blocks:** Day 38 parity extras.

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
