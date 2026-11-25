# Competitor Matrix — Day 0 snapshot (2026-11-25)

**Scope:** React Native Paper v6 alpha (primary competitor), other RN M3E efforts found on npm/GitHub, and the relevant Google reference surface (Compose Material3 1.5.0 / m3.material.io).

**Evidence sources** (all checked 2026-11-25):

- npm registry: `react-native-paper` dist-tags `latest=5.15.5`, `alpha=6.0.0-alpha.4` (published 2026-11-23T14:58Z).
- GitHub releases: `v6.0.0-alpha.4` (2026-11-23), `v6.0.0-alpha.3` (2026-11-16), `v6.0.0-alpha.2` (2026-11-09).
- GitHub issue `callstack/react-native-paper#5150` — “Paper 6.0.0: merge order, ground rules and decisions”, updated 2026-11-24.
- Paper source tarball `v6.0.0-alpha.4` (47,565 LOC in `src`), inspected locally.
- Compose Material3 1.5.0 sources JAR + m3.material.io sitemap/catalog (see `docs/research/DAY0_SOURCES.md`).
- npm search + GitHub search for RN M3E libraries.

**Status vocabulary:** `FULL` = same component/feature present and positioned as M3 Expressive; `PARTIAL` = present but missing key Expressive behavior; `LEGACY` = present but not the Expressive design; `NO` = absent. “Expressive status” is about behavior, not just Material 3 baseline colors.

---

## 1. Paper v6 alpha.4 — what actually ships

Paper `6.0.0-alpha.4` is **Phase 2 (breaking changes)** of a gate-based release plan. There is **no target date**. The plan explicitly says:

> “New components ship in 6.1 or later, with no exceptions in 6.0.” — issue #5150, ground rule 2
> “New components and other additions wait on the 6.1.0 milestone.” — issue #5150

Important decisions from #5150:

