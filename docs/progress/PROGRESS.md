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

---

## Day 1 | 2026-11-25 | Monorepo, tooling, ADRs, competitor teardown, Android + iOS boot

**Done**

- Closed the four §2 checkpoints: package `react-native-material-expressive` (npm 404 on Day 0), MIT for project code, `github.com/nasyx-rakeeb/react-native-material-expressive` with GitHub Pages docs first, and a manual 1.0.0 publish with Nasyx's 2FA followed by OIDC trusted publishing (ADR-008).
- Installed pnpm **12.23.0** through Corepack and pinned it in `packageManager`; Node 24.22.3, TypeScript 6.0.3.
- Built the pnpm + Turborepo monorepo: `react-native-material-expressive` (builder-bob 0.44.1 → ESM/CJS/declarations), `apps/gallery` (Expo SDK 58.0.26), strict TS, ESLint 9 flat config, Prettier 3.10.1, Changesets, Jest 30 + jest-expo.
- Pinned the Expo SDK 58 native pair exactly (RN 0.88.1, React 19.3.0, Reanimated 4.7.1, Worklets 0.13.0) and added pnpm overrides so transitive dependencies cannot introduce a second copy. New Architecture + Hermes on.
- Gallery boot-check screen imports `PACKAGE_NAME` from the workspace library and prints the platform/runtime line. Expo Go is sufficient until the Day 4 dev client.
- CI workflow on Node 24 runs `pnpm install --frozen-lockfile`, `format:check`, `lint`, `typecheck`, `test`, `build`. Publish workflow is inert until 1.0.0 exists (OIDC cannot be configured before the first publish).
- ADRs: **001** targets/floors accepted; **002** rendering strategy held open for the Day 7 Skia-vs-SVG spike; **003** peer draft (`react >=19`, `react-native >=0.81`, Reanimated >=4, Worklets >=0.7), final on Day 7; **005** spec-verified gate condition; **006** generated expressive dark scheme condition; **007** ButtonGroup primary / SegmentedButton legacy; **008** npm publishing.
- Competitor teardown of `@expressive-ui/native@0.3.0` shipped in `COMPETITOR_MATRIX.md` §3.1: 60 component functions, 35 static `MaterialShapes` paths, generated light/dark MCU scheme, 6,516 native + 3,762 core LOC, **no Reanimated** (JS-driver morphs), 171 a11y references, 172 weekly downloads, no repository field, no tests. Positioning unchanged; Day 0 over-claims corrected.
- Android: API 31 x86_64 emulator booted, Expo Go installed, bundle served, boot-check screenshot captured.
- iOS: Xcode 26.5 shipped with **no runtime**. `xcodebuild -downloadPlatform iOS` hung at “Preparing to download…” (MobileAsset). Worked around it with the direct universal asset (10.6 GB, SHA-256 verified), `aa patch` asset extraction (not `aa extract`), and `xcrun simctl runtime add` on the cryptex DMG. Runtime `iOS 26.5 (23F77)` is `Verified` with `x86_64` + `arm64`. iPhone 17 Pro booted; first boot took 11m27s to build the dyld shared cache. Expo Go 58.0.7 + gallery bundle verified.

**Evidence**

- Commits: `81c235f` (scaffold + CI), `6becb51` (gallery), `66e81c4` (Day 1 docs/ADRs/teardown), `138c191` (Day 1 sources + boot evidence).
- Clean clone at `66e81c4`: `pnpm install --frozen-lockfile` 4.4 s, `pnpm build` 8.381 s, `pnpm test` 1 suite / 8 tests passed.
- CI: run [`45636586977`](https://github.com/nasyx-rakeeb/react-native-material-expressive/actions/runs/45636586977) on `138c191` — **success**, 32 s, all steps green.
- Screenshots: `docs/evidence/day1/gallery-android.png`, `docs/evidence/day1/gallery-ios.png`.
- Pins, URLs, hashes, install commands, and limits: `docs/research/DAY1_SOURCES.md`.

**Deviations**

- iOS runtime had to be installed outside Xcode's downloader because `xcodebuild -downloadPlatform iOS` never started transferring. This is an environment workaround, not a library deviation; it is documented in `DAY1_SOURCES.md` §5.
- CocoaPods is not installed. It is not needed for the Expo Go boot path; the Day 4 dynamic-color native module will require it (and a dev client), and that will be installed then.
- Day 1 overran wall-clock time by roughly one hour: the 10.6 GB runtime download and the 11m27s first boot. No exit criterion was skipped.

**Risks**

- The iOS reference harness must stay reference-only (ADR-004); do not treat iOS screenshots as the fidelity gate.
- Expo Go is a shared runtime; add the dev client before introducing any native module or the gallery will silently fall back to unsupported behaviour.
- The MobileAsset install path is Xcode-version-specific. Re-verify it when Xcode or the runtime version changes.

**Next step**

- Day 2: source-of-truth pipeline (sources JARs → `docs/specs/*.json` → generated TS, drift check in CI).
