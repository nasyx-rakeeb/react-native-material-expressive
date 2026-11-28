# Progress Log

Append-only. One entry per work session. Format: `Day N | date | what was done | evidence | next step`.
A day closes only when its exit criteria are met with evidence and Nasyx approves it. Slippage is recorded here, not hidden.

**Status vocabulary:** `READY FOR APPROVAL` means the exit evidence is complete but Nasyx has not approved closure. `CLOSED` means Nasyx approved. `PASS` is not a day status.

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

---

## Day 2 | 2026-11-25 | Source-of-truth token pipeline and drift gate

**Done**

- Built `tools/extract-tokens`, a private workspace package that turns the pinned Compose sources JARs into committed specs and TypeScript. `fetch-sources.sh` downloads 8 artifacts from Google Maven and verifies every SHA-256 before extraction; the vendor directory is git-ignored and documented in `docs/research/DAY2_SOURCES.md`.
- Parser handles the machine-generated token subset (`object`/`class`, `val`/`inline val`/`const val`, getter form, multi-line constructor calls) and skips abstract declarations. Before writing anything, `main.ts` re-reads each declaration's source line and asserts it contains `val <Name>`, so continuation-line drift cannot silently mis-cite a token.
- Extracted `material3:1.5.0`: **120** token files, **2,671** declarations, all resolved (**2,641** scalar + **30** composite `TypographyTokens`), **0 raw**. Expanded the composites into **30** typography roles (baseline + emphasized) with per-field sources; **48** light + **48** dark color roles; **15** shape tokens and **9** corner sizes; **6** elevation levels; **16** durations, **10** cubic beziers, **6** standard + **6** expressive springs; **4** state-layer opacities.
- Emitted **104** component spec files plus `tokens.json`, `typography.json`, and `index.json` (107 JSON, 1.3 MB) under `docs/specs/`. Every record carries `token`, `value`, `unit`, `expression`, `source` (file:line), `sourceVersion`, and `sourceSha256`.
- Emitted `src/tokens/generated/{global,components,key-tokens,index}.ts` (Apache-2.0 banner + source hash). Library typecheck and `bob build` pass; declarations are produced.
- Added deterministic `--check` mode: it rebuilds in memory and compares exact bytes, reporting missing/changed/stale files. CI now runs `pnpm --filter @react-native-material-expressive/extract-tokens check` after install, so a spec or generated-TS drift fails the build.
- Added `EXPECTED` count pins (120 files / 2,671 declarations / 2,641 scalar / 30 composite / 104 component objects / 30 typography roles / 48 color roles) so a Compose bump cannot quietly change the surface; `resolved + raw === tokens` is asserted.
- Spot-checked **20/20** values against m3.material.io using a seeded, stratified plan (`m3e-day2-2026-11-25`), not hand-picked rows. Rendered page text is retained for audit.
- Follow-up after review: listed all 30 composite declarations in `docs/research/DAY2_COMPOSITES.md`, resolved their shared `lineHeightStyle` (`center`/`none`) and `platformStyle` (`includeFontPadding = false`) into `typography.json.defaults` and generated `typographyDefaults`, and added a 20-value behavior-critical spot-check. The behavior check covered 15 button size/padding values, 3 shapes, and 2 springs: **17/20 matched, 3 diverged** (Compose XS button paddings vs m3; `U-22`).
- Recorded **U-20**: m3's emphasized easing is a multi-segment Android `pathInterpolator`, while the CSS column is the standard cubic-bezier fallback. Compose wins; resolve the RN path on Day 8.

**Evidence**

