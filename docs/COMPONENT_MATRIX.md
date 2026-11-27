# Component Matrix — 1.0 scope baseline

**Baseline (pinned):**

| Artifact | Version | Source / note |
|---|---|---|
| `androidx.compose.material3:material3` | **1.5.0** (stable, 2026-11-18) | Sources JAR, sha256 `d389bb542a1637dc202e715b279a178be1b0d51886234fe2810a92427c07b2a6` |
| `androidx.compose.material3:material3-ripple` | **1.5.0** | sha256 `1f57e1b16ca4558977d3b4b94beefc8693dd1cb49634cf90dc8aa5ef74704efd` |
| `androidx.compose.material3:material3-window-size-class` | **1.5.0** | Pinned with Material3 |
| `androidx.compose.material3:material3-adaptive-navigation-suite` | **1.5.0** | 1.6.0-alpha01 exists; not the baseline |
| `androidx.compose.material3.adaptive:{adaptive,adaptive-layout,adaptive-navigation}` | **1.3.0** | New group ID; the old `material3-adaptive` artifact is stale (1.0.0-alpha06) |
| `androidx.graphics:graphics-shapes` | **1.1.0** | sha256 `50586aa6c7b3a542a51b2abaf659f7a6c33d8c5d637d8f1a57aaf518dcb74f3d` |
| `m3.material.io` catalog | snapshot **2026-11-25** | 37 component families + XR pages; sitemap captured |

**Authority order:** Compose 1.5.0 sources → m3.material.io → other ports as cross-checks only. Paper is used **only** for parity extras that have no Google implementation (see ADR-005).

**Legend**

- `[ ]` — not done. A box is only ticked with an artifact (commit, report path, test run).
- `—` — not applicable for this row.
- `REF` — iOS is checked against a Compose Multiplatform reference render; iOS diffs are **structural/reference only**, never the release gate (Core Rule 3, ADR-004).
- `spec` **spec-verified** — no Compose reference implementation exists for this surface. It is verified against measured m3.material.io spec assertions (`docs/specs/<component>.json`) plus a frozen self-regression baseline, and is **never** called Compose-verified (ADR-005). The Android diff column reads `n/a spec`.

**Column key:** spec = `docs/specs/*.json` + implementation read; diff = Android screenshot report; motion = numeric + frame-sampled; iOS = CMP structural diff / inspection; a11y = TalkBack + VoiceOver + keyboard + 200% + reduce motion + RTL; tests = unit + RNTL + a11y; DONE = all evidence present.

---

## Foundations & primitives

