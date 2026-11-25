# Day 0 sources and verification log

**Date:** 2026-11-25. All URLs below were fetched from this machine on that date. Large downloads live in `docs/research/raw/` and are git-ignored; the committed summaries + sha256 are the traceable artifacts.

---

## 1. Compose Material3 (primary source of truth)

| Item | Value |
|---|---|
| `androidx.compose.material3:material3:1.5.0` | Stable. Release-notes page says **November 18, 2026**. |
| Sources JAR | `https://dl.google.com/dl/android/maven2/androidx/compose/material3/material3/1.5.0/material3-1.5.0-sources.jar` |
| sha256 | `d389bb542a1637dc202e715b279a178be1b0d51886234fe2810a92427c07b2a6` |
| Size | 829 KB compressed, 271 `.kt` files |
| `material3-ripple:1.5.0` | sources sha256 `1f57e1b16ca4558977d3b4b94beefc8693dd1cb49634cf90dc8aa5ef74704efd` |
| `androidx.graphics:graphics-shapes:1.1.0` | sources sha256 `50586aa6c7b3a542a51b2abaf659f7a6c33d8c5d637d8f1a57aaf518dcb74f3d` |
| `material3-window-size-class:1.5.0` | Maven metadata confirms 1.5.0 stable |
| `material3-adaptive-navigation-suite:1.5.0` | Maven metadata confirms 1.5.0 stable; 1.6.0-alpha01 exists |
| `androidx.compose.material3.adaptive:{adaptive,adaptive-layout,adaptive-navigation}:1.3.0` | Current stable group; the old `material3-adaptive` artifact is stale at 1.0.0-alpha06 |
| `material3:1.6.0-alpha01` | Exists (2026-11-18); **not** the baseline |

Key source files / lines:

| Claim | Source |
|---|---|
| `MaterialExpressiveTheme` | `commonMain/androidx/compose/material3/MaterialTheme.kt:238` |
| Typography TODO in expressive theme | same file, ~line 264 (`typography = typography ?: Typography()`) |
| `expressiveLightColorScheme()` only; no dark variant | `ColorScheme.kt:1172`; KDoc says use `darkColorScheme` for dark |
| `MotionScheme.standard()` / `.expressive()` | `MotionScheme.kt:123`, `:132` |
| Expressive spring tokens | `tokens/ExpressiveMotionTokens.kt` (default 380/0.8, fast 800/0.6, slow 200/0.8, effects 1600/1.0, 3800/1.0, 800/1.0) |
| Standard spring tokens | `tokens/StandardMotionTokens.kt` (default 700/0.9, fast 1400/0.9, slow 300/0.9, effects 1600/1.0, 3800/1.0, 800/1.0) |
| State layer opacities | `tokens/StateTokens.kt`: dragged .16, focus .10, hover .08, pressed .10 |
| Shape corner tokens | `tokens/ShapeTokens.kt`: XS 4, S 8, M 12, L 16, L-increased 20, XL 28, XL-increased 32, XXL 48 |
| `MaterialShapes` 35 values | `MaterialShapes.kt` |
| Wavy progress | `WavyProgressIndicator.kt` (`LinearWavyProgressIndicator`, `CircularWavyProgressIndicator`) |
| Loading indicator | `LoadingIndicator.kt` (`LoadingIndicator`, `ContainedLoadingIndicator`) |
| Button groups | `ButtonGroup.kt` |
| Split button | `SplitButton.kt` |
| FAB menu | `FloatingActionButtonMenu.kt` (`FloatingActionButtonMenu`, `ToggleFloatingActionButton`) |
| Floating toolbars | `FloatingToolbar.kt` (`HorizontalFloatingToolbar`, `VerticalFloatingToolbar`) |
| Docked toolbar is `FlexibleBottomAppBar` + `DockedToolbarTokens` | `AppBar.kt:1286`, `:2344`, `:2352`; no `DockedToolbar` composable |
| Scroll fields | `ScrollField.kt` |
| Secure text fields | `SecureTextField.kt` |
| Pull to refresh | `pulltorefresh/PullToRefresh.kt` |
| Short/widi nav | `ShortNavigationBar.kt`, `WideNavigationRail.kt` |
| Segmented list item | `ListItem.kt` |
| Grouped menu | `Menu.kt` (`DropdownMenuGroup`) |
| Time scroll / vibrant dialog | `TimePicker.kt` (`TimeScroll`), `TimePickerDialog.kt` (`VibrantTimePickerDialog`) |
| No SideSheet / Banner / DataTable / Avatar | grep across 1.5.0 sources returned no public symbols |