- Commit: `191a3a1` (extractor, 107 specs, generated TS, evidence, CI drift gate, sources log).
- CI: run [`45648898485`](https://github.com/nasyx-rakeeb/react-native-material-expressive/actions/runs/45648898485) on `191a3a1` — **success**, 36 s, all steps green including **Verify generated specs**.
- Local gate on the committed tree: `format:check` clean, `lint` 3/3 packages, `typecheck` 4/4 tasks, `test` library 1 suite / 8 tests + extractor 4 suites / 10 tests, `build` 7 files ESM+CJS+types. `extract-tokens check` reports “specs and generated TypeScript are up to date”.
- Spot-check: `docs/evidence/day2/SPOTCHECK.md`, plan `docs/evidence/day2/spotcheck-plan.json`, m3 captures `docs/evidence/day2/m3/`.
- Pins, URLs, hashes, commands, limits: `docs/research/DAY2_SOURCES.md`.
- Day 2 exit gate: a spec exists for every token file, generated TS compiles, 20/20 spot-check matched. Follow-up closed the composite-count ambiguity and extended behavior-critical coverage; no unresolved declaration remains.
- Follow-up evidence: commit `556003d`; CI run [`45654081158`](https://github.com/nasyx-rakeeb/react-native-material-expressive/actions/runs/45654081158) — success, all steps green. Ledger: `docs/research/DAY2_COMPOSITES.md`. Behavior report: `docs/evidence/day2/SPOTCHECK-BEHAVIOR.md` (17/20 matched, 3 XS divergences → `U-22`).

**Deviations**

- Only `material3:1.5.0` contains `*Tokens.kt`; the other 7 JARs are vendored and hash-pinned because Day 2 scope names them and later days need them (ripple/focus ring, window size classes, adaptive scaffolds/navigation, `graphics-shapes`). No token facts were invented for artifacts that contain none.
- Component behavior specs (`*.behavior.md`) were not part of the Day 2 exit gate and were not generated. They remain a per-component requirement before that component's DONE day (PLAYBOOK §6 step 4); token extraction alone never ticks a component's `spec` cell.
- `m3.material.io` is a cross-check, not truth. The site's `--mio-theme-v2-*` CSS variables disagree with its printed token tables and are excluded as evidence; only the token tables (and, for the unprinted legacy easing row, the page's embedded resolved token JSON) were used.

**Risks**

- Generated files must never be hand-edited; CI will reject drift. Intentional changes go through the extractor and its `EXPECTED` pins.
- CI now depends on `dl.google.com` availability for the 8 small JARs. Hashes make the download safe to retry; a transient failure is not a spec failure.
- `material3:1.6.0-alpha01` exists and is not adopted. Any bump must be reviewed through an ADR, and the `EXPECTED` counts and spot-check must be rerun.
- The specs describe tokens, not Compose layout/state/spring-routing behavior. Fidelity still depends on the Day 3 diff harness and per-component behavior specs.

**Next step**

- Day 3: build `apps/reference-compose` (Compose M3 1.5.0), the scene manifest, the RN scene renderer, capture/compare scripts, and the HTML diff report. Freeze the emulator profile, bundle identical fonts, prove a trivial scene renders 0-diff 20×, and measure the pixel-noise floor before proposing any threshold change (ADR required).

---

## Day 3 | 2026-11-25 | Reference harness, frozen emulator, measured noise floor

**Status:** measurement complete; one decision pending. Same-harness determinism passes (20 repeats per app per boot, 3 cold boots, 0 diff px). The cross-stack trivial scene is **not byte-identical** because of text rasterization: 1,745 exact px (0.3957%), 4 AA-aware px (0.0009%). The scene, font, and threshold were not tuned; the decision is `U-23`.

**Done**

- Built `apps/reference-compose` against Compose Material3 **1.5.0** (AGP 9.1.0, Gradle 9.3.1, Kotlin Compose plugin 2.2.10, compileSdk 37, minSdk 31, targetSdk 36). It renders the same scene manifests as the RN gallery, hides the system bars, keeps the screen on, and exposes a broadcast rerender path.
- Built the RN gallery scene harness on Expo SDK 58.0.26 / RN 0.88.1: `m3egallery://scene?name=<id>` routing, the same rect/text renderer, a 20× rerender path, and a 320×24 dp readiness band. The font plugin copies the pinned TTF and OFL into Android assets.
- Made `tools/scenes/*.json` the single source of truth. `tools/scenes/build.mjs` validates the five Day 3 scenes and generates `tools/scenes/index.json` plus `apps/gallery/src/scenes.generated.ts`; `pnpm scenes:check` is now a CI step.
- Froze the Pixel 2 AVD `M3E_API31`: 1080×1920, 420 dpi (2.625×), API 31, no cutout, SwiftShader/ANGLE, font scale 1.0, locale en-US, animation scales 0, rotation 0, night mode off, immersive confirmation suppressed. Cold boot is `adb emu kill` + `-no-snapshot`. The Pixel 5 AVD was rejected because its cutout shifted the window to y=145 px.
- Bundled byte-identical Roboto Flex in both APKs. Source and both `assets/fonts/RobotoFlex.ttf` entries hash to `9b523f7d82593df0107173849ebb8c817471a1df4b4fb2c3cbf40cfd810c8281`. Both runtime probes applied the `wdth` axis (Compose 356 vs 402 px; RN 376.00 vs 411.43 dp); the pipeline fails on an orange band, a missing marker, or `ok=false`.
- Added `tools/pixel`: cold boot/freeze scripts, readiness polling, corner/window checks, scene crop, content-addressed captures, exact + pixelmatch AA-aware diff, per-region counts, shadow-presence measurement, layout-edge bboxes, profile verification, APK font verification, and generated HTML/Markdown/JSON reports.
- Ran **3 cold boots × 2 apps × (20 trivial repeats + 2 repeats of solid/rect/text/shadow)** = 168 renders / 30 app-scene-boot combinations. All within-harness and cross-boot comparisons are 0 exact px; the tiny 4-px residual is cross-stack text rasterization, not run-to-run noise.
- Cross-stack results, stable in every boot: solid 0 px, rect 0 px, shadow 0 px; text and trivial 1,745 exact px (0.3957%), 4 AA-aware px (0.0009%), max channel Δ 162. Text layout is 402.0×73.0 px in both; content bbox is `68,75 395×59` in both; max layout-edge delta 0 px. Shadow presence is 46,050 non-background px outside the rect in both (max Δ 31).
- The existing PLAYBOOK §7 AA-aware gate evaluates to 4 px vs a 220.5 px (0.05%) budget, i.e. below the gate. **No threshold is proposed or changed.** A literal cross-stack exact-zero test is not met on text; that is recorded as `U-23` and escalated rather than hidden.

**Evidence**

- `docs/evidence/day3/README.md` — generated summary with all measured numbers and the decision point.
- `docs/evidence/day3/report.html` — side-by-side captures, diff heatmaps, per-run determinism, cross-boot repeatability, profile checks, layout edges, shadow measurement.
- `docs/evidence/day3/results.json` — 168 capture records with hashes, render counters, font/text-layout markers, per-scene metrics, and the gate evaluation.
- `docs/evidence/day3/FROZEN_PROFILE.md` — device, GPU, system image, settings, scene hashes, cold-boot commands, and what is not frozen.
- `docs/evidence/day3/run.log` — raw three-boot log, including all three `cold boot complete` lines and every capture.
- `docs/evidence/day3/captures/` and `diffs/` — content-addressed PNGs (7 unique captures for 168 renders) and per-scene diff images.
- `tools/pixel/` — harness code and README; `apps/reference-compose/README.md` — Compose harness pins and run commands.
- Local gates on the committed tree: `format:check` clean, `lint` 3 tasks + `eslint tools` clean, `typecheck` 4/4, `test` 8/8, `build` ESM+CJS+types, `scenes:check` clean.
- Commit and CI: `1f704197f3997ec61aaad6c5916f3c53588298cb`; run [`45670820451`](https://github.com/nasyx-rakeeb/react-native-material-expressive/actions/runs/45670820451) — **success**, all steps green including **Verify scenes**.
- Day 3 exit: same-harness determinism met (20 repeats × 3 cold boots, 0 px). Cross-stack exact text parity is **not** met; `U-23` is the open decision.

**Deviations**

- Cross-stack text is not byte-identical (U-23). Solid/rect/shadow are exact-zero; text layout and content bbox are identical. No scene or threshold adjustment was made.
- Reports live in `docs/evidence/day3/` instead of PLAYBOOK §7's `docs/diff-reports/<date>/`. Evidence bundles are kept per day; the report contains the same side-by-side/diff content. CI artifact upload is not wired for these Android-only reports; the bundle is committed instead.
- `expo prebuild` changed the gallery `android`/`ios` scripts to `expo run:*` and warned that `edgeToEdgeEnabled` is obsolete and `userInterfaceStyle` needs `expo-system-ui`. The frozen profile forces night mode off and the harness is edge-to-edge, so Day 3 pixels are unaffected; clean up before the dev-client work.

**Risks**

- U-23: accepting the AA-aware gate is a product decision. Any future claim of byte-exact cross-stack text is false on this evidence.
- The 4 non-AA pixels are glyph-edge placement, not a font-axis failure: layout size and content bbox match exactly and both probes applied `wdth`. Investigating them means changing text rendering, not the scene.
- The Compose harness is pinned to AndroidX 1.5.0 and API 31; a baseline or API bump invalidates these numbers and requires a new run.

**Next step**

- Nasyx decides U-23: accept the existing AA-aware gate for text and close Day 3, or treat the 4 pixels as a defect and investigate text rendering. Do not proceed by tuning the scene or threshold.

---

## Day 4 | 2026-11-26 | Colour system, native dynamic colour, text-rasterization closeout

**Status:** CLOSED under **ADR-009**. Compose default schemes and the API-31 native dynamic path are exact; seed-generated variants are **MCU 2021 spec-verified**, not Compose-verified. The Day 3 text follow-up closes `U-23` with a measured root cause; no threshold or scene changed. API 34+ dynamic role resources remain `U-24`.

**Done**

- Implemented the full 48-role colour system: `M3ColorScheme`, all 9 MCU variants (`monochrome`, `neutral`, `tonalSpot`, `vibrant`, `expressive`, `fidelity`, `content`, `rainbow`, `fruitSalad`), contrast levels `-1..1`, `2021`/`2025` spec versions, phone/watch platforms, and light/dark. Results are deterministic, frozen, and LRU-cached (64).
- Added static Compose 1.5.0 defaults: `standardLightColorScheme()` = extracted `colorLight`, `standardDarkColorScheme()` = extracted `colorDark`, and `expressiveLightColorScheme()` = standard light plus the four extracted expressive overrides (`onPrimaryContainer #4F378B`, `onSecondaryContainer #4A4458`, `onTertiaryContainer #633B48`, `onErrorContainer #8C1D18`). Generated expressive dark is opt-in (`expressiveDarkColorScheme(seed)`), per ADR-006.
- Added `M3ThemeProvider` with `mode` (`system`/`light`/`dark`/`expressive`), `seed`, `contrastLevel`, `dynamicColor`, explicit `lightScheme`/`darkScheme`, and `useM3Theme`/`useM3ColorScheme` hooks. Priority is custom > dynamic > generated expressive dark > Compose baseline.
- Added the Android `M3EDynamicColor` TurboModule: API 31–33 returns 13 tones per tonal range; API 34+ returns 43 `system_*` role resources plus the five baseline error/scrim roles; below API 31 it returns `unsupported`. The JS loader treats a missing module, malformed payload, or rejection as “dynamic unavailable” and keeps the static scheme.
- Verified autolinking end-to-end. Gradle initially omitted the package because `apps/gallery/android/build/generated/autolinking/autolinking.json` was stale; deleting that generated directory regenerated the config. The package now compiles (`:react-native-material-expressive:compileDebugKotlin`), codegen emits `M3EDynamicColorSpec`, and the release gallery APK starts with `M3E_DYNAMIC_AVAILABLE true`.
- Captured `compose-dump.json` (929 KB) from a Compose 1.5.0 device: public defaults, device dynamic schemes/tones, **54 seed × variant tonal palettes mapped through Compose's own internal API-31 role table** (108 light/dark schemes), and **432** independent `com.google.android.material:material:1.11.0` schemes as an oracle.
- Generated `mcu-goldens.json` (432 schemes × 48 roles) and `compose-palettes.json` (54 palettes × 13 tones) with `tools/color/generate-goldens.mjs`; added `tools/color/compare-goldens.mjs` for defaults, mapped Compose schemes, native payload, and the Java-oracle summary.
- Added executable gates: `composeGoldens.test.ts` compares defaults exactly, the API-31 native payload exactly, and all 108 mapped Compose schemes (5,184 role values, 0 differences); `mcuGoldens.test.ts` compares all 432 generated schemes (20,736 role values, 0 differences) and checks cache/fixed-role behaviour; `dynamicColor.test.ts` covers payload parsing, API-34 fill rules, unsupported/malformed fallbacks, and caching.
- Recorded the Java oracle cross-check: **5,740 / 20,736** values differ (27.68%) across all contrast levels; at standard contrast **321 / 5,184** differ (6.19%), confined to nine on-container/primary/secondary/tertiary roles. `material` 1.11.0 implements an earlier spec draft; this is a cross-check, not a gate.
- Closed the text follow-up (`U-23`). Root cause: RN hardcodes `isSubpixelText = true` and `isLinearText = true` (`CustomStyleSpan.kt:100-101`) and rounds font sizes up to an integer physical pixel (`ReactTextView.java:490-494`), while Compose's default `TextMotion.Static` uses hinting with subpixel off and fractional sp/dp. Experiment results: faithful `text` **1,745 exact / 4 AA** px, `labels` **17,793 / 5,313**, `paragraph` **52,139 / 17,998**; `TextMotion.Animated` gives `text` **0 / 0**, `labels` 12,314 / 561, `paragraph` 33,091 / 8,575; Animated + ceil sizes gives `text` 0 / 0, `labels` 4,357 / 348, `paragraph` 4,128 / 119; Animated + ceil + floor offsets gives `text` 0 / 0, `labels` 2 exact / 0 AA (max Δ 6), `paragraph` 1 / 0 (max Δ 1).
- Added `tools/scenes/paragraph.json` (195 non-space glyphs) and `tools/scenes/labels.json` (78 glyphs); scene validation now covers 7 scenes. Diagnostic text modes are explicit harness options only (`M3E_TEXT_MOTION`, `M3E_TEXT_SIZE_MODE`, `M3E_TEXT_POS_MODE`), never shipped defaults.
- Gated the gallery dynamic-colour log behind `EXPO_PUBLIC_M3E_DYNAMIC_PROBE=1`; it is verification instrumentation, not library runtime logging. Added `apps/gallery/expo-env.d.ts` for typed `process.env` access.

**Evidence**

- `docs/evidence/day4/color/README.md` — methods, exact results, Compose seed-API limitation, Java-oracle classification, reproduction commands, limitations.
- `docs/evidence/day4/color/compose-dump.json` — Compose defaults, device dynamic schemes, 108 mapped schemes, 432 Java-oracle schemes.
- `docs/evidence/day4/color/mcu-goldens.json` — 432 MCU schemes × 48 roles.
- `docs/evidence/day4/color/compose-palettes.json` — 54 seed × variant palettes × 13 tones.
- `docs/evidence/day4/color/native-dynamic-payload.json` — API-31 release-app payload; 96/96 role values match Compose.
- `docs/evidence/day4/color/java-oracle-summary.json` — generated summary; not a gate.
- `docs/evidence/day4/text-scaling/README.md`, `SOURCE_EVIDENCE.md`, `summary.json`, `runs/{faithful,animated,ceil,floor}/` — root cause, four modes, captures, metrics.
- `tools/color/generate-goldens.mjs`, `compare-goldens.mjs`, `mcu-loader.mjs`, `register-mcu-loader.mjs`; `tools/scenes/{paragraph,labels}.json`.
- Executable gates: `src/color/__tests__/{composeGoldens,mcuGoldens}.test.ts`, `src/theme/__tests__/{dynamicColor,resolveTheme}.test.ts`.
- Local gates on the committed tree: `format:check` clean; `lint` 3/3 tasks + `eslint tools`; `typecheck` 4/4; `test` 7 suites / **71 tests**, coverage 81.91% statements / 89.94% branches / 75.60% functions / 82.22% lines; `build` 18 files ESM + CJS + types; `scenes:check` 7 scenes; gallery `typecheck`/`lint` clean.
- No pixel threshold, gate scene, or fidelity baseline changed. The Day 3 gate scene remains 4 AA-aware px / 0.0009% against the unchanged 220.5 px / 0.05% budget.
- Commit: `86e5dba`; CI run [`45770339311`](https://github.com/nasyx-rakeeb/react-native-material-expressive/actions/runs/45770339311) — **success**, all steps green (spec drift, scenes, format, lint, typecheck, test, build).

**Deviations**

- **ADR-009 / Day 4 reinterpretation:** Compose Material3 1.5.0 has no public seed→scheme or variant→scheme API. The exit criterion is met as defaults-exact + Compose-role-mapping-exact + MCU-spec-exact, not as literal Compose seed goldens. This is flagged to Nasyx; no gate was changed.
- **D-001:** faithful text retains a 4-AA-px residual on the Day 3 gate scene; inherent RN-vs-Compose quantization, recorded and accepted.
- **D-002:** generated schemes follow MCU 0.4.0 `2021`, whose on-container mapping is newer than Compose 1.5/material-java 1.11. Generated schemes must never be described as Compose-verified.
- **U-24:** API 34+ dynamic roles are source-mapped (43 resources + 5 baseline) but not emulator-verified. API 31–33 is verified exactly. A malformed/missing resource falls back to static colours rather than crashing.
- The reference Compose app gained a diagnostic `SchemeDumpActivity` and text-mode extras; none of it ships in the library.
- Reports live under `docs/evidence/day4/` rather than `docs/diff-reports/<date>/`, consistent with Day 3.

**Risks**

- MCU 0.4.0 is pinned; a version or default-spec change would move generated values. Any upgrade must regenerate both goldens and review the diff deliberately.
- API 34+ resource names can vary by OEM/API level; only API 31 has been exercised on a device until `U-24` is closed.
- Dynamic colours are read once per process (`getDynamicColorSchemes` cache). A wallpaper change while the app is alive is not observed; light/dark changes are still driven by `useColorScheme`.
- `seed` affects only the generated expressive dark scheme in `mode="expressive"`; a seed-generated light scheme requires `createColorScheme()` + `lightScheme`. This is intentional but must be documented prominently in the Day 48 theme guide.
- The Java oracle is an older spec generation and must not be used to “fix” MCU values.

**Next step**

- Day 5: typography. Build the 30 baseline/emphasized styles from tokens, Roboto Flex weight/width axes with capability detection, brand-font override, font scaling, and Compose text scenes for every style. Start with the `U-23` report summary and keep the existing pixel gate.

---

## Day 5 | 2026-11-26 | Typography: 30-role type scale, Roboto Flex axes, fallback, and text scenes

**Status:** CLOSED on implementation and the standard five-scene gate. The 30 type scenes prove token/layout parity on a matched integer rendering grid: **30/30** inside the 0.05% AA-aware budget, **26/30** byte-identical. Faithful cross-stack rasterization remains the inherited `D-001` residual: **9/30** inside the budget, worst **2,745 px / 0.6224%**. The Day 5 “text scenes for all styles diff-pass” reading is flagged as **`U-25`** for Nasyx; no threshold, scene, or baseline was changed.

**Done**

- Added the full 30-role type scale from `docs/specs/typography.json` (extracted from Compose 1.5.0 `TypeScaleTokens` + `TypefaceTokens`): 15 baseline and 15 emphasized roles, with sizes, weights, tracking, line heights, and the extracted `LineHeightStyle(Center, None)` / `includeFontPadding = false` defaults.
- Added `M3Typography`, `M3TextStyle`, `createM3Typography()`, `robotoFlexTypography()`, `defaultTypography`, `useM3TextStyle()`, and the public `ROBOTO_FLEX_NATURAL_LINE_HEIGHT_RATIO`. `defaultTypography` is the platform font with explicit 400/500/700 weights; Roboto Flex and the `wdth` axis are opt-in.
- Added the Roboto Flex `wdth` axis (25..151), emitted only for variable-font output and only when non-normal; invalid values throw. Added `staticFamilies` for per-weight fallback families.
- Added capability detection for variable-font settings: RN ≥ 0.88 and Android API ≥ 26 use `fontVariationSettings`; RN < 0.88, API < 26, unknown RN versions, and unsupported platforms use a static family + `fontWeight` and never emit the variable axis. The pure resolver is unit-tested for every branch.
- Added the natural line-box floor: Compose expands a below-natural `lineHeight` while React Native squashes it. The library applies `max(tokenLineHeight, fontSize × 1.176)` by default, affecting only `displayLarge`/`displayMedium` and their emphasized variants; `naturalLineHeightRatio: 0` restores the nominal tokens, and a brand font can supply its own ratio. Measured before/after: displayLarge Compose/RN line box 176/168 → 176/176 px; displayMedium 139/137 → 139/139 px.
- Wired typography into the theme: `M3Theme.typography`, `M3ThemeProvider.typography` overrides, `useM3Typography()`, and a merge over `defaultTypography` in `resolveM3Theme()`.
- Generated 30 one-line scenes from the spec with `tools/scenes/generate-typography.mjs` (`type-<role>`), bringing the scene index to **37**. Each scene is 320×200 dp, uses `Material` at (16, 24), and carries the role's exact size, weight, tracking, and line height.
- Extended both harnesses for `lineHeightSp`, optional `widthDp`, multiline text, and newline-safe layout logging. The Compose harness now applies the extracted `LineHeightStyle(Center, None)`; the RN harness applies the same natural-box floor as the library.
- Added report labels (`M3E_LABEL`) and missing-scene guards to the pixel report so the same pipeline can produce Day 5 typography reports without a `trivial`/`shadow` scene. The report title is no longer hard-coded to Day 3.
- Font scaling is delegated to RN 0.88.1, which scales `fontSize`, `lineHeight`, and `letterSpacing` together when `allowFontScaling` is true. The library does not pre-scale and ships no scaling helper; pixel scenes set `allowFontScaling={false}` to keep the profile at 1.0.

**Evidence**

- `docs/evidence/day5/typography/README.md` — type-scale table, scene design, faithful vs matched method, line-height finding, fallback matrix, reproduction commands, limitations.
- `docs/evidence/day5/typography/runs/faithful/` — 1 boot, 2 repeats, 35 scenes, **140 renders**. **9/30** type scenes inside 0.05%; **17,798** AA-aware px across the 30; worst `displayLarge` **2,745 px / 0.6224%**. `solid`/`rect`/`shadow` 0/0; `text`/`trivial` 1,745 exact / 4 AA (0.0009%).
- `docs/evidence/day5/typography/runs/matched-grid/` — 1 boot, 1 repeat, **70 renders**. Compose `TextMotion.Animated` + integer physical sizes + floored offsets; RN unchanged. **30/30** inside 0.05%, **26/30** byte-identical; four scenes (`displaySmall`, `displaySmallEmphasized`, `headlineSmall`, `headlineSmallEmphasized`) have a 1 px baseline offset, max **105 px / 0.0238%**.
- `docs/evidence/day5/gate/` — standard five-scene gate, 3 cold boots × 20 trivial repeats + 2 scene repeats = **168 renders**. Same-harness determinism and cross-boot repeatability **0 px**; `solid`/`rect`/`shadow` **0 exact / 0 AA**; `text`/`trivial` **1,745 exact / 4 AA (0.0009%)**, text layout 402.0×73.0 px in both. `crossStackAaAwareBelowPlaybookGate: true`; `crossStackExactZero: false` is the recorded `D-001` residual.
- `docs/specs/typography.json` — 30 roles with source lines and the extracted defaults; `pnpm scenes:check` reports 30 typography roles / 37 scenes.
- Local gates on the final tree: `format:check` clean; `lint` 3/3 + `eslint tools` clean; `typecheck` 4/4; `test` 8 suites / **87 tests**; `build` 23 files ESM + CJS + types; typography builders 100% line coverage (folder 97.82% lines).
- Commit: `0122873848273f355e5a0480865abdee0b2f3ada`; CI run [`45780797908`](https://github.com/nasyx-rakeeb/react-native-material-expressive/actions/runs/45780797908) — **success**, all steps green.

**Deviations**

- **`D-001` extended to typography:** faithful cross-stack text is not byte-identical. The 21 type scenes above the 0.05% AA-aware budget are the same RN integer physical-pixel / subpixel-text quantization recorded on Day 3 and closed as a root cause on Day 4. No threshold or scene was changed; the standard five-scene gate remains green.
- **`U-25` (open):** the Day 5 exit phrase “text scenes for all styles diff-pass” is met **30/30** on the matched rendering grid and **9/30** on the faithful rasterized diff. Nasyx must confirm which reading is the release gate. Recommendation: keep the existing five-scene gate, treat the 30 type scenes as diagnostic token/layout evidence, and publish both numbers.
- **`U-19` resolved:** the static-weight fallback is implemented and unit-tested; RN’s API-26 variable-axis gate is source-verified. No API 24/25 system image is installed, so the fallback was not rendered on a device; that runtime confirmation is deferred to the Day 42 Android compatibility matrix and does not block Day 5.
- **Contaminated run discarded:** the first full typography run used a release APK that still contained an env-gated line-height diagnostic because Gradle had reused the JS bundle. The bundle was rebuilt from scratch, the display scene was re-checked (RN line box 168 px, i.e. no diagnostic), and both evidence runs were repeated. No numbers from the contaminated run are used.
- Evidence lives under `docs/evidence/day5/` rather than `docs/diff-reports/<date>/`, consistent with Day 3/4.

**Risks**

- `U-25` is a reporting/exit-label decision, not an implementation defect. Do not describe the 30 faithful type scenes as byte-identical or as 30/30 inside the 0.05% gate.
- The 1.176 natural-line-height ratio was measured on Roboto Flex at 2.625×. A brand font with a different natural line box should pass its own `naturalLineHeightRatio`; `0` restores the raw tokens. A different density may shift a display line box by 1 px.
- The four matched-grid scenes retain a 1 px baseline offset at half-pixel font sizes; this is a rasterization-grid residual, not a token error.
- Pixel evidence is Android API 31 only; iOS uses the same sp values and RN scaling path but is not pixel-gated on Day 5.
- Web accepts the variable-font path as best-effort; no web pixel evidence is claimed.

**Next step**

- Nasyx confirms `U-25`. Day 6: shapes core (pure TS) — port `androidx.graphics.shapes` (`RoundedPolygon`, `CornerRounding`, `Cubic`, `Feature`, `Morph` + `DoubleMapper`), all 35 `MaterialShapes`, and Compose JVM golden dumps for 35 shapes + ≥50 morph pairs × 5 progress values within 1e-4.

---

## Day 6 | 2026-11-26 | Shapes core: 35 MaterialShapes, RoundedPolygon, Morph, and JVM golden

**Status:** CLOSED. All **35** shapes and **50** morph pairs at five progress values match the Compose JVM golden within **1e-4**. Worst shape delta **1.329e-7** (`Oval`); worst morph delta **1.2678e-6** (`Gem -> Ghostish` @ 0). No rendering is claimed; `PathCanvas` and the shape gallery are Day 7.

**Done**

- Ported `androidx.graphics:graphics-shapes:1.1.0` to worklet-safe TypeScript: `math`, `Cubic`, `CornerRounding`, `Features` (`Corner`/`Edge`), `RoundedPolygon`, `PolygonMeasure`, `FeatureMapping` (`DoubleMapper`, `featureDistSquared`), `Morph`, and the public `shapes` index.
- Added all **35** `MaterialShapes` with the Compose 1.5.0 definitions, lazy per-shape cache, `MATERIAL_SHAPE_NAMES`, `getMaterialShape()`, and public getters. Every getter returns `.normalized()`, matching Compose.
- Emulated Kotlin `Float` with `Math.fround` across construction, measuring, mapping, and morphing. The last two fidelity issues were (a) JS double literals used where Kotlin uses `Float` literals, which moved Clover's raw points by one ULP and flipped the `Arch -> Clover4Leaf` mapping, and (b) Compose `Matrix.rotateZ` computing radians in Float64. Rounding points/rounding values at the boundary and mirroring the matrix rotation removed both.
- Added `ShapeGoldenTest.kt` (JVM) and pinned `androidx.graphics:graphics-shapes:1.1.0` in the reference app. Material3 1.5.0 otherwise resolves graphics-shapes 1.0.1 and produces a stale golden.
- Generated `docs/specs/shapes/goldens.json`: 35 shapes with centers, **1,168** raw feature metadata entries (584 corners), **2,104** raw feature cubics, **943** flattened cubics; 50 morph pairs × 5 progress values (**250** samples, **11,730** cubic comparisons). Added `tools/shapes/generate-goldens.sh`.
- Added `shapes.test.ts` assertions for name order, shape centers/cubics, feature count/type/convexity/raw cubic count, all 50 morphs × 5 progress values, and unit-square bounds. Tolerance is `1e-4` for every geometry check.

**Evidence**

- `docs/evidence/day6/shapes/README.md` — scope, port surface, Float32 findings, golden provenance, measured maxima, commands, licensing, limitations.
- `docs/specs/shapes/goldens.json` — 35-shape + 50-morph golden, source `androidx.graphics:graphics-shapes:1.1.0 + androidx.compose.material3:material3:1.5.0`.
- `apps/reference-compose/app/src/test/java/com/nasyxrakeeb/m3ereference/ShapeGoldenTest.kt` — JVM golden generator; `tools/shapes/generate-goldens.sh` reproduces and copies it.
- Focused suite: `pnpm exec jest src/shapes/__tests__/shapes.test.ts --runInBand` — **5/5 tests**.
- Local gates: `format:check` clean; `lint` 3/3 + `eslint tools`; `typecheck` 4/4; `test` **9 suites / 92 tests**; `build` ESM + CJS + declarations; `scenes:check` 30 typography roles / 37 scenes.
- Commit: `21ab303` (`feat(shapes): add MaterialShapes, RoundedPolygon, and Morph with JVM goldens`). CI run `45819313412` failed at `Verify generated specs` because the golden sat at top-level `docs/specs/shapes-goldens.json`, which the token extractor owns. Fix `9bb532e` moved it to `docs/specs/shapes/goldens.json`; CI run `45820381554` **success**.

**Deviations**

- The golden is a JVM AndroidX dump, not an on-device Compose render. It verifies geometry and feature mapping; rasterization is Day 7.
- Worklet directives are not applied yet. The module is pure computation with no platform imports; Day 7 decides how `Morph` instances cross the JS/UI-thread boundary and where the directives belong.
- `MaterialShapes` and `RoundedPolygon`/`Morph` are ticked for spec/impl/tests/docs in `COMPONENT_MATRIX.md`; diff/iOS/gallery stay open until Day 7.

**Risks**

- The reference app must keep the explicit `graphics-shapes:1.1.0` pin. Removing it silently regresses the golden to 1.0.1.
- The morph golden samples five progress values, not every frame. Intermediate curves rely on the shared cubic interpolation and the measured feature mapping.
- The shapes engine is not yet exercised on Hermes/JSC or on the UI thread. Day 7's rendering spike is the first runtime test.

**Next step**

- Day 7: implement `PathCanvas` on Skia and SVG+Reanimated, benchmark the 35-shape cycle / 10 concurrent morphs / clipping, write ADR-002 and finalize ADR-003, and build `Shape`, `MorphingShape`, `ShapeContainer` plus the shape gallery.
- Before the Day 7 report: complete the `U-25` follow-ups (D-001 pipeline explanation, compensation experiments for the 21 faithful failures, four 1 px baseline scenes, and a proposed text-category ADR metric) and add the docs wording rule to `docs/PLAYBOOK.md`.

---


## Day 6 follow-up | 2026-11-26 | U-25 text follow-up: D-001 pipeline, compensation, baseline, ADR-010

**Status:** Follow-up complete. No gate, threshold, token, or scene changed. **ADR-010 is proposed and awaits Nasyx’s approval before Day 11.**

**Done**

- **U-25.1 — D-001 pipeline.** Traced the three RN quantization points with source/line citations: `TextAttributes.effectiveFontSize` (`ceil` to integer px), `CustomLineHeightSpan` (`ceil` line height + integer `ceil`/`floor` half-leading), and `TextAttributeProps.letterSpacing` (em against the integer font size). A fourth, separate mismatch is rasterization: RN `CustomStyleSpan` sets `isSubpixelText`/`isLinearText`, while Compose `TextMotion.Static` hints with subpixel positioning off. Compose keeps font size, line box, and half-leading fractional.
- **U-25.1 — compensation experiment.** Added a harness-only `M3E_RN_TEXT_COMP` switch and generated C1–C4 overrides; Compose stayed token-exact. On the 21 faithful failures: baseline **17,445** AA px (0/21); C1 font-size snap **14,121** (2/21); C2 + per-role tracking **1,690** (20/21); C3 + line-height snap **1,492** (20/21, but +1 px layout height and `titleLarge` regression); C4 + ink-bbox width **994** (21/21, zero width-bbox delta, but several per-role regressions). All are per-string/per-density fits; none is shippable.
- **U-25.2 — four matched-grid 1 px baselines.** `displaySmall` and `headlineSmall` (± emphasized) are layout-exact but shift the ink top by +1 px. Predicted baseline offsets from exact device metrics: **+0.779 px** (displaySmall: Compose 90.2207 vs RN 91) and **+0.467 px** (headlineSmall: Compose 63.5332 vs RN 64). Both stacks use linear+subpixel text in the matched grid, so the integer half-leading baseline offset alone rasterizes as +1 px; `lineHeight` cannot fix it without a 1 px layout-height change.
- **U-25.3 — ADR-010.** Proposed a text-category metric: layout-box height exact; width ≤5 px faithful / ≤1 px matched; ink-bbox vertical ±1 px baseline rule; AA budget normalized by text ink and glyph count (faithful ≤450 AA px / 1,000 ink px and ≤250 px/glyph; matched ≤15 / 1,000 and ≤15/glyph; compensated tier ≤150 / 1,000 and ≤25/glyph if separately approved). Includes all 30 roles and dialog/list projections. **Not applied.**
- **U-25.4 — wording rule.** Added PLAYBOOK §9.1: never claim “pixel-perfect text”; state the mode, layout deltas, ink px, glyphs, AA/1,000 ink, and AA/glyph.

**Evidence**

- `docs/evidence/day5/typography/compensation/README.md` — pipeline citations, C1–C4 definitions, 21-scene table, bbox deltas, conclusions, reproduction.
- `docs/evidence/day5/typography/compensation.json` — generated C1–C4 overrides.
- `docs/evidence/day5/typography/baseline/README.md` — four-scene arithmetic, observed bboxes, why `lineHeight` cannot fix it.
- `docs/evidence/day5/typography/baseline/font-metrics.log` — on-device `FontMetricsInt`/`FontMetrics` probe for 18 sizes.
- `docs/DECISIONS.md` ADR-010 — proposed metric, 30-role table, dialog/list projections, alternatives.
- `docs/PLAYBOOK.md` §9.1 — documentation wording rule.
- `docs/KNOWN_DEVIATIONS.md` D-001 and `docs/UNVERIFIED.md` U-25 updated with the corrected rasterization-mode cause and the follow-up numbers.
- Diagnostic runs: `/private/var/folders/_n/mz9_62997j5c7cy66p0bn5mw0000gn/T/opencode/m3e-u25-{c1,c2,c3,c4}` (raw captures not committed).
- Harness: `apps/gallery/src/harness/text-compensation.generated.ts`, `SceneHarness.tsx` (`textComp` route), `tools/pixel/lib.mjs` (`M3E_RN_TEXT_COMP`).

**Open**

- Nasyx approval of ADR-010 before Day 11. The faithful/matched budgets and the ±1 px baseline rule are proposals; the current five-scene gate and 0.05% threshold remain in force.
- The C4 tier is unused unless a compensation layer is separately approved; it is not recommended for 1.0.0.
- Commit: `74d4f41` (harness switch) and `4228de8` (evidence + ADR-010). CI run `45832320328` **success**.

**Next step**

- Day 7: `PathCanvas` Skia-vs-SVG spike, ADR-002/ADR-003, `Shape`/`MorphingShape`/`ShapeContainer`, and the shape gallery.

## Day 7 | 2026-11-26 | Renderer decision, shape primitives, and static Compose shape diff

**Status:** CLOSED (conditional, Nasyx approved 2026-11-27). Day 7 exit is met: ADR-002 is accepted with measured binary-size, build/install-friction and RN-child-clipping data; ADR-003 is finalized; `Shape`, `MorphingShape` and `ShapeContainer` are implemented; the gallery shows all 35 shapes plus animated morphs; the static 35-shape grid diff has **0 AA-aware differing pixels**. Physical-device frame-time confirmation remains `U-29`; it does not reopen the functional renderer choice.

**Done**

- Implemented the renderer boundary and primitives: `PathCanvas` (the only file importing `react-native-svg`), `shapeSource` (named/custom polygon resolution, geometry and morph-endpoint caches), `Shape`, `MorphingShape` and `ShapeContainer` (SVG `clipPath` + `foreignObject` for real RN children). React primitives are exported from `src/shapes/components.ts` and the package root, keeping the shape engine React-free.
- Added `react-native-svg@15.16.0` as the library devDependency and `>=15.0.0` peer; ADR-003 now lists the final peers and the tested Expo 58 / RN 0.88.1 / Reanimated 4.7.1 / Worklets 0.13.0 / SVG 15.16.0 matrix.
- Built the renderer spike: `cycle` (35-shape morph cycle), `concurrent` (10 morphs), `clip` (gradient clipped to a morphing path), `clipchildren` (RN children clipped to a morph), and `grid` (all 35 shapes), on both SVG and Skia. All modes run in the release gallery on Hermes/New Architecture.
- Fixed the animated crash: `interpolateGeometry` was a worklet but its helper `interpolate` was not, so the UI runtime tried to call it remotely (`Tried to synchronously call a Remote Function`). Marked `interpolate` as a worklet and inlined `Math.fround`; `MorphingShape`, `ShapeContainer` and `PathCanvas` now animate on the UI thread.
- Measured the renderer cost: release APK **203,432,215 B** (SHA-256 `0305709…c5ca`) with both renderers. Per `arm64-v8a`: SVG **771,984 B (0.77 MB)**; Skia **29,780,096 B (29.78 MB)** including `libwebgpu_dawn` even though WebGPU is unused. Across all four ABIs Skia adds **115,468,444 B**. Skia required a from-source native build (14m 25s first build); SVG's native artifact is prebuilt.
- Captured clipping evidence: SVG clips three real RN `View` bands and an RN `Text` to a morphing path; Skia can clip only Skia-drawn content. This is the deciding functional constraint for `ShapeContainer`.
- Added the static shape harness: a Compose `ShapeGridActivity` and an RN `ShapeDiffScreen` (5×7, 64dp shapes, 72dp pitch, `#6750A4` on white), plus `tools/shapes/diff-static.mjs` using the existing AA-aware pixelmatch. Result: **0 AA-aware differing pixels**; 12,157 exact pixels (1.0105%, all anti-aliasing fringe), max channel delta 68, mean absolute delta 0.0163; every shape in the same 64dp cell (zero layout-edge delta).
- Added the gallery: `m3egallery://?screen=shapes` shows all 35 shapes, five animated morph rows and a `ShapeContainer` demo. Screenshots in `docs/evidence/day7/gallery/`.
- Extended `shapes.test.ts` with shape-source tests (named/custom resolution, unknown-name error, stable geometry cache identity, ordered morph-pair cache identity). Focused suite **14/14**.

**Evidence**

- `docs/DECISIONS.md` — ADR-002 (SVG for 1.0.0, Skia rejected) and ADR-003 (final peers).
- `docs/evidence/day7/renderer/README.md` — APK hash/size, per-ABI library table, build friction, reproduce commands.
- `docs/evidence/day7/frame-times.md` — emulator-only frame table and the physical-device adb procedure for `U-29`.
- `docs/evidence/day7/clipping/` — SVG vs Skia clipping screenshots and the visual-clipping caveat.
- `docs/evidence/day7/static-diff/` — `compose.png`, `rn.png`, `diff.png`, `results.json`, `README.md`.
- `docs/evidence/day7/gallery/` — grid and morph/clip screenshots.
- `apps/reference-compose/.../ShapeGridActivity.kt`, `ShapeCatalog.kt`, `apps/gallery/src/shapes/ShapeDiffScreen.tsx`, `tools/shapes/diff-static.mjs`.
- `docs/COMPONENT_MATRIX.md` — `MaterialShapes`/`RoundedPolygon`/`Morph` diff and gallery boxes ticked; `Shape`, `MorphingShape`, `ShapeContainer` rows added.
- `docs/UNVERIFIED.md` — `U-26`, `U-27`, `U-30` resolved; `U-29` updated with the measured emulator numbers and remains open.
- JVM golden test: `cd apps/reference-compose && ./gradlew :app:testDebugUnitTest` — **BUILD SUCCESSFUL**.
- Local gates: `format:check` clean; `lint` 3/3 + `eslint tools`; `typecheck` 4/4; `test` **9 suites / 101 tests**; `build` ESM + CJS + declarations; `scenes:check` 37 scenes (core 5 / text 32).
- Code commit: `40d3142` — `feat(shapes): add SVG shape primitives, renderer spike, and static shape diff`.

**Deviations**

- Frame times are **emulator-only / SwiftShader** and pinned at the 60 Hz vsync ceiling. They are not a production performance claim and did not decide ADR-002.
- The static diff's exact-difference count is 1.0105% because every shape edge has an anti-aliasing fringe; the AA-aware mask is empty. This is reported as a renderer probe, not the five-scene gate.
- `ShapeContainer` clips visually only; touch targets remain rectangular. Path-accurate hit-testing is not part of 1.0.
- The primitives have no RNTL render tests yet; they are device-verified through the gallery and the static diff. The matrix `tests` boxes stay open until those tests exist.
- `react-native-skia` remains a gallery devDependency for the spike only; it is not a library dependency or peer.

**Risks**

- A physical mid-range device may not hold 60 fps for 10 concurrent morphs. `U-29` records the exact procedure; if it fails, revisit with a new ADR rather than assuming Skia fixes it (Skia cannot clip RN children).
- The Worklets Babel plugin is an install requirement. A custom Babel setup that omits it will fail at runtime; the package README and ADR-003 document it.
- Animated morph raster parity against Compose is not diffed yet. Day 7 verifies static shapes and the animated path's frame behavior; frame-sampled motion diffs start with the motion work.
- The static diff covers one device profile (1080×1920, 2.625×). Other densities remain part of the Day 42 compatibility matrix.

**Next step**

- Day 8: spring tokens → solver, Reanimated `withSpring` comparison, analytic fallback if deviation >1%, `MotionScheme` (expressive/standard), `useSpring`/`useSpatialSpring`/`useEffectsSpring`, and reduce-motion mapping.
- Before Day 11: answer ADR-010 questions (a)–(d), run C2 at ≥2 density/font-scale combinations including font scale 1.3, and revise ADR-010.

---

## ADR-010 follow-up | 2026-11-27 | C2 profile matrix and revised text metric

**Status:** Evidence complete; ADR-010 remains **proposed** and awaits Nasyx’s approval before Day 11.

**Done**

- Committed `ceb5bf6`, which was missing from this log. It adds the 420/1.0, 420/1.3, 320/1.0 and 320/1.3 C2/token-exact profile matrix under `docs/evidence/day5/typography/profile-matrix/`.
- Answered ADR-010 questions (a)–(d): C2 is a per-role/per-sample width fit, fails at 320/1.0 and 1.3, and is rejected for shipping; C4 is rejected as strictly less general. The generic Compose `FontScaleConverter` is the proposed shipping layer and remains a Day 10 prerequisite.
- Revised ADR-010 to the ink-normalized metric: faithful `≤450 AA / 1,000 ink` **and** `≤3.0 AA / glyph / font px`; compensated `≤250` and `≤1.5` only if a generic layer is approved; matched `≤15` and `≤0.2`. The flat `≤250 AA/glyph` draft is withdrawn.
- No gate, scene, token or threshold changed. The standard five-scene gate remains in force; ADR-010 is not approved.

**Evidence**

- `docs/DECISIONS.md` ADR-010 (revised 2026-11-27).
- `docs/evidence/day5/typography/profile-matrix/README.md`, `summary.md`, `summary.json`, `runs/`.
- Commit `ceb5bf6` — `docs(typography): profile C2 at four density/scale combinations`.

**Next step**

- Day 10 gate: present the plain-language ADR-010 summary and recommendation; Nasyx decides before Day 11.

---

## Day 7 follow-up | 2026-11-27 | ForeignObject probe, U-29 readout, final APK

**Status:** Day 7 close verification complete. `U-32` is open; `U-29` remains open until the physical-device run. The Day 7 renderer exit is unchanged.

**Done**

- Built a `clipprobe` route (`m3egallery://?screen=clipprobe`) around a 300 dp `Clover4Leaf` `ShapeContainer`. Visual clipping and animated children **pass**; touch, scrolling and accessibility hit-testing **fail** inside the SVG `foreignObject`. Root cause: `react-native-svg`’s `VirtualView.onLayout` does not lay out non-virtual children, so the RN wrapper is 0×0 and Android skips it for touch/a11y. Recorded as **U-32** with screenshots, the accessibility-tree dump and upstream issue references.
- Added an on-screen FPS/frame-time card to `ShapeSpike` for `U-29`: FPS, average/max, frame count, window dp, physical px, density and Android API. The card is an isolated component with 1 Hz updates, so it does not re-render the spike tree; it logs the same `M3E_SPIKE_UI` line every 60 frames.
- Re-ran the emulator frame table on the final build: cycle 16.76 ms SVG / 16.68 ms Skia; concurrent 16.73 / 16.85; clip 16.67 / 16.70. All at the 60 Hz ceiling. An earlier pass at host load 10–15 measured 28–73 ms and is excluded; SwiftShader is host-CPU-bound.
- Final U-29 spike APK: `apps/gallery/android/app/build/outputs/apk/release/app-release.apk`, **203,440,223 bytes**, SHA-256 `612c6921c6444fbd8fae58b1acd8b548b64896a05ebd6a6e593d7b34653d9a28`. The renderer-evidence APK remains **203,432,215 bytes** (`0305709…c5ca`); the 8,008 B delta is the probe/readout chrome.
- Housekeeping commits: `cc67a92` (PROGRESS statuses + missing `ceb5bf6`), `3c9a966` (U-25.3 revised ADR-010 thresholds), `c3906d7` (final APK byte reconciliation), `f54bb8b` (Day 7 matrix status).
- A connected Xiaomi 2201116SI was detected for `U-29`, but the install prompt was canceled on the device; the install was not retried. The physical-device run remains Nasyx’s action.

**Evidence**

- `docs/evidence/day7/foreign-object/README.md`, `accessibility-tree.xml`, `01-clip-running.png` … `03-clip-paused.png`.
- `docs/evidence/day7/frame-times.md`, `frame-times-card.png`.
- `docs/UNVERIFIED.md` — `U-29` updated with the readout APK and final numbers; `U-32` added.
- `docs/COMPONENT_MATRIX.md` — `ShapeContainer` marked visual-only.
- `apps/gallery/src/shapes/ClipProbeScreen.tsx`, `apps/gallery/src/spike/ShapeSpike.tsx`.

**Next step**

- Post the Day 7 close report; Nasyx runs `U-29` on the phone and chooses the `U-32` fallback before interactive `ShapeContainer` use. Day 8 stays paused until the report is approved.

---

## U-32 decision | 2026-11-27 | Decorative-only ShapeContainer, borderRadius for interaction

**Status:** Decided by Nasyx; recorded as **ADR-017**. `U-32` is resolved as a 1.0 scope decision; the native mask capability is post-1.0 backlog.

**Audit**

- Compose Material3 1.5.0 sources: `MaterialShapes.*` is used only by `LoadingIndicator.kt`, whose public composables have no child slot. `RoundedPolygon` is used only by loading/progress leaves. Every shape-typed container token is a rounded rectangle or corner-full circle.
- Reviewed all 37 component families in `COMPONENT_MATRIX.md`. **No stock component needs interactive or screen-reader-focusable children clipped to a non-rounded-rect MaterialShape.** The list is empty, so the decision proceeds.

**Decision**

- Interactive containers (buttons, icon buttons, chips, split button, FABs, cards, anything pressable that morphs between rounded rectangles) use RN `borderRadius`. No path-clipped interactive content in 1.0.0.
- `ShapeContainer` is decorative/non-interactive only. `decorative: true` is required by its type; a dev-only traversal warns on pressable/accessible children; the subtree is hidden from assistive technology and set to `pointerEvents="none"` so it cannot expose 0×0 nodes or swallow input.
- Complex polygon clipping stays visual. The native mask spike is in `docs/BACKLOG.md` for after 1.0, together with the deferred TalkBack pass.

**Evidence**

- `docs/DECISIONS.md` ADR-017; `docs/UNVERIFIED.md` U-32; `docs/COMPONENT_MATRIX.md`; `docs/BACKLOG.md`.
- `packages/react-native-material-expressive/src/shapes/ShapeContainer.tsx`, `PathCanvas.tsx`.
- `src/shapes/__type_tests__/ShapeContainer.types.tsx` — `tsc` fails if the required `decorative` prop is removed.

---

## U-29 device hand-off | 2026-11-27 | arm64 APK and rooted install

**Status:** Prepared; `U-29` stays open until the phone numbers are recorded. Hard blocker before Day 31/32.

**Done**

- Built an arm64-only release spike: **58,369,090 bytes**, SHA-256 `7436712f45663084bd77558b10ff775052eecbd5107f6a51fe83ddcc26a82e2f`, `lib/arm64-v8a` only. The universal emulator artifact is preserved as `app-release-universal.apk` (**203,440,223 bytes**, `612c6921…3d9a28`).
- MIUI rejects plain `adb install`; the hand-off uses a root shell (`adb push` + `su -c 'pm install -r …'`). The phone was not attached during this session, so the install itself is still pending.
- Added `docs/evidence/day7/u29-device-steps.md` with the root install, the six 20 s runs, device commands (`ro.product.model`, `ro.soc.model`/`ro.board.platform`, `dumpsys display` refresh), the fill-in table and troubleshooting.
- Added `tools/device/u29-capture.sh`: picks the first non-emulator device, checks arm64, installs through root, runs all six modes, prints the last `M3E_SPIKE_UI` lines and the device facts.

**Next step**

- Connect the phone, run `SERIAL=<serial> tools/device/u29-capture.sh`, and record model/SoC/refresh plus the six rows in `docs/evidence/day7/frame-times.md`. Then `U-29` can close.

---

## Day 8 | 2026-11-27 | Motion scheme, Compose-exact spring driver, reduce motion

**Status:** Work complete; six gates pass. Awaiting Day-Close approval. No tag and no Day 9 work until then.

**Done**

- Generated the motion golden from `androidx.compose.material3:material3:1.5.0` with `SpringGoldenTest` through the public `MotionScheme` API: twelve spring tokens (standard/expressive × spatial/effects × default/fast/slow), sampled at every whole millisecond, plus four non-zero-initial-velocity interruption scenarios. Stored at `docs/specs/motion/goldens.json`; method in `docs/specs/motion/README.md`.
- Ported Compose `SpringSimulation` and `estimateAnimationDurationMillis` to `src/motion/spring.ts` (Float32 boundary, closed-form under/critical/over-damped branches, 0.01 visibility threshold). Added the Reanimated driver `withComposeSpring` in `src/motion/springAnimation.ts`, which samples the solver per frame and clamps at the Compose duration.
- Added `MotionScheme` (standard/expressive, six springs each), `resolveMotionScheme`, and the public hooks `useSpring`, `useSpatialSpring`, `useEffectsSpring`. Components never call Reanimated `withSpring` for Material motion.
- Compared Reanimated 4.7.1 stock `withSpring` with the golden: **2/12 tokens exceed the 1% gate** (`fastEffects` both schemes, 1.512%) and every token settles later than Compose (e.g. `fastEffects` 217 ms vs 107 ms, `defaultSpatial` 450 ms vs 228 ms). Recorded as **ADR-015**; the custom driver ships.
- Mapped reduce motion as **ADR-016**: spatial → instant, effects → 100 ms linear fade (`MotionDurations.short2`); `useReduceMotion` reads `AccessibilityInfo.isReduceMotionEnabled` and listens for `reduceMotionChanged`, with an override for previews/tests.
- Built the gallery motion screen (`m3egallery://?screen=motion`): scheme toggle, Play/Reverse, curve chart, all twelve token rows with custom-vs-stock tracks, reduce-motion demo, and `[M3E] motion_demo` logging. Captured `standard.png`, `expressive.png`, `reduce-on.png`, `system-reduce-on.png`.
- Added `tools/motion/generate-goldens.sh`, `verify-traces.mjs` (writes `docs/evidence/day8/springs/summary.json`) and `reanimated-spring.mjs` (stock solver transcription for the comparison).
- Motion tests: 9/9 (12 traces at 1e-6, exact durations, 4 interruptions, boundary clamp, constants, scheme routing, reduce-motion mapping). Full suite **10 suites / 110 tests**.

**Numbers**

- Solver: 12/12 durations exact; maximum deviation ≈5e-10 of the range (gate 1%); 4/4 interruption scenarios match.
- Stock `withSpring`: 10/12 tokens inside 1%, `fastEffects` 1.512% in both schemes; all settle later, roughly 2×.

**Evidence**

- `docs/evidence/day8/README.md` — index, tables, gates, limits, reproduce commands.
- `docs/evidence/day8/springs/verification.md` — full solver and stock comparison.
- `docs/evidence/day8/springs/summary.json` — machine-readable verification run.
- `docs/evidence/day8/gallery/*.png` — four 1080×1920 emulator captures.
- `docs/DECISIONS.md` — ADR-015, ADR-016.
- `docs/specs/motion/goldens.json`, `docs/specs/motion/README.md`, `docs/specs/motion/behavior.md`.
- `apps/reference-compose/.../SpringGoldenTest.kt`; `tools/motion/`.

**Gates (final run, 2026-11-27)**

- `format:check` **PASS**; `lint` **PASS** (3/3); `typecheck` **PASS** (4/4); `test` **PASS** (10 suites / 110 tests); `build` **PASS** (ESM + CJS + declarations); `scenes:check` **PASS** (37 scenes: core 5 / text 32).

**Deviations**

- The driver is verified numerically off-device. Jest cannot execute the Reanimated UI-thread runtime, so the gallery smoke test remains the runtime check on every Reanimated upgrade.
- The stock comparison uses a transcribed 4.7.1 solver, not an on-device trace; it measures the algorithm, which is the decision input.
- Screenshots are emulator-only (API 31, 420 dpi, SwiftShader). They prove the UI and reduce-motion status, not frame timing.
- Reduce motion has no Compose counterpart; it is a platform mapping covered by unit tests and the gallery, not the pixel gate.
- `useReduceMotion` is async on first mount, so components start in full motion for one frame.

**Risks**

- Reanimated upgrades can change `defineAnimation` or its animation-object contract; ADR-015 lists the failure modes and the fallback (`FrameCallback`-driven shared value).
- A component that tags spatial motion as `effects` would still animate under reduced motion; each component spec must state its kind.

**Next step**

- Post the Day 8 Day-Close Report and stop. Day 9 (interaction primitives) starts only after Nasyx approves.

---

## U-29 result | 2026-11-27 | Physical-device frame times (Xiaomi 2201116SI)

**Status:** **RESOLVED.** The phone was attached over Wi-Fi adb, unlocked, and the arm64 release APK was installed through root (`su -c 'pm install -r …'`). All six 20 s captures ran on the real device.

**Device:** Xiaomi 2201116SI (Redmi Note 11), SoC **SM6375** (`holi`), Android 13 / API 33, arm64-v8a, 1080×2400, 440 dpi (2.750×), **60 Hz active mode** (`mActiveModeId=2`; the panel supports 120 Hz, but 120 Hz was not tested). Window 393×873 dp.

**Results (last `M3E_SPIKE_UI` line per 20 s run)**

| Mode | Renderer | Frames | Avg (ms) | Max (ms) |
|---|---|---:|---:|---:|
| `cycle` | SVG | 1080 | 17.22 | 33.54 |
| `cycle` | Skia | 1140 | 16.72 | 33.55 |
| `concurrent` | SVG | 1020 | 18.20 | 50.05 |
| `concurrent` | Skia | 1140 | 16.71 | 16.96 |
| `clip` | SVG | 1080 | 17.42 | 33.53 |
| `clip` | Skia | 1140 | 16.71 | 17.07 |

**Reading**

- Skia holds the 60 Hz ceiling (16.71 ms) in all three modes.
- SVG is 0.5–1.5 ms above the ceiling on average and drops frames. The worst case is ten concurrent morphs: 18.20 ms average, 50.05 ms max, ~51 fps.
- ADR-002 is unchanged: SVG wins on binary size (0.77 MB vs 29.78 MB per arm64 ABI), build/install friction and RN-child clipping. The 60 fps claim is now scoped: SVG holds 60 fps for a single morph and the clipped-gradient scene, not for ten concurrent morphs on this device. Skia is smoother for many simultaneous path animations.
- 120 Hz was not tested; no 120 fps claim.

**Evidence**

- `docs/evidence/day7/frame-times.md#physical-device-u-29` — device facts, table, method, reading.
- `docs/evidence/day7/frame-times-device.png` — on-screen card (clip/Skia, 59.9 FPS, avg 16.71 ms, max 17.07 ms).
- `docs/evidence/day7/u29-device-steps.md` — completed hand-off with the result table and reproduction steps.
- `docs/UNVERIFIED.md` U-29 — resolved.
- `tools/device/u29-capture.sh` — now reports the active display mode (`mActiveModeId`), not the first supported mode.

---

## Day 9 | 2026-11-27/28 | Interaction primitives, state layers, ripple, focus ring, elevation, haptics

**Status:** READY FOR APPROVAL.

**Done**

- Implemented the `Interactive` state machine (enabled/disabled, hover, focus, press, drag, long-press) as a headless `Pressable`. It renders no visuals; consumers compose `StateLayer`, `Ripple` and `FocusRing` through a render-prop state. **ADR-018.**
- Implemented Compose-cited state layers: hover **0.08**, focus **0.10**, pressed **0.10**, dragged **0.16** (`StateTokens.kt:21-25`); 15 ms linear default/hover, 45 ms focus-in and drag-start, 150 ms drag-out (`material3-ripple/Ripple.kt:474-494`).
- Implemented the bounded/unbounded ripple: start radius `0.3 × max(w,h)`, bounded end `hypot(w,h)/2 + 10 dp`, fade-in 75 ms linear, radius 225 ms FastOutSlowIn, centre 225 ms linear, fade-out 150 ms linear, press alpha 0.10 (`RippleAnimation.kt:83-115,157-174`).
- Implemented the inset focus ring: outer 0 dp / 2 dp `secondary`, inner 1 dp / 3 dp `onSecondary`, inner drawn first (`Ripple.kt:349-357,784-801`); focus-in is spatial, focus-out is effects.
- Implemented elevation 0/1/3/6/8/12 dp (`ElevationTokens.kt:23-41`) and the tonal `surface` formula `((4.5·ln(elevation+1))+2)/100` (`ColorScheme.kt:1157-1160,1566-1572`). `Surface` resolves tonal colour only for the `surface` role; other roles keep their colour.
- Implemented the 48 dp target with `hitSlop`, never layout: `resolveHitSlop` plus a render test that lays out a 24×24 visual, asserts a 12 dp slop on every side (24 + 12 + 12 = 48), and asserts the rendered style is still 24×24.
- Implemented `M3Haptics` as an injectable adapter (`impact`, `selection`, `notification`) with `NOOP_HAPTICS` as the default. The library imports no native haptics module.
- Closed the ADR-016 one-frame bug: `useReduceMotion` now starts `{ enabled: true, ready: false }`; `useSpring`/`useTimedValue` hold the first animation until the native answer arrives. **ADR-016 amendment.**
- Enforced motion kinds: every animated property is declared `spatial` or `effects` in `docs/specs/interaction/behavior.md`; `tools/motion-kind/check.mjs` fails a missing/non-literal kind, a raw `withTiming`/`withSpring`, an undeclared component, or a spec/source mismatch. It runs in `pnpm lint`, has 6 analyzer self-tests, and a Jest wrapper. `useSpring` now requires `kind`.
- Extended the scene pipeline with an `interaction` category and five 320×200 dp scenes: `interaction-states`, `state-layer-colors`, `focus-rings`, `elevation-levels`, `ripple-frames`. RN renders the real library primitives; Compose renders the same geometry and token values.
- Captured iOS Release on the iPhone 17 Pro simulator and compared levels 0/1/3/6/8/12 side-by-side with Android. Tonal fills match 5/6 levels exactly (level 12 differs by 1/255); the iOS shadow is broader/softer and is documented as an **approximation**, never a pixel match. **ADR-019.**

**Numbers**

- Android diff, two captures per stack, determinism 0 exact / 0 AA-aware: `interaction-states` 97,787 exact (22.1739%), **0 AA-aware**, max Δ 9; `state-layer-colors` 187,908 (42.6095%), **0**, max Δ 9; `focus-rings` 2,254 (0.5111%), **0**, max Δ 18; `elevation-levels` 22,350 (5.0680%), **0**, max Δ 1; `ripple-frames` 79,557 (18.0401%), **0**, max Δ 11. Gate is AA-aware 0.05%; all five are **0.0000%**.
- Motion-kind gate: 3 components, 6 properties (spatial 3, effects 3).
- iOS shadow band (2–24 dp below each tile): Android depth 0.0/8.8/19.3/25.3/26.3/27.1 vs iOS 1.0/10.0/16.1/18.3/22.0/27.1 for levels 0/1/3/6/8/12. The iOS mean is higher at every level: broader, softer shadow.
- Tests: **20 suites / 153 tests**. Scenes: **42 (core 5 / text 32 / interaction 5)**.

**Evidence**

- `docs/evidence/day9/README.md` — diff table, exact-vs-AA explanation, pixel-snapping note, 48 dp proof, haptics, reduce-motion readiness, motion-kind gate, limits, reproduce commands.
- `docs/evidence/day9/diff/` — `report.html`, `results.json`, captures, diffs, side-by-side pairs.
- `docs/evidence/day9/ios/README.md`, `shadow-profile.json`, `elevation-levels-android-vs-ios.png`.
- `docs/specs/interaction/behavior.md` — every value cited to Compose 1.5.0, plus the motion-kind table.
- `docs/DECISIONS.md` — ADR-016 amendment, ADR-018, ADR-019.
- `tools/motion-kind/check.mjs`; `src/motion/__tests__/motionKind.test.ts`.
- `src/interaction/__tests__/touchTarget.render.test.tsx`.

**Gates (final run, 2026-11-28)**

- `format:check` **PASS**; `lint` **PASS** (3/3 packages + tools + motion-kind); `typecheck` **PASS** (4/4); `test` **PASS** (20 suites / 153 tests); `build` **PASS** (ESM + CJS + declarations); `scenes:check` **PASS** (42 scenes).
- Interaction diff gate **PASS** (AA-aware 0.0000% on all five scenes).

**Deviations**

- Exact-zero is not met on the interaction scenes. RN and Compose composite 8–16% state layers with different 8-bit rounding (fills differ by ≤1/255) and anti-alias clip/ripple edges differently (max Δ 9–18). The PLAYBOOK gate is AA-aware 0.05%; all five scenes are 0 AA-aware. Documented, not hidden.
- The scene harness snaps static layer bounds to the device pixel grid (`snapDp`) because Compose rounds offset and size independently to integer pixels while Yoga rounds fractional sizes down, which otherwise leaves a 1 px edge. Harness-only; the library API still takes dp.
- Live hover, drag and long-press pixels were not captured: no pointer device on the emulator and no transient gesture capture. The states are rendered statically (`interaction-states`, `state-layer-colors`) and the reducer is unit-tested. Stated in the evidence.
- iOS elevation is inspection only; no Compose iOS reference exists. The shadow coefficients are an approximation and may be tuned in the Day 41 iOS pass.
- One boot, two captures per stack. Cross-boot determinism remains Day 46 CI hardening.
- Haptics has no visual diff; adapter unit tests only.
- Reduce motion has no Compose counterpart; unit tests plus the Day 8 gallery.
- The U-29 120 Hz re-run is still deferred to Day 30; the Xiaomi was not re-attached for Day 9.

**Risks**

- A visual below 48 dp with less than 48 dp spacing between targets will overlap hit regions; components must keep spacing or deliberately lower `minTouchTarget`.
- The motion-kind checker only scans `packages/.../src`; new animation added directly in the gallery or another package is not covered.
- iOS shadow coefficients are monotonic but not Android-equivalent; a designer comparing platforms may flag the softer look.
- State-layer timing is transcribed from `Ripple.kt`; if Compose changes the tween in a future version, the spec must be re-pinned.

**Next step**

- Post the Day 9 Day-Close Report and stop. Day 10 (foundation gate) starts only after Nasyx approves and reviews the gallery/diff reports.

## Day 10 | 2026-11-28 | Icon, Overlay/Portal, window size classes, RTL (foundation gate)

**Status:** READY FOR APPROVAL (gate report posted).

**Done**

- Shipped `MaterialSymbol` with all four Material Symbols axes (`FILL` 0–1, `wght` 100–700, `GRAD` -50–200, `opsz` 20–48), clamped to the upstream `fvar` ranges, with runtime capability detection. Unsupported platforms omit `fontVariationSettings` and report `applied: false` instead of silently faking the axes. **ADR-021.**
- Bundled a **90-glyph subset** of `MaterialSymbolsOutlined[FILL,GRAD,opsz,wght].ttf`: **116,368 B** vs 10,744,832 B full (1.08%), all four axes preserved, SHA-256 `3b29bd1c…`. Shipped the Apache-2.0 `LICENSE` and `NOTICE`; the diff run verifies identical font bytes in source, gallery assets, Compose APK and RN APK.
- Added `Icon` with **12 internal path glyphs** (`check`, `close`, `menu`, `search`, `arrow_back`, `arrow_forward`, `chevron_right`, `expand_more`, `add`, `remove`, `more_vert`, `star`), optional RTL mirroring, and fixed sizing independent of font scale.
- Fixed icon paint alignment: shifted paint down by `roundToNearestPixel(size × 0.1)` to match Compose's centred 1.2em line box, added `numberOfLines={1}` and a `size × size` clipping wrapper. This removed the final 188 AA-aware pixels caused by heavy/GRAD glyphs overflowing the 32 dp line box.
- Implemented one `OverlayProvider` owning the whole stack, with `OverlayHost` and a declarative `Portal`. Back/Escape dismiss **only the topmost** layer; non-dismissible layers consume the request; each layer owns its scrim; modal layers capture/restore accessibility focus and hide the app subtree; insets are app-provided and merged per layer; keyboard avoidance is configurable per layer. **ADR-022.** 16 RNTL tests.
- Added pure window-size-class helpers and `useWindowSizeClass` (Compose 1.5.0 breakpoints, inclusive lower bounds: width 600/840, height 480/900), subscribing only while mounted. **ADR-023.** Unit tests cover every boundary.
- Added RTL utilities: direction resolution, numeric start/end, text alignment, row direction, writing direction and icon mirroring. RN logical props stay first; helpers cover the gaps. **ADR-024.** Unit tests plus a live gallery preview.
- Added the `icon` scene category and `icon-symbols` (320×200 dp, 16 glyphs covering all axes) to the scene pipeline; Compose renders the same font with the same axis string. The gallery gains `screen=foundation` with axes, path icons, window readout, RTL preview and overlay demos, plus logcat markers.
- Installed the release gallery on the Xiaomi (`10.231.239.101:5555`) via `/data/local/tmp` and launched the foundation screen.

**Numbers**

- Icon diff, 3 cold boots, one capture per stack per boot: **exact 0 (0.0000%), AA-aware 0 (0.0000%), max channel Δ 0**; content bbox identical (`102,47 641×445`); cross-boot and within-harness determinism **0/0** for both stacks.
- Font: 90 glyphs / 116,368 B / 1.08% of the full 10,744,832 B asset; all four axes retained; licence and NOTICE in all four APK/source locations.
- Window readout on the emulator: 411×731 dp → **compact / medium**; density override 240 dpi → 720×1280 dp → **medium / expanded**, proving live recompute.
- Overlay emulator run: stack depth 2 → first back leaves `overlay-1` → second back leaves the stack empty; keyboard shown (`mInputShown=true`) with the dialog fully above the IME.
- Tests: **27 suites / 201 tests**; Day 10 adds 7 suites / 48 tests. Scenes: **43 (core 5 / text 32 / interaction 5 / icon 1)**.

**Evidence**

- `docs/evidence/day10/README.md` — icon font/licence/size, diff table, overlay test matrix + emulator-only list, window and RTL results, commands, limitations.
- `docs/evidence/day10/diff/` — `report.html`, `results.json`, captures, diffs.
- `docs/evidence/day10/gallery/` — foundation, window, RTL, overlay stack/back/dialog/keyboard screenshots and logcat.
- `docs/DECISIONS.md` — ADR-021–024; ADR-020 remains proposed.
- `docs/UNVERIFIED.md` — U-33–U-36.

**Gates (final run, 2026-11-28)**

- `format:check` **PASS**; `lint` **PASS** (3/3 packages + tools + motion-kind); `typecheck` **PASS** (4/4); `test` **PASS** (27 suites / 201 tests); `scenes:check` **PASS** (43 scenes).
- Icon diff **PASS** (exact 0 / AA 0 / max Δ 0). Core five-scene gate unchanged and still passing from Day 9.

**Deviations**

- `Text` and `M3Provider` were explicitly outside the approved Day 10 scope and remain **NOT DONE**. `Text` blocks Day 11 labels (`U-36`); ADR-010 §4's non-linear `FontScaleConverter` is still unimplemented.
- The icon category is tracked with **no new threshold**. ADR-020 (threshold-independent reporting) is proposed only; the PLAYBOOK §7 gate (`pixelmatch` 0.1, `includeAA: false`, 0.05% AA-aware, core five scenes) is unchanged.
- Overlay, window-size and RTL rows have no screenshot diff: they are behavioural, evidenced by Jest/RNTL plus the emulator gallery run.
- iOS is unverified for all four foundations; a11y is unit-level only (no TalkBack on the AVD). U-33–U-35 stay open.
- `wm size` letterboxes the portrait-locked activity on this AVD, so the second window-size row uses a density override rather than a true multi-window resize.
- The U-29 120 Hz re-run is still outstanding; the Xiaomi is connected now, but the captures were not re-run in this session.

**Risks**

- Day 11 Button labels need the missing `Text` primitive; starting Day 11 without it would either block or force an ad-hoc text component.
- Adding a Material Symbols name without regenerating the 90-glyph subset renders tofu; the registry/assets tests catch drift, but the failure mode is easy to miss in review.
- Variable axes on Android < 26 and on iOS are untested on device; those users see the default instance.
- The overlay "focus trap" is `accessibilityViewIsModal` + `no-hide-descendants`, not a hardware-keyboard Tab trap.
- Window classes respond to `Dimensions`; a true multi-window/split-screen resize has not been exercised.

**Next step**

- Post the Day 10 gate report and stop. Day 11 starts only after Nasyx approves.

## Day 10 closure addendum | 2026-11-28 | Provider, Text, thresholds approved

**Status:** CLOSED (Nasyx approved 2026-11-28; tag `day-10-closed`). This
addendum supersedes the Day 10 entry above, which described the original scope
before the extended `M3Provider`/`Text` work.

**Done**

- `M3Provider`: theme, reduce-motion, window size class and layout direction
  contexts, with `useM3Theme`, `useM3ReduceMotion`, `useWindowSize`/
  `useWindowSizeClass`, `useM3LayoutDirection` and `useM3ContentColor`.
- `Text`: 30 roles, emphasized opt-in, content-colour inheritance, RTL align,
  sp overrides, and the Compose UI 1.12.0 non-linear `FontScaleConverter`
  (`composeFontScale` + `composeLineHeight`).
- Gallery: provider demo and all-role text grids; `SceneHarness` uses raw RN
  `Text` for non-role core scenes and the library `Text` only for `type-*`.
- Core gate regression found and fixed: the first harness build routed
  non-role text through the library `Text`, supplied `bodyLarge`'s 24 sp line
  height, moved the ink box by 5 px and measured 3,810 AA px (0.8639%). The
  final harness matches Day 3: `text`/`trivial` 4 AA px (0.0009%, max Δ 162);
  `solid`/`rect`/`shadow` exact 0.
- Final APK 203,638,944 B, SHA-256 `7697f925…c9e7a42`; installed on the Xiaomi
  with `adb install -r` at 16:09.

**Numbers**

- Typography converter, 30 roles × 4 profiles: 17,798 / 22,658 / 3,174 / 9,480
  AA px at 420/1.0, 420/1.3, 320/1.0, 320/1.3; 119/120 pass the approved
  faithful budget. One miss: `type-label-medium-emphasized` at 320/1.3,
  453.7 per 1,000 ink vs 450 (per-glyph 2.845 ≤ 3.0), recorded in `D-001`.
- Tests: **31 suites / 237 tests**; Day 10 adds 11 suites / 93 tests. Scenes:
  43. Icon diff exact 0 / AA 0 / max Δ 0 across 3 cold boots.
- Foundation: **22/22 Android-DONE, 0/22 Release-DONE**. Typography/Text are
  `[x] T`; colour schemes, dynamic colour and shape tokens are `[x] V`
  (value-golden), with per-role gallery pages in the Day 47 plan.

**Decisions**

- ADR-009 accepted. ADR-010 numeric thresholds approved (450/1,000 ink and
  3.0/glyph/font px). ADR-020 accepted as reporting only, no gate change.
  ADR-021–024 accepted.
- Calendar now has best-case and realistic columns; realistic assumes Phase B
  and C take 1.5× planned days.

**Next step**

- Day 11 approved: Button (1/2), static scene matrix. Day 12 needs separate
  approval.