| Component | Authority / source | spec | impl | diff | motion | iOS | a11y | tests | docs | gallery | DONE |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `M3Provider` / theme | `MaterialTheme.kt`, `MaterialExpressiveTheme` | [ ] | [ ] | — | — | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Color schemes & roles | `ColorScheme.kt`, `ColorLightTokens`, `ColorDarkTokens`, `PaletteTokens` | [x] | [x] | [ ] | — | [ ] | [ ] | [x] | [x] | [ ] | [ ] |
| Dynamic color (Android 12+) | Native module + fallback; `@material/material-color-utilities` 0.4.0 | [x] | [x] | [ ] | — | n/a | [ ] | [x] | [x] | [ ] | [ ] |
| Typography (baseline + emphasized) | `Typography.kt`, `TypeScaleTokens.kt`, `TypefaceTokens.kt` | [x] | [x] | [ ] | — | [ ] | [ ] | [x] | [x] | [ ] | [ ] |
| Shape tokens | `ShapeTokens.kt`, `Shapes.kt` | [x] | [x] | [ ] | — | [ ] | [ ] | [x] | [x] | [ ] | [ ] |
| `MaterialShapes` (35 shapes) | `MaterialShapes.kt`, `graphics-shapes` 1.1.0 | [x] | [x] | [x] | — | [ ] | — | [x] | [x] | [x] | [ ] |
| `RoundedPolygon` / `Morph` engine | `graphics-shapes` sources | [x] | [x] | [x] | — | [ ] | — | [x] | [x] | [x] | [ ] |
| `Shape` primitive | ADR-002; `MaterialShapes.kt` | [x] | [x] | [x] | — | [ ] | — | [ ] | [x] | [x] | [ ] |
| `MorphingShape` primitive | ADR-011/012; `Morph.toPath` | [x] | [x] | [ ] | [x] | [ ] | — | [ ] | [x] | [x] | [ ] |
| `ShapeContainer` (decorative clip only; ADR-017) | ADR-002; shaped-container design | [ ] | [x] | [x] | [x] | [ ] | [ ] | [ ] | [x] | [x] | [ ] |
| Motion scheme & spring hooks | `MotionScheme.kt`, `StandardMotionTokens`, `ExpressiveMotionTokens` | [x] | [x] | — | [x] | [ ] | [ ] | [x] | [x] | [x] | [ ] |
| Elevation & shadows | `Elevation.kt`, `ElevationTokens.kt` | [x] | [x] | [x] | — | [x] | [ ] | [x] | [x] | [x] | [ ] |
| State layers | `StateTokens.kt` (hover .08, focus .10, pressed .10, dragged .16) | [x] | [x] | [x] | — | [ ] | [ ] | [x] | [x] | [x] | [ ] |
| Ripple + inset focus ring | `material3-ripple` 1.5.0, `Ripple.kt` | [x] | [x] | [x] | [x] | [ ] | [ ] | [x] | [x] | [x] | [ ] |
| `Interactive` pressable primitive | `InteractiveComponentSize.kt`, state machine design | [x] | [x] | [x] | — | [ ] | [ ] | [x] | [x] | [x] | [ ] |
| `Surface` | `Surface.kt` | [x] | [x] | [x] | — | [x] | [ ] | [x] | [x] | [x] | [ ] |
| `Text` | `Text.kt`, `ProvideContentColorTextStyle.kt` | [ ] | [ ] | [ ] | — | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `Icon` | `Icon.kt`; Material Symbols variable font + internal paths | [ ] | [ ] | [ ] | — | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `OverlayHost` / `Portal` | Architecture §5.2; Compose `BasicEdgeToEdgeDialog`, `Menu`, `SnackbarHost` | [ ] | [ ] | [ ] | — | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Window size classes | `material3-window-size-class` 1.5.0; 8dp spacing | [ ] | [ ] | — | — | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Haptics adapter | Injectable adapter (no hard dependency) | [x] | [x] | — | — | [ ] | [ ] | [x] | [x] | [ ] | [ ] |
| RTL / layout utilities | Compose layout semantics; m3 guidelines | [ ] | [ ] | [ ] | — | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

Day 7 note: the static 35-shape grid now diff-passes against Compose with **0 AA-aware
differing pixels** (`docs/evidence/day7/static-diff/README.md`), and the shape gallery
renders all 35 shapes, animated morphs and a clipped RN-content container
(`docs/evidence/day7/gallery/`). `Shape`, `MorphingShape` and `ShapeContainer` are
implemented on the SVG `PathCanvas` (ADR-002); animated morphs run on the UI thread.
Their iOS, a11y and RNTL boxes stay open, so the rows are not DONE yet.
`ShapeContainer` is **decorative-only** (ADR-017): the Day 7 `foreignObject` probe found
that the clipped RN subtree is not laid out, so touch, scrolling and accessibility
hit-testing do not work inside it (`U-32`, `docs/evidence/day7/foreign-object/`). It
requires `decorative` at the call site, warns in development on interactive children, and
hides the subtree from assistive technology. Interactive containers use `borderRadius`.

Day 9 note: the interaction primitives are implemented and diffed against Compose
Material3 1.5.0 in five scenes (`docs/evidence/day9/README.md`). All five are
**0 AA-aware differing pixels** (exact-zero is not the gate; 8-bit state-layer
compositing and clip AA leave ≤1/255 fills and edge pixels, explained in the
evidence). iOS elevation is an **approximation**, inspected side-by-side at
levels 0–12 (`docs/evidence/day9/ios/`), never a pixel match (ADR-019). The 48 dp
minimum is a `hitSlop` target, not a layout size (ADR-018); a render test proves
the visible 24 dp box does not grow. Haptics is an injectable adapter with a
no-op default, so the gallery has no visual demo. The iOS, a11y and DONE boxes
stay open for the Day 40–41 passes.