Committed inventory: `docs/research/COMPOSE_M3_1.5.0_INVENTORY.md`.

Release notes: `https://developer.android.com/jetpack/androidx/releases/compose-material3` (page checked; “November 18, 2026 1.5.0”; 1.6.0-alpha01 section present).

---

## 2. m3.material.io (secondary source)

- Sitemap: `https://m3.material.io/sitemap.xml` (722,365 bytes; 385 URLs; 155 component URLs).
- **37 component families** after excluding XR/index pages: app-bars, badges, bottom-sheets, button-groups, buttons, cards, carousel, checkbox, chips, date-pickers, dialogs, divider, extended-fab, fab-menu, floating-action-button, icon-buttons, lists, loading-indicator, menus, navigation-bar, navigation-drawer, navigation-rail, progress-indicators, radio-button, scroll-fields, search, segmented-buttons, side-sheets, sliders, snackbar, split-button, switch, tabs, text-fields, time-pickers, toolbars, tooltips.
- `scroll-fields` and `time-pickers` pages were last modified **2026-11-17**; `button-groups`, `split-button`, `segmented-buttons`, `text-fields` **2026-09-08/16**; `buttons`, `cards`, etc. **2026-07-17/28**.
- Availability checks (headless Chrome, JS-rendered pages):
  - Buttons: Compose Available + Expressive Available.
  - Button groups: Compose Expressive Available; “Connected button groups replace the segmented button”; segmented buttons deprecated in the expressive update.
  - Split button: Compose Expressive Available.
  - FAB menu: Compose Expressive Available; Android Views Expressive Unavailable.
  - Loading indicator: Compose Expressive Available.
  - Chips: Compose Available; page has an “Updates” section, **not** an “M3 Expressive update” section.
  - Scroll fields: Compose Expressive Available; iOS Expressive Unavailable.
- Source-of-truth resolution: where the page lags the code (chips shape morph), Compose wins; where Compose has no implementation (SideSheet), the page is the only spec and the row is NCR.

---

## 3. Compose Multiplatform (iOS addendum)

| Item | Value |
|---|---|
| CMP latest stable | 1.12.2 (2026-10-15) |
| CMP latest prerelease | 1.13.0-rc01 (2026-11-18) |
| Material3 artifact stable | `org.jetbrains.compose.material3:material3:1.9.0` |
| Material3 artifact RC | `org.jetbrains.compose.material3:material3:1.13.0-rc01` |

Source comparison (`.kt` files by basename):

- AndroidX 1.5.0: 271 files. CMP 1.13.0-rc01: 353 files.
- Shared: 245. Byte-identical: **235 (95.9%)**.
- CMP 1.13 contains: ButtonGroup, SplitButton, WavyProgressIndicator, LoadingIndicator, FloatingToolbar, MaterialShapes (35), FloatingActionButtonMenu, ScrollField, SecureTextField, PullToRefresh, ShortNavigationBar, WideNavigationRail, TimePicker, SegmentedButton.
- CMP **1.9.0 lacks**: ButtonGroup, SplitButton, WavyProgressIndicator, LoadingIndicator, FloatingToolbar, MaterialShapes, FloatingActionButtonMenu, ScrollField.
- 10 differing shared files: `BasicTooltip.kt`, `Checkbox.kt`, `MaterialTheme.kt`, `NavigationItem.kt`, `RadioButton.kt`, `ScrollField.kt`, `SearchBar.kt`, `ShortNavigationBar.kt`, `TimePicker.kt`, `WideNavigationRail.kt`.
- `ScrollField.kt` delta: AndroidX 1.5.0 has `ScrollFieldImpl` + configurable `field`; CMP has an older, smaller API. Do not diff ScrollField on iOS.
- CMP `MaterialTheme.kt` only adds an internal `ComponentProperties`; harmless.
- CMP motion tokens and MaterialShapes match AndroidX values/count.