| Decision | Effect |
|---|---|
| D2 | `NavigationBar` (#5006, replaces `BottomNavigation`) is planned for 6.0 but **still unchecked** in the merge list. Alpha.4 still exports `BottomNavigation` only. |
| D3 | Progress indicators stay as `ProgressBar`/`ActivityIndicator` with **no `react-native-svg`**; “new indicators come later”. No wavy/expressive progress in 6.0. |
| D6 | Menu adopts `surfaceContainerLow`; dynamic-theme fix; container prop waits for 6.1. No submenu/grouped-menu work in 6.0. |
| D7 | Appbar keeps its compound API; Expressive variants as props. Bottom app bar stays deprecated until **Toolbar lands in 6.1**. |
| D8 | **Toolbar (#5043) and ConnectedButtonGroup (#5074) are 6.1**. `SegmentedButtons` is deprecated in 6.1 and removed in 7.0. |
| D13 | `useReduceMotion` exported; `theme.animation` removed. |
| D15 | **Sliders are 6.1** (#5000, #5132). |

### 1.1 Component coverage vs the m3 catalog (37 families)

| m3 family | Paper v6 alpha.4 | Expressive status | Evidence |
|---|---|---|---|
| App bars | `Appbar` (small/medium/large/flexible modes) | **PARTIAL** | alpha.4 release notes; `src/components/Appbar` |
| Badges | `Badge` | FULL (visual baseline) | source |
| Bottom sheets | **NO** (Modal/Dialog/Portal only) | NO | source components list |
| Button groups | **NO** (ConnectedButtonGroup = 6.1) | NO | #5150 D8 |
| Buttons | `Button` | **FULL** (sizes, shape, toggle, press morph, loading) | alpha.2 + source `Button.tsx` |
| Cards | `Card` | Baseline | source |
| Carousel | **NO** | NO | source |
| Checkbox | `Checkbox` | **PARTIAL/FULL** (48dp, state layer, focus ring; no shape morph) | alpha.2/alpha.4 notes |
| Chips | `Chip` | **LEGACY** (no `ChipShapes` morph, no Expressive sizes) | source `Chip.tsx` |
| Date pickers | **NO** | NO | source |
| Dialogs | `Dialog` | Baseline; prop-based API in alpha.4 | alpha.4 notes |
| Divider | `Divider` | Baseline | source |
| Extended FAB | `FAB.Extended` | Baseline/partial | source |
| FAB menu | `FAB.Menu` | **FULL** (present in alpha.4; known a11y/back bugs) | alpha.4 “Known issues” |
| FAB | `FAB` | Baseline + variant rename | alpha.4 |
| Icon buttons | `IconButton` | **FULL** (XS–XL, round/square, press morph, toggle colors) | alpha.4 |
| Lists | `List`, `List.Accordion` | **LEGACY** (no expressive/segmented ListItem) | source |
| Loading indicator | **NO** (`ActivityIndicator` is legacy) | NO | #5150 D3 |
| Menus | `Menu` | **PARTIAL** (surface role only; no nested/submenu/grouped) | #5150 D6 |
| Navigation bar | `BottomNavigation` only | **LEGACY**; `NavigationBar` PR unmerged | #5150 D2 + source |
| Navigation drawer | `Drawer` | Baseline | source |
| Navigation rail | **NO** | NO | source |
| Progress indicators | `ProgressBar`, `ActivityIndicator` | **LEGACY** (flat only; no wavy) | #5150 D3 |
| Radio button | `RadioButton` | Baseline | source |
| Scroll fields | **NO** | NO | source |
| Search | `Searchbar` | **LEGACY** (no SearchView/search app bar) | source |
| Segmented buttons | `SegmentedButtons` | **LEGACY** (m3 deprecates in Expressive; Paper deprecates 6.1) | #5150 D8 |
| Side sheets | **NO** | NO | source |
| Sliders | **NO** (6.1) | NO | #5150 D15 |
| Snackbar | `Snackbar` | Baseline | source |
| Split button | **NO** | NO | source |
| Switch | `Switch` | **PARTIAL/FULL** (48dp, icon, spring; alpha.4) | alpha.4 notes + `Switch.tsx` |
| Tabs | **NO** | NO | source |
| Text fields | `TextInput` | **PARTIAL/FULL** (state colors, RTL, supporting text; label animation baseline) | alpha.4 notes |
| Time pickers | **NO** | NO | source |
| Toolbars | **NO** (6.1) | NO | #5150 D7/D8 |
| Tooltips | `Tooltip` | Baseline | source |

**Commodity breadth:** Paper ships ~34 public component families (including Paper-only Avatar, Banner, DataTable, Portal). It is a serious parity floor. **Expressive breadth:** it is deliberately narrow in 6.0.

### 1.2 Paper-only surfaces (no Compose reference)

`Avatar`, `Banner`, `DataTable`, `HelperText`, `Portal`, `List.Accordion`, `Drawer.Section`, legacy `Appbar.*`, `Text` variants, `Surface` elevation API. These are migration surfaces, not Google reference components. They cannot be pixel-diffed against Compose. See ADR-005.

---

## 2. Signature-set gate (the Day 0 stop condition)

The plan’s signature set is the 14 items in §4.3. Scoring: `FULL=1`, `PARTIAL=0.5`, `NO=0`.

| # | Signature item | Paper alpha.4 | Score | Evidence |
|---|---|---|---|---|
| 1 | Shape-morphing buttons | Full (Button + IconButton) | 1.0 | alpha.2/alpha.4; `Button.tsx`, `IconButton.tsx` |
| 2 | Shape-morphing chips | No (`Chip` has no `ChipShapes`/morph) | 0 | `Chip.tsx` |
| 3 | Button groups with neighbor “bump” | No (ConnectedButtonGroup = 6.1) | 0 | #5150 D8 |
| 4 | Split button | No | 0 | source |
| 5 | FAB menu | Full (known bugs) | 1.0 | alpha.4; `FAB/Menu.tsx` |
| 6 | Wavy progress | No | 0 | #5150 D3 |
| 7 | Loading indicator | No | 0 | #5150 D3 |
| 8 | Floating/docked toolbars | No (6.1) | 0 | #5150 D7/D8 |
| 9 | Expressive sliders | No (6.1; no slider at all) | 0 | #5150 D15 |
| 10 | Carousels | No | 0 | source |
| 11 | Expressive lists (segmented/expressive) | No | 0 | source |
| 12 | Expressive menus (nested/grouped) | Partial (surface role only) | 0.5 | #5150 D6 |
| 13 | Time picker scroll variant | No | 0 | source |
| 14 | Adaptive scaffolds | No | 0 | source |

**Score: 2.5 / 14 = 17.9%.**

Even if every partial is counted as full (Button, FAB menu, menus, lists), the maximum is 4/14 = **28.6%**. The 60% gate is **not triggered**. Proceed to Day 1.

**Caveat:** Paper is ahead on commodity parity and migration ergonomics, not on Expressive breadth. It can still beat us on “drop-in replacement” if we do not execute the parity floor (§4.1, Day 38).

---

## 3. Other RN efforts found (UNVERIFIED-2 resolved)

| Package / repo | Version / date | Scope | Maturity signals | Threat |
|---|---|---|---|---|
| `@expressive-ui/native` | **0.3.0**, published 2026-11-24 | React Native/Expo renderer for ExpressiveUI; M3E components: Button, Chips, FAB, Carousel, Progress, LoadingIndicator, SplitButton, ButtonGroup, Toolbar, FabMenu, Navigation, Pickers, RangeSlider, Menu, Sheets, Snackbar, Search, Select/Autocomplete, etc. | 6,516 LOC `src`; 153 package files; MIT; peer `react-native-svg`; no Reanimated (21 files use RN `Animated`); no `MaterialShapes`/`RoundedPolygon`; no `repository` field; no tests in package; 0.x API explicitly unstable; RN 0.86.3 dev target | **Direct, broad, early.** Watch closely. No evidence of Compose diff verification. |
| `react-native-platform-components` | 1.12.0, 2026-11-24 | Native platform widgets (TextField, DatePicker, ContextMenu, etc.), includes M3 Expressive on Android | Not a design-system library; platform components only | Adjacent, not a full substitute |
| `kamp0010/react-native-m3` | repo, last push 2026-02-06 | “Premium RN M3 Expressive component library built with Nitro Modules” | 2 stars, no npm release found, MIT | Low today; verify again Day 53 |
| `@isoline-ui/react-native` | 2.1.3, 2026-11-24 | “Expressive shared UI with platform-aware interaction”, NativeWind-based | Not M3-specific; design system | Adjacent |
| `flaut-org/react-md3e` | repo, 2026-11-25 | Server-first **React (web)** M3/M3E components | Not React Native | No |

**No RN library found with:** a published Compose-reference diff suite, the full 35 `MaterialShapes` + `Morph` port, or full Expressive component coverage verified against 1.5.0. That remains the moat. But the plan’s absolute statement “No RN library with shape morphing / wavy progress / loading indicator / split button / button groups / FAB menu / toolbars was found” is **no longer true**: `@expressive-ui/native` exposes most of those names. We must compete on fidelity and production readiness, not claim absence.

---

## 4. What Paper’s alpha tells us to copy (and avoid)

**Copy (developer expectations):**
- `reduceMotion` prop + `useReduceMotion()`.
- 48dp hit targets via `hitSlop` without visual growth.
- Focus ring on every interactive component.
- Prop-based component APIs and no reading visual values out of `style`.
- Deep theme merge (PaperProvider).
- Explicit migration guide + codemod-friendly naming.

**Avoid (their known alpha.4 issues; opportunities):**
- Dialog empty gap; web hover layer 0.05 vs spec 0.08 (our state token is 0.08, verified in `StateTokens.kt`).
- TextInput supporting-text RTL.
- Theme generator docs emitting 5.x scheme.
- Appbar title overlap at large font sizes.
- Button a11y props not reaching the pressable; loading not announced busy.
- FAB.Menu Android back not closing; collapsed items still keyboard stops.
- Menu screen-reader focus stays on anchor; items last in reading order.
- Tooltip wrapper is its own focus stop.

**Native implementation caveat:** Paper’s Button/IconButton shape morph uses CSS transition style props (`transitionDuration`, `transitionTimingFunction`) rather than Reanimated worklets. We have not verified native behavior. Do not cite Paper’s morph as proof of native feasibility; our Reanimated path is the differentiator.

---

## 5. Port cross-check (not a competitor, not truth)

The playbook asks to reconcile against Flutter's M3E work. The leading port is `material_3_expressive` **1.2.3** (2026-11-18, MIT, ~65 stars, last push 2026-11-23) with **39 component directories**, including `side_sheets`, `toolbars`, `split_buttons`, `button_group`, `carousel`, `loading_indicator`, `progress_indicators`, `sliders`, and Material-shape morphs. It is a third-party port, so it is a cross-check only; it is not citable as spec. Its `side_sheets` module is nonetheless evidence that m3-spec-only surfaces can be implemented without a Compose reference (relevant to ADR-005). Details: `docs/research/DAY0_SOURCES.md` §10.

## 6. Competitive conclusions

1. **Gate passed.** Paper covers 17.9% of the signature set (max 28.6% with generous partials), far below 60%.
2. **Paper’s real advantage is breadth of commodity components and migration familiarity**, not Expressive components. Parity floor remains mandatory.
3. **The fidelity moat is still unclaimed.** No RN competitor publishes Compose-reference diffs.
4. **The new competitor is `@expressive-ui/native`**, not Paper, for breadth. It is 0.x, RN `Animated`-based, no shape-morph engine, no diff evidence. Monitor weekly; re-run this matrix Day 53.
5. **Segmented buttons are legacy.** m3 explicitly deprecates them in favor of connected button groups. Our public API should lead with `ButtonGroup`, keep `SegmentedButton` only for migration.