**Foundation evidence (Days 2–6):**

- **Color schemes & roles** — `docs/specs/tokens.json` (48 light + 48 dark roles, 91 palette
  roles); `packages/react-native-material-expressive/src/color/`; 432 MCU schemes / 20,736
  values and 108 Compose-mapped schemes / 5,184 values at **0 differences**; defaults 144/144
  exact. Evidence: `docs/evidence/day4/color/README.md`, commit `86e5dba`. The `diff` box stays
  open because only scene fills are screenshot-diffed (Day 3 gate); the scheme itself is
  value-golden verified.
- **Dynamic color** — Android `M3EDynamicColor` TurboModule; API 31 `tones` payload 96/96
  exact, unsupported fallback verified; API 34+ role resources are source-derived (`U-24`).
  Evidence: `docs/evidence/day4/color/README.md`, commit `86e5dba`.
- **Typography** — `docs/specs/typography.json` (30 roles); `src/typography/`; layout height
  exact for all 30 roles; matched-grid 30/30 inside the 0.05% AA gate, faithful 9/30 with
  `D-001`. Evidence: `docs/evidence/day5/typography/README.md`, commit `0122873`. The `diff`
  box stays open until ADR-010 is approved; no text is called pixel-perfect.
- **Shape tokens** — `docs/specs/tokens.json` (`ShapeTokens` 24, `ShapeKeyTokens` 15);
  generated `shapes` object with all 15 shape values; corner-radius scale evidence in
  `docs/evidence/day2/m3/shape-corner-radius-scale.txt`; extractor drift gate in CI. Commit
  `191a3a1`.

## Actions

| Component | Authority / source | spec | impl | diff | motion | iOS | a11y | tests | docs | gallery | DONE |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Button (5 types × XS–XL × round/square × toggle) | `Button.kt`, `ButtonDefaults`, `Button*Tokens`, `ToggleButton.kt` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| IconButton (types × sizes × widths × toggle) | `IconButton.kt`, `IconButtonDefaults.kt`, `*IconButtonTokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| ButtonGroup (standard + connected) | `ButtonGroup.kt`, `ButtonGroupSmallTokens`, `ConnectedButtonGroupSmallTokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| SplitButton | `SplitButton.kt`, `SplitButton*Tokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| FAB (S/R/M/L) | `FloatingActionButton.kt`, `Fab*Tokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| ExtendedFAB | `FloatingActionButton.kt`, `ExtendedFab*Tokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| ToggleFAB | `FloatingActionButtonMenu.kt` (`ToggleFloatingActionButton`) | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| FAB Menu | `FloatingActionButtonMenu.kt`, `FabMenuBaselineTokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| ToggleButton (legacy / migration) | `ToggleButton.kt`; m3 segmented/button-group guidance | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| SegmentedButton (legacy, deprecated by m3) | `SegmentedButton.kt`, `*SegmentedButtonTokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |

## Selection & input

| Component | Authority / source | spec | impl | diff | motion | iOS | a11y | tests | docs | gallery | DONE |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Checkbox + tri-state | `Checkbox.kt`, `CheckboxTokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| RadioButton | `RadioButton.kt`, `RadioButtonTokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| Switch | `Switch.kt`, `SwitchTokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| Chips (assist/filter/input/suggestion, elevated) | `Chip.kt`, `ChipShapes`, `*ChipTokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| Slider (standard/centered, XS–XL) | `Slider.kt`, `SliderTokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| RangeSlider | `Slider.kt`, `RangeSlider` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| VerticalSlider | `Slider.kt`, `VerticalSlider`, `VerticalDragHandle` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| TextField (filled/outlined) | `TextField.kt`, `OutlinedTextField.kt`, `TextFieldDefaults.kt` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| SecureTextField / OutlinedSecureTextField | `SecureTextField.kt` (missing from §8) | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| Search (SearchBar, SearchView, TopSearchBar, docked/expanded) | `SearchBar.kt`, `SearchViewTokens`; m3 search | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| DatePicker / DateRangePicker (modal, docked, input) | `DatePicker.kt`, `DateRangePicker.kt`, `DateInput.kt` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| TimePicker / TimeInput / **TimeScroll** | `TimePicker.kt`, `TimePickerDialog.kt`; m3 time-pickers | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| ScrollField (new Expressive component) | `ScrollField.kt`; m3 scroll-fields | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| PullToRefresh | `pulltorefresh/PullToRefresh.kt` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |

## Containment

| Component | Authority / source | spec | impl | diff | motion | iOS | a11y | tests | docs | gallery | DONE |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Card (elevated/filled/outlined, clickable) | `Card.kt`, `*CardTokens` | [ ] | [ ] | [ ] | — | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| Carousel (multi-browse, uncontained, hero, center-hero) | `Carousel.kt`, `CarouselState.kt`, `CarouselItemScope.kt` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| Dialog (basic, alert, full-screen) | `AlertDialog.kt`, `BasicEdgeToEdgeDialog.kt`, `DialogTokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| BottomSheet (standard + modal) | `BottomSheet.kt`, `ModalBottomSheet.kt`, `BottomSheetScaffold.kt` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| SideSheet | **m3 spec only; no public Compose 1.5.0 API** | [ ] | [ ] | n/a spec | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| ListItem (standard) | `ListItem.kt`, `ListItemDefaults.kt`, `ListTokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| SegmentedListItem | `ListItem.kt` (`SegmentedListItem`), `ListTokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| SwipeToDismissBox | `SwipeToDismissBox.kt` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| Divider / HorizontalDivider / VerticalDivider | `Divider.kt`, `DividerTokens` | [ ] | [ ] | [ ] | — | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| Menu (dropdown, exposed, nested/grouped) | `Menu.kt`, `MenuDefaults.kt`, `DropdownMenuGroup`; m3 menus | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| Tooltip (plain/rich) | `Tooltip.kt`, `BasicTooltip.kt`, `*TooltipTokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| Badge / BadgedBox | `Badge.kt`, `BadgeTokens` | [ ] | [ ] | [ ] | — | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| Snackbar + host/queue | `Snackbar.kt`, `SnackbarHost.kt`, `SnackbarTokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| Banner (Paper parity extra) | **No Compose M3 API**; Paper v6 alpha.4 as cross-check | [ ] | [ ] | n/a spec | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

## Navigation & structure

| Component | Authority / source | spec | impl | diff | motion | iOS | a11y | tests | docs | gallery | DONE |
|---|---|---|---|---|---|---|---|---|---|---|---|
| NavigationBar | `NavigationBar.kt`, `NavigationItem.kt`, `NavigationBar*Tokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| ShortNavigationBar (+ item) | `ShortNavigationBar.kt` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| NavigationRail (collapsed/expanded) | `NavigationRail.kt`, `NavigationRail*Tokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| WideNavigationRail / ModalWideNavigationRail | `WideNavigationRail.kt`, `WideNavigationRailState.kt` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| NavigationDrawer (standard/modal/permanent) | `NavigationDrawer.kt`, `NavigationDrawerTokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| Tabs (primary/secondary, scrollable) | `Tab.kt`, `TabRow.kt`, `*NavigationTabTokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| Top app bars (small/center/medium/large/flexible/search) | `AppBar.kt`, `AppBarColumn/Row.kt`, `AppBarWithSearch`; `*AppBar*Tokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| BottomAppBar / FlexibleBottomAppBar (docked toolbar) | `AppBar.kt`, `DockedToolbarTokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| FloatingToolbar (horizontal/vertical) | `FloatingToolbar.kt`, `FloatingToolbarTokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| Scaffold | `Scaffold.kt` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| NavigationSuiteScaffold | `material3-adaptive-navigation-suite` 1.5.0 | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| Adaptive scaffolds (list-detail, supporting pane) | `material3.adaptive` 1.3.0 | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |

## Feedback

| Component | Authority / source | spec | impl | diff | motion | iOS | a11y | tests | docs | gallery | DONE |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Linear progress (determinate/indeterminate, flat + wavy) | `ProgressIndicator.kt`, `WavyProgressIndicator.kt`, `Linear*Tokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| Circular progress (determinate/indeterminate, flat + wavy) | `ProgressIndicator.kt`, `WavyProgressIndicator.kt`, `Circular*Tokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| LoadingIndicator (contained/uncontained) | `LoadingIndicator.kt`, `LoadingIndicatorTokens` | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |

## Parity extras (Paper compatibility)

| Component | Authority / source | spec | impl | diff | motion | iOS | a11y | tests | docs | gallery | DONE |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Avatar | **No Compose M3 API**; Paper v6 cross-check | [ ] | [ ] | n/a spec | — | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Portal API | Internal `OverlayHost`; Paper API shape | [ ] | [ ] | — | — | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| DataTable (expressive styling) | **No Compose M3 API**; Paper v6 cross-check | [ ] | [ ] | n/a spec | — | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| HelperText | TextField supporting-text semantics; no distinct Compose component | [ ] | [ ] | [ ] | — | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Drawer sections | M3 Drawer + Paper section API shape | [ ] | [ ] | [ ] | — | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| Accordion / expandable list | **No Compose M3 API**; Paper v6 cross-check | [ ] | [ ] | n/a spec | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Appbar legacy wrappers | Maps to TopAppBar / AppBar API | [ ] | [ ] | [ ] | [ ] | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| Text variants | Maps to `Text` + typography scale | [ ] | [ ] | [ ] | — | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |
| Surface elevation API | Maps to `Surface` | [ ] | [ ] | [ ] | — | [ ] REF | [ ] | [ ] | [ ] | [ ] | [ ] |

## Integrations

| Integration | Authority / source | spec | impl | diff | motion | iOS | a11y | tests | docs | gallery | DONE |
|---|---|---|---|---|---|---|---|---|---|---|---|
| React Navigation adapters (tabs, stack header, drawer) | React Navigation 7.x docs; M3 components | [ ] | [ ] | — | — | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Expo Router example | Expo SDK 58 docs | [ ] | [ ] | — | — | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Paper theme bridge (`fromPaperTheme`) | Paper v6 theme types; M3 role mapping | [ ] | [ ] | — | — | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

---

## Scope deltas vs §8 (Day 0 reconciliation)

These are **in Compose Material3 1.5.0 and/or the m3 catalog but missing or misnamed in §8**. All are added to 1.0 scope unless marked deferred.