Resolution: ADR-004.

---

## 4. React Native Paper (competitor)

| Item | Value |
|---|---|
| npm `latest` | 5.15.5 (2026-11-16) |
| npm `alpha` | **6.0.0-alpha.4** (2026-11-23T14:58Z) |
| GitHub release | `v6.0.0-alpha.4` (2026-11-23) |
| Roadmap issue | `callstack/react-native-paper#5150` (updated 2026-11-24) |
| Source size | 47,565 LOC in `src` |
| Public component families | ~34 |
| Signature-set score | **2.5/14 = 17.9%** (max 28.6% counting partials as full) |

Paper roadmap facts (verbatim/paraphrase from #5150):

- Phase 2 (breaking changes), no target date, gate-based.
- “New components ship in 6.1 or later, with no exceptions in 6.0.”
- D2: NavigationBar #5006 planned, **unchecked**; BottomNavigation still exported.
- D3: Progress indicators stay flat; no `react-native-svg`; new indicators later.
- D7: Toolbar in 6.1; bottom app bar deprecated until then.
- D8: Toolbar (#5043), ConnectedButtonGroup (#5074) in 6.1; SegmentedButtons deprecated in 6.1 and removed in 7.0.
- D15: Sliders in 6.1.
- Alpha.4 includes Button/IconButton shape morph, FAB.Menu, Switch 48dp/icon/spring, TextInput state colors/RTL, `useReduceMotion()`.
- Known alpha.4 issues: Dialog empty gap; web hover .05 vs spec .08; TextInput supporting-text RTL; Appbar title overlap; Button a11y/loading; FAB.Menu back/keyboard; Menu screen-reader focus; Tooltip focus stop.

Full table: `docs/COMPETITOR_MATRIX.md`.

---

## 5. Other RN libraries (npm/GitHub search)

Search endpoints:

- `https://registry.npmjs.org/-/v1/search?text=material%20expressive%20react-native`
- `https://registry.npmjs.org/-/v1/search?text=m3%20expressive`
- `https://api.github.com/search/repositories?q=material+3+expressive+react+native`

Findings:

- `@expressive-ui/native@0.3.0` — 2026-11-24, MIT, 6,516 LOC `src`, 153 package files, peer `react-native-svg`, no `repository` field, RN `Animated` (21 files; no Reanimated), no `MaterialShapes`/`RoundedPolygon`, 0.x.
- `react-native-platform-components@1.12.0` — native widgets, 2026-11-24.
- `kamp0010/react-native-m3` — GitHub, 2 stars, last push 2026-02-06, MIT.
- `@isoline-ui/react-native@2.1.3` — adjacent expressive UI, NativeWind, not M3-specific.
- `flaut-org/react-md3e` — web React, not RN.

No RN library with a published Compose diff suite found.

---

## 6. Version matrix (RN/Expo/Reanimated)

| Package | Expo SDK 58 pin | Latest standalone |
|---|---|---|
| react-native | 0.88.0-rc.3 | 0.88.1 |
| react-native-reanimated | 4.7.0 | 4.8.0 (peer RN 0.87–0.89, worklets 0.14.x) |
| react-native-worklets | 0.13.0 | 0.14.0 |
| react-native-svg | 15.15.5 | 15.16.1 |
| react-native-gesture-handler | ~3.2.1 | 3.5.0 |
| react-native-safe-area-context | ~5.9.1 | 5.11.1 |
| react-native-skia | not bundled | 3.13.0 (2026-11-25; peer Reanimated ≥4, Worklets ≥0.7) |
| @material/material-color-utilities | — | 0.4.0 (2026-01-21) |

`fontVariationSettings` is documented on the current RN text-style page for `Text`/`TextInput`, object or CSS-string form.

---

## 7. Fonts / licensing

| Asset | File | Size | License |
|---|---|---|---|
| Material Symbols Outlined | `MaterialSymbolsOutlined[FILL,GRAD,opsz,wght].ttf` | 10,744,832 B | Apache-2.0 (`google/material-design-icons/LICENSE`) |
| Material Symbols codepoints | `.codepoints` | 79,421 B | Apache-2.0 |
| Roboto Flex | `RobotoFlex[GRAD,XOPQ,XTRA,YOPQ,YTAS,YTDE,YTFI,YTLC,YTUC,opsz,slnt,wdth,wght].ttf` | 1,787,292 B | SIL OFL 1.1 (`google/fonts/ofl/robotoflex/OFL.txt`) |

Subsetting is required before bundling the 10.7 MB symbol font (U-14).

---

## 8. npm name availability (for Day 1)

HTTP 404 (available) on 2026-11-25:

- `react-native-material-expressive`
- `react-native-m3e`
- `react-native-m3-expressive`
- `m3e`
- `@m3e/react-native`
- `@material-expressive/react-native`

---

## 9. Reproducibility / limitations

- The machine had Node 24.22.3, git 2.50.1, JDK 17.0.20.1, adb 1.0.41 (platform-tools 37.0.1), Xcode 26.5. `pnpm` was **not** installed (Day 1 task).
- Android/iOS emulators were not started on Day 0; no runtime rendering was performed. All visual claims are source/spec claims, not screenshots.
- The server restarted during the m3 page scrape; 17 of the target pages were captured, `progress-indicators` initially wrote 0 bytes and was re-fetched. No Day 0 conclusion depends on the missing pages.
- Raw downloads are git-ignored. Committed summaries: this file, `COMPOSE_M3_1.5.0_INVENTORY.md`, the two matrices, ADRs, and UNVERIFIED.

---

## 10. Flutter cross-check (not truth — Core Rule 1)

The playbook asks to reconcile §8 against Flutter's M3E work. Checked on 2026-11-25:

- `material_3_expressive` **1.2.3**, published **2026-11-18**, MIT, ~65 GitHub stars, last push 2026-11-23.
- Repo: `https://github.com/paadevelopments/material_3_expressive`.
- **39 component directories**: app_bars, badges, bottom_sheets, button_group, buttons, cards, carousel, checkbox, chips, date_pickers, dialogs, divider, dropdown_menus, extended_fabs, fab_menu, floating_action_buttons, icon_buttons, lists, loading_indicator, menus, navigation_bar, navigation_drawer, navigation_rail, progress_indicators, radio_button, refresh_indicator, search, segmented_buttons, selection, side_sheets, sliders, snackbar, split_buttons, switch_control, tabs, text_fields, time_pickers, toolbars, tooltips.
- It implements shape morphing, wavy sliders, loading indicators, toolbars, split buttons, button groups, side sheets, and Material-shape morphs; it depends on MIT packages `material_new_shapes`, `material_ui`, `motor`, `dynamic_color`, `cupertino_ui`.
- Related Flutter packages: `m3e_core` 1.1.5 (2026-10-30), `m3e_collection` 0.3.7 (2025-11-12), plus per-component packages (`button_m3e`, `toolbar_m3e`, `split_button_m3e`, `loading_indicator_m3e`, …).

**Use:** cross-check only. It is not Google-authored, not Android Compose, and its values are not citable as spec. It is useful as a second opinion on component behavior and as evidence that m3-spec-only surfaces (e.g. `side_sheets`) are implementable without a Compose implementation. It does not change the baseline or the gate.
