# Progress Log

Append-only. One entry per work session. Format: `Day N | date | what was done | evidence | next step`.
A day closes only when its exit criteria are met with evidence. Slippage is recorded here, not hidden.

---

## Day 0 | 2026-11-25 | Research, competitor/component matrices, gate decision. No product code.

**Done**

- Verified environment (Node 24.22.3, git 2.50.1, JDK 17.0.20.1, adb 37.0.1/platform-tools, Xcode 26.5). `pnpm` is **not installed**.
- Confirmed Compose Material3 **1.5.0 stable** (2026-11-18) as the fidelity baseline; downloaded and hashed the sources JARs (material3, material3-ripple, graphics-shapes). Inventoried **271 `.kt` files**, **194 public functions**, **120 token files**, **35 `MaterialShapes`**.
- Verified the motion table from source: standard 700/0.9 default, 1400/0.9 fast, 300/0.9 slow; expressive 380/0.8 default, 800/0.6 fast, 200/0.8 slow; effects 1600/3800/800 @ 1.0.
- Found and documented the plan's main factual gaps: only `expressiveLightColorScheme()` exists (no expressive dark scheme); `MaterialExpressiveTheme` still passes standard `Typography()` with a TODO; segmented buttons are deprecated by m3 in favour of connected button groups; there is no `DockedToolbar` composable (`FlexibleBottomAppBar` + `DockedToolbarTokens` is the implementation).
- Reconciled §8 against Compose 1.5.0 + the m3 catalog (37 families). Added `ScrollField`, `SecureTextField`/`OutlinedSecureTextField`, `PullToRefreshBox`, `ShortNavigationBar`, `WideNavigationRail`/`ModalWideNavigationRail`, `FlexibleBottomAppBar`, `AppBarWithSearch`, `TopSearchBar`/`DockedSearchBar`/`Expanded*SearchBar`, `TimeScroll`, `SegmentedListItem`, `DropdownMenuGroup`, `SwipeToDismissBox`, `VerticalSlider`/`VerticalDragHandle`.
- Paper competitor audit: `6.0.0-alpha.4` (2026-11-23), 34 component families, source inspected. Signature-set score **2.5/14 = 17.9%** (max 28.6% counting partials as full). Paper's #5150 confirms new components (Toolbar, ConnectedButtonGroup, Slider) ship in **6.1**, NavigationBar is still unmerged, progress stays flat.
- Competitor discovery: **`@expressive-ui/native@0.3.0`** (2026-11-24, MIT) exposes most signature components, but is 0.x, RN-`Animated`-based, has no MaterialShapes/Morph, no repository field, no fidelity evidence. Also noted `react-native-platform-components@1.12.0`, `kamp0010/react-native-m3`, `@isoline-ui/react-native`.
- iOS addendum: CMP stable `material3:1.9.0` lacks 8 signature components; **CMP 1.13.0-rc01** has all of them and shares **235/245 (95.9%)** byte-identical `.kt` files with AndroidX 1.5.0. 10 files differ and must be inspect/baseline only. ADR-004.
- Version matrix: Expo SDK 58 pins RN 0.88.0-rc.3 + Reanimated 4.7.0 + Worklets 0.13.0; latest standalone Reanimated 4.8.0/Worklets 0.14.0 supports RN 0.87–0.89; `react-native-skia@3.13.0` (2026-11-25).
- Fonts/licensing: Material Symbols Outlined variable TTF 10,744,832 B (Apache-2.0); Roboto Flex variable TTF 1,787,292 B (OFL-1.1). Subsetting required (U-14).
- npm name check: `react-native-material-expressive`, `react-native-m3e`, `react-native-m3-expressive`, `m3e`, `@m3e/react-native`, `@material-expressive/react-native` all return 404 (available) on 2026-11-25.

**Evidence**

- `docs/research/DAY0_SOURCES.md` — every URL, version, sha256, source line, and limitation.
- `docs/research/COMPOSE_M3_1.5.0_INVENTORY.md` — 194 public function names, 120 token files, counts.
- `docs/research/DAY0_FINDINGS.md` — 13 verified facts, 12 plan risks, gate result.
- `docs/COMPONENT_MATRIX.md` — 84 tracked rows, scope deltas vs §8, all boxes unticked.
- `docs/COMPETITOR_MATRIX.md` — Paper per-family table, signature scoring, other RN libraries.
- `docs/DECISIONS.md` — ADR-000, ADR-004, ADR-005 (proposed), ADR-006 (proposed), ADR-007.
- `docs/UNVERIFIED.md` — U-1..U-6 resolved, U-7..U-18 open with owners.
- Raw downloads under `docs/research/raw/` (git-ignored; hashes in `DAY0_SOURCES.md`).
- Commit: `7b92983ac1ffa65e1048bef86a2dbd0bcef675d2` — `docs: add Day 0 research, competitor and component matrices` (no remote yet).

**Deviations**

- None. No implementation exists, so no visual deviations. `NCR` rows in the component matrix are scope exceptions pending ADR-005, not logged deviations.

**Risks**

- Scope is multi-quarter engineering, not 60 calendar days; day gates will slip. Do not cut verification.
- ADR-005 (no-Compose-reference components) and ADR-006 (no expressive dark scheme / no default emphasized type) need Nasyx sign-off; both affect public API or the release gate.
- CMP 1.13.0-rc01 is an RC; the iOS harness must be re-pinned at 1.13.0 stable.
- The pixel gate (≤0.05% + zero layout-edge delta on every static state) may be unattainable for text AA/shadows; measure determinism on Day 3 before treating failures as defects.
- `@expressive-ui/native` is broad and moving; re-run the competitor matrix Day 53.
- `pnpm` missing; Day 1 environment setup must install it before any workspace bootstrap.
- Paper v6 has no target date, so “at the moment of its stable release” is not a schedule we can anchor to.

**Next step**

- Await Nasyx's answers to the four Day 1 questions (package name, license, GitHub repo/docs hosting, npm publish access). No product code until answered.