| Item | Disposition | Authority | Note |
|---|---|---|---|
| `ScrollField` | **Add** | `ScrollField.kt`; m3 scroll-fields (2026-11-17) | New Expressive component, 3 sizes, scroll + input, finite/looping. §8 omitted it. |
| `SecureTextField` / `OutlinedSecureTextField` | **Add** | `SecureTextField.kt` | Public 1.5.0 API. §8 only said “secure” under TextField. |
| `PullToRefreshBox` | **Add** | `pulltorefresh/PullToRefresh.kt` | Public 1.5.0 API; m3 recommends LoadingIndicator for pull-to-refresh. |
| `ShortNavigationBar` (+ item) | **Add** | `ShortNavigationBar.kt` | Expressive nav variant; §8 only said “NavigationBar”. |
| `WideNavigationRail`, `ModalWideNavigationRail` | **Add** | `WideNavigationRail.kt` | Expressive/adaptive rail; §8 only said “NavigationRail”. |
| `FlexibleBottomAppBar`, `BottomAppBarState` | **Add** | `AppBar.kt`; `DockedToolbarTokens` | This is the public implementation of the m3 **docked toolbar**. There is no `DockedToolbar` composable. |
| `AppBarWithSearch`, `AppBarColumn`, `AppBarRow` | **Add** | `AppBar.kt`, `AppBarColumn.kt`, `AppBarRow.kt` | New app-bar structure/search variants. |
| `TopSearchBar`, `DockedSearchBar`, `Expanded*SearchBar` | **Add** | `SearchBar.kt` | §8 said “search app bar” without the 1.5.0 API surface. |
| `TimeScroll`, `VibrantTimePickerDialog` | **Add** | `TimePicker.kt`, `TimePickerDialog.kt` | The “expressive scroll variant” is `TimeScroll`; vibrant dialog is a distinct public API. |
| `SegmentedListItem` | **Add** | `ListItem.kt` | Expressive/segmented list item. |
| `DropdownMenuGroup` | **Add** | `Menu.kt` | Expressive grouped menus; nested/submenu behavior must be verified from sources. |
| `SwipeToDismissBox` | **Add** | `SwipeToDismissBox.kt` | Public 1.5.0 API; §8 mentioned swipeable ListItem only. |
| `VerticalSlider`, `VerticalDragHandle` | **Add** | `Slider.kt`, `DragHandle.kt` | §8 said vertical slider; drag handle is a public primitive. |
| `Scrim`, `Label`, `BadgedBox`, `SnackbarHost` | **Add** | Public 1.5.0 primitives | Support surfaces for overlays/feedback. |
| `SideSheet` | **Keep as spec-verified** | m3 side-sheets spec only | No public Compose 1.5.0 implementation. Verified against measured m3 spec + self-regression baseline (ADR-005). |
| `SegmentedButton` | **Keep as legacy** | `SegmentedButton.kt`; m3 says deprecated in Expressive | m3: use connected button group. Keep for Paper migration; do not position as primary API. |
| `ToggleButton` (legacy) | **Keep as legacy** | `ToggleButton.kt` | Migration/parity surface. |
| Docked toolbar | **Map to `FlexibleBottomAppBar`** | `AppBar.kt`, `DockedToolbarTokens` | Do not invent a `DockedToolbar` API that Compose does not have. |
| Full-screen carousel | **Variant, not separate component** | `Carousel.kt` | Horizontal uncontained with full-screen page size; verify exact defaults Day 30. |
| `ReorderListTokens`, `RevealListTokens`, `ExpandedListTokens` | **Defer** | Token files only | No public 1.5.0 component found; track in BACKLOG until API exists. |
| XR components (`nav-bar`, `nav-rail`, XR app bars/dialogs/toolbars) | **Defer** | m3 foundations/xr | Out of 1.0 scope; not in §8. BACKLOG. |
| Banner, Avatar, DataTable, Accordion | **Keep as Paper parity extras** | Paper only; no Compose reference | Spec-verified against m3/Paper measurements + self-regression baseline; never Compose-verified (ADR-005). |

## Matrix counts (Day 7 closed)

- Foundations/primitives rows: 19
- Component rows: 53 (actions 10, selection/input 14, containment 14, navigation 12, feedback 3)
- Parity/integration rows: 12
- Total tracked rows: **84**
- m3 catalog families reconciled: **37** (excluding XR/index pages)
- Compose 1.5.0 public functions inventoried: **194** (see `docs/research/DAY0_SOURCES.md`)

**Status (Day 7, closed 2026-11-27):** Days 0–6 are complete for the foundations recorded
above. The Day 7 renderer exit is met: ADR-002/ADR-003 are final; `PathCanvas`, `Shape`,
`MorphingShape` and `ShapeContainer` are implemented; the static 35-shape diff has **0
AA-aware differing pixels**; the gallery renders all 35 shapes, animated morphs and clipped
RN children. The three primitive rows are **not DONE**: `Shape` is missing tests/iOS/a11y,
`MorphingShape` is missing animated-diff/iOS/a11y/tests, and `ShapeContainer` is missing
spec/iOS/a11y/tests. `ShapeContainer` is **decorative-only** under ADR-017: the
`foreignObject` subtree has no touch, scrolling or usable accessibility bounds, so it
requires `decorative` and hides its children from assistive technology. Interactive
containers use `borderRadius`; the native mask fallback is post-1.0 backlog. `U-29`
(physical-device frame times) is **resolved**: on the Xiaomi 2201116SI at 60 Hz, Skia
holds 16.71 ms in all three spike modes; SVG averages 17.22/18.20/17.42 ms and drops
frames with ten concurrent morphs (max 50.05 ms). ADR-002 is unchanged, but the 60 fps
claim is scoped to single morphs and the clipped-gradient scene. Card, table and
install/launch commands: `docs/evidence/day7/frame-times.md`. `M3Provider`/theme, `Surface`, `Text`, `Icon`, motion, interaction, and overlay
primitives remain open (Days 8–10); see `docs/progress/PROGRESS.md` for the current
session.
