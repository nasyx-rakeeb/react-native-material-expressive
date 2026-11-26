# RN Material 3 Expressive — Project Brief & Execution Playbook

> **Owner:** Nasyx (solo indie dev). **Executor:** coding agent working in ONE long conversation.
> **Written:** 2026-11-25. Research in §3 is dated; re-verify anything marked `VERIFY` before relying on it.
> **Placeholder package name:** `<PKG>` (decided on Day 1, see §2).

---

## 0. HOW THE AGENT USES THIS FILE (read this first, every session)

This conversation will be long and your context WILL be compacted. This file and the repo are your memory. Obey this protocol:

1. **Copy this file into the repo** as `docs/PLAYBOOK.md` on Day 1. Never edit §1 (Core Rules) or §10 (Day plan) except to tick progress or when Nasyx approves a plan change; log any approved change in `docs/DECISIONS.md`.
2. **Maintain these files in the repo, always up to date:**
   - `docs/progress/PROGRESS.md` — append-only log. One entry per work session: `Day N | date | what was done | evidence (commit hash, screenshot-diff report path) | next step`.
   - `docs/COMPONENT_MATRIX.md` — one row per component, columns: `spec extracted | implemented | android diff pass | ios checked | a11y | docs | gallery | DONE`. A cell is only ticked with evidence.
   - `docs/DECISIONS.md` — ADR log (numbered). Every architectural choice, with the reason and the alternatives rejected.
   - `docs/KNOWN_DEVIATIONS.md` — any place we intentionally or unavoidably differ from the Compose reference, with a screenshot and a reason. Empty is the goal.
   - `docs/UNVERIFIED.md` — every spec value or claim you could not source. These block "DONE".
3. **At the start of every day / after any compaction:** re-read (a) §1 Core Rules, (b) today's block in §10, (c) the last ~30 lines of `PROGRESS.md`, (d) `COMPONENT_MATRIX.md`. Do not rely on memory of earlier conversation.
4. **Commit early, commit often.** Conventional commits. One logical change per commit. Push to remote every day.
5. **Do not wander.** If you find an interesting side-quest, write it in `docs/BACKLOG.md` and keep to today's block. Only the "Day 0 gate" and "Stop conditions" (§1) may interrupt the plan.
6. **Time is not the constraint; correctness is.** A "day" is a unit of scope, not a clock. Do not close a day until its exit criteria are met with evidence. If a day overruns, the next days slide; do not skip exit criteria to stay on schedule. Record slippage in `PROGRESS.md`.

---

## 1. MISSION AND CORE RULES (never violate)

**Mission.** Build the most complete, most faithful, production-ready **Material 3 Expressive (M3E)** component library for React Native, ready to compete head-to-head with React Native Paper v6 at the moment of its stable release. First public release is `1.0.0`; there is no "MVP". Nasyx wants 100% scope, pixel-perfect fidelity, and polish at launch.

**Core Rules**

1. **Single source of truth hierarchy** for every number, color, shape, and timing:
   (1) Google's **Compose Material3 1.5.0 sources** (token files + component code, Apache-2.0), (2) m3.material.io specs, (3) other ports (Flutter/Rust/web) are *cross-checks only*, never truth. **Never write a spec value from memory.** Extract it, store it in `docs/specs/`, cite its origin. Unsourced value → `docs/UNVERIFIED.md`, and the component cannot be marked DONE.
2. **Pixel-perfect is measured, not claimed.** Every component state is compared against a Compose reference render with the diff pipeline in §7. No diff report, no "done".
3. **Android is the fidelity reference platform** (Compose renders there). iOS must be visually faithful and behaviorally correct, but is checked by inspection + its own regression baselines, not diffed against Compose. Say this plainly in the docs.
4. **Production-ready means:** strict TypeScript, accessibility (TalkBack, VoiceOver, keyboard, font scale, reduce motion, RTL), performance budgets (§11), tests, docs, gallery, CI, versioned release. Not "works in the demo".
5. **UI-thread animation.** All animation runs on the UI thread (Reanimated 4 worklets). No JS-thread animation loops. No layout-thrashing state updates during gestures.
6. **No guessing about libraries.** Before using any third-party API, read its current docs/changelog (you have internet). Pin versions. Prefer fewer dependencies.
7. **Licensing hygiene.** Code ported from AndroidX (e.g., `graphics-shapes`, tokens) is Apache-2.0: keep license headers + a `NOTICE` file. Fonts: Roboto Flex (OFL), Material Symbols (Apache-2.0): `VERIFY` each license text before bundling. Include the disclaimer "Not affiliated with or endorsed by Google" in README and docs. Do not use Google logos.
8. **Do not silently lower a quality threshold.** If a diff can't pass after 3 genuine attempts, document in `KNOWN_DEVIATIONS.md` with evidence and continue; never loosen the global threshold without an ADR approved by Nasyx.
9. **Never fabricate results.** If a command fails, a test is flaky, or a device isn't available, say so in `PROGRESS.md`. Never claim a screenshot passed unless the report file exists.
10. **Never commit secrets.** npm tokens, signing keys, etc. stay out of the repo.

**Stop conditions (pause and ask Nasyx):** needs a paid account/credential; legal/licensing ambiguity; a spec contradiction between Compose and m3.material.io that affects public API; a fork in architecture that has no clear winner after a spike; Paper ships something that makes a scoped component pointless (see Day 0 gate).

---

## 2. HUMAN-IN-THE-LOOP CHECKPOINTS (ask Nasyx; otherwise decide yourself)

Ask on **Day 1**, in a single message, then proceed:

1. Package name + scope. Check npm availability first; propose 3 options (e.g. `react-native-material-expressive`, `@<scope>/m3e`, …).
2. License for the library itself (recommendation: MIT, same as Paper; Apache-licensed derived files keep their own header).
3. GitHub org/repo + whether to publish docs to GitHub Pages or a custom domain.
4. npm publish access (needs Nasyx's 2FA; agent prepares everything, Nasyx runs the final `publish` or provides a granular token via CI secrets).

Needed later (flag one week ahead): Play Store / TestFlight developer accounts if the gallery app is to be published (Day 47); npm token (Day 59).

Everything else: decide, log an ADR, move on.

---

## 3. RESEARCH FINDINGS (collected 2026-11-25)

### 3.1 Is there existing RN support for M3 Expressive?
- **No complete library exists.** Search found: React Native Paper v6 alphas (partial), a React-for-web library (`m3x`), several Flutter packages, and design-kit docs that merely suggest "use Paper + Reanimated springs". No RN library with shape morphing / wavy progress / loading indicator / split button / button groups / FAB menu / toolbars was found. (`VERIFY` on Day 0: search npm and GitHub again.)

### 3.2 React Native Paper — the competitor (**moving fast**)
- v6 is in alpha. `6.0.0-alpha.4` was released **2026-11-23**. Install: `npm install react-native-paper@alpha`. APIs can still change. Migration guide: `https://oss.callstack.com/react-native-paper/6.x/docs/guides/migration`.
- Expressive work so far: **Button** (alpha.2: sizes, shape, selected, iconPosition; default mode `filled`; `compact`/`uppercase`/`rippleColor` removed), **IconButton** (alpha.4: XS–XL sizes, round/square shapes that morph on press, toggle colors), **Appbar** flexible modes, **Checkbox** (48dp, own state layer + focus ring), keyboard **focus ring** on interactive components, TextInput Material 3 state colors, `reduceMotion` + `useReduceMotion()`, 48dp touch targets via `hitSlop`, motion/elevation/state tokens landed via a refactor chain (PRs #4917 state tokens, #4922 motion tokens, #4923 elevation tokens), RN 0.88 + Expo SDK 58 as CI target, Reanimated/Worklets peer-resolution headaches on older RN.
- Plan & merge order tracked in GitHub issue **#5150**; there is a Callstack Notion doc "React Native Paper — Foundation for MD3 Expressive".
- Known alpha.4 issues (opportunities): Dialog empty gap, web hover layer 0.05 vs spec 0.08, TextInput supporting-text RTL, theme generator docs outputting 5.x scheme.
- **Implication:** Paper will likely cover the "commodity" components (buttons, text fields, app bars, etc.) before stable. Our edge must be **fidelity** (diff-verified), **breadth** (the Expressive signature components Paper has not announced), and **polish**. Sources: `github.com/callstack/react-native-paper/releases` (alpha.2 → alpha.4), discussion #5284.

### 3.3 Material 3 Expressive on the Google side
- **Compose Material3 1.5.0 is stable** (blog: `https://m3.material.io/blog/compose-material-3-is-stable`). Newly stable Expressive pieces: split buttons, button groups, shape-morphing toggle buttons and chips, floating toolbars, wavy progress indicators, nested menu and segmented list items; expressive color schemes, shapes, motion; custom brand font across the entire type scale; better a11y/keyboard nav. Release notes: `https://developer.android.com/jetpack/androidx/releases/compose-material3` (expressive buttons/groups, text fields, chips, menus/submenus, time pickers, `MaterialShapes`, toolbars, expressive + segmented ListItem, new `material3-ripple` library with inset focus rings, `expressiveLightColorScheme` — `VERIFY` exact API names).
- Google I/O 2026 added: expressive layout/scaffold, 8dp spacing system, expressive lists/menus, expressive search / search app bar (via a third-party skill's notes; `VERIFY` at m3.material.io).
- **Therefore the full component list is the Compose Material3 1.5.0 public API + the m3.material.io component catalog.** Day 1 reconciles both into `COMPONENT_MATRIX.md`.

### 3.4 Motion (spring tokens) — cross-checked from 3 third-party ports of the Compose tokens
Stiffness / damping ratio (mass = 1). **`VERIFY` against Compose `MotionSchemeKeyTokens` / `SpringSpec` in the 1.5.0 sources** (one port also lists an extra `expressiveSpatialPress` and an AOSP spatial spring 380/1.0).

| Token | Stiffness | Damping ratio |
|---|---|---|
| standardSpatial fast / default / slow | 1400 / 700 / 300 | 0.9 |
| expressiveSpatial fast / default / slow | 800 / 380 / 200 | 0.6 / 0.8 / 0.8 |
| effects (standard and expressive) fast / default / slow | 3800 / 1600 / 800 | 1.0 (no overshoot) |

Rules from the docs: *spatial* = position/size/shape; *effects* = opacity/color; most motion uses `default` speed, small elements `fast`, large elements `slow`; expressive scheme overshoots, standard doesn't.

### 3.5 Shapes
- `androidx.graphics.shapes` provides `RoundedPolygon`, `CornerRounding`, `Cubic`, `Feature`, `Morph`, `toPath(progress)`. `MaterialShapes` holds **35** normalized predefined `RoundedPolygon`s: Arch, Arrow, Boom, Bun, Burst, Circle, ClamShell, Clover4Leaf, Clover8Leaf, Cookie12Sided, Cookie4Sided, Cookie6Sided, Cookie7Sided, Cookie9Sided, Diamond, Fan, Flower, Gem, Ghostish, Heart, Oval, Pentagon, Pill, PixelCircle, PixelTriangle, Puffy, PuffyDiamond, SemiCircle, Slanted, SoftBoom, SoftBurst, Square, Sunny, Triangle, VerySunny.
- Morph maps features by type (convex↔convex, concave↔concave) — this is the algorithmic core.
- **Existing ports to cross-check against:** Dart (`androidx_graphics_shapes`, `material_new_shapes`) and Rust (`frust-material`). **No JS/TS port was found** (`VERIFY` on npm). Plan: port from the AOSP Kotlin source to TypeScript worklets, golden-test against JVM output.

### 3.6 React Native platform facts
- **RN 0.88 (released 2026-10-19)** adds `fontVariationSettings` on `Text` and `TextInput` for both platforms (object or CSS string form, e.g. `{wght: 500}`). This unlocks Roboto Flex variable axes and Material Symbols axes (FILL/wght/GRAD/opsz) natively. Expo docs: Android variable weights need Android 10+ (older: default weight + synthetic bold); `ital` axis on Android 15+; Expo SDK 58 ≙ RN 0.88.
- **Reanimated 4** (stable since 2025-07-23): New Architecture only; worklets split into `react-native-worklets`; supports the three latest RN versions; Babel plugin is `react-native-worklets/plugin`; spring default behavior changed vs v3. As of search: 4.6.0 (2026-08-21) added RN 0.87 support; check the compatibility table for 0.88. Paper's alpha notes warn of `ERESOLVE` when Reanimated/Worklets ranges don't match RN: **pin exact compatible pairs in our example app and document the table**.
- **Skia:** the package is now **`react-native-skia`** (unscoped; formerly `@shopify/react-native-skia`), v3.7.x in Oct 2026. Some libs still require Skia 2.x: version constraints matter; read the current README.
- Compose renders on Android via the same Skia/android.graphics text stack that RN Views use, so **Android pixel parity is realistic**.

### 3.7 Unverified / to check on Day 0–2
`UNVERIFIED-1` exact current Compose API names for expressive theming. `UNVERIFIED-2` any RN M3E library released in the last 2 weeks. `UNVERIFIED-3` Reanimated version matrix for RN 0.88. `UNVERIFIED-4` Paper's component coverage in the latest alpha (diff against §8). `UNVERIFIED-5` Material Symbols distribution/subsetting options and license text. `UNVERIFIED-6` exact set of M3E components at m3.material.io vs Compose 1.5.0 (some Expressive specs exist before Compose APIs, and vice-versa).

---

## 4. COMPETITIVE STRATEGY (what "compete with Paper at release" means)

1. **Parity floor:** every component Paper v6 ships, we ship (including non-M3 helpers developers rely on: Portal, Surface, Avatar, Banner, DataTable, HelperText, List.Accordion, Drawer sections, ToggleButton…). Lowers migration friction. Tracked in the Day 0 gap matrix and re-run on Day 53.
2. **Fidelity moat:** every component has a published pixel-diff report against Compose 1.5.0 renders. Marketing line: *"Verified against Google's own Compose implementation."* Nobody else can say that for RN.
3. **Breadth moat:** the Expressive signature set (shape-morphing buttons/chips, button groups with neighbor "bump", split button, FAB menu, wavy progress, loading indicator, floating/docked toolbars, expressive sliders, carousels, expressive lists/menus, time picker scroll variant, adaptive scaffolds) all present at 1.0.
4. **Foundations moat:** a reusable `shapes` + `motion` + `tokens` core that apps can use directly (`MaterialShapes`, `Morph`, `useMotionScheme`).
5. **Migration moat:** a Paper→`<PKG>` migration guide + theme bridge; optional codemod.
6. **Docs/gallery moat:** live gallery app mirroring the official M3 catalog, a theme playground, GIF-rich README.
7. **Don't be hostile to Paper.** Be accurate and respectful in comparisons; cite their alpha status honestly.

---

## 5. ARCHITECTURE (proposed; confirm each as an ADR by the stated day)

### 5.1 Targets and floors (ADR-001, Day 1)
- New Architecture only (Reanimated 4 requires it). Hermes. TypeScript strict.
- RN floor: **0.81+** peer range, with capability detection: `fontVariationSettings` (0.88+) → full-fidelity typography; below that, degrade to static font weights and document it. Latest tested: 0.88 / Expo SDK 58.
- Platforms: **Android + iOS first-class**, **web via react-native-web best-effort** (compiles, renders, a11y reasonable; pixel gating only on Android).
- Android minSdk: match RN's floor; behaviors that need newer APIs (variable fonts ≥10, dynamic color ≥12) must have documented fallbacks.

### 5.2 Rendering strategy (ADR-002, decided by Day 7 spike)
- **Default:** plain RN `View`/`Text`/`Pressable` + Reanimated 4 shared values (corner radius, size, color, opacity animate natively).
- **Path-based drawing** (shape morph, loading indicator, wavy progress, shaped containers, internal icons): spike **Skia vs `react-native-svg` + Reanimated animatedProps**. Decide by: (a) worst-case frame time for a morphing path on a mid-range Android, (b) JS/UI-thread cost, (c) binary size added, (d) clipping children to a morphing path, (e) web story, (f) install friction (many apps already have `react-native-svg`). Record numbers in the ADR. Default expectation: Skia for continuously-animated paths; SVG for static icon paths. Whatever wins, hide it behind an internal `PathCanvas` abstraction so it's swappable.
- **Gestures:** `react-native-gesture-handler` for slider, sheets, carousel, swipe; `Pressable` + custom state machine for buttons (need hover/focus/press/drag/long-press states).
- **Overlays:** one `OverlayHost` (portal) system for Menu, Dialog, Tooltip, Snackbar, Sheets, with correct stacking, back-button/Escape handling (topmost only), focus trapping and restore, keyboard avoidance, insets.

### 5.3 Peer dependencies (ADR-003, Day 1; finalize Day 7)
Candidates: `react-native-reanimated@^4`, `react-native-worklets`, `react-native-gesture-handler`, `react-native-safe-area-context`, `react-native-svg` and/or `react-native-skia`. Minimize. Document an exact compatibility table (RN ↔ Reanimated ↔ Worklets ↔ Skia).

### 5.4 Monorepo layout
```
/
├─ packages/
│  ├─ <PKG>/                 # the library (src/: tokens, theme, motion, shapes, color, typography, primitives, components, hooks, a11y)
│  ├─ <PKG>-shapes/          # (optional split) pure-TS port of androidx.graphics.shapes — no RN dependency
│  └─ <PKG>-navigation/      # adapters for React Navigation / Expo Router (optional split)
├─ apps/
│  ├─ gallery/               # Expo (dev client) app: catalog of every component/state + theme playground
│  └─ reference-compose/     # Android Compose app: renders the SAME scenes with Material3 1.5.0 (truth)
├─ tools/
│  ├─ extract-tokens/        # reads Compose sources jar → docs/specs/*.json → generated TS
│  ├─ diff/                  # screenshot capture + comparison + HTML reports
│  └─ scenes/                # shared scene manifest (component × state × size × theme)
├─ docs/                     # playbook, progress, ADRs, specs, site
└─ .github/workflows/
```
Tooling: pnpm workspaces + Turborepo (or Nx; ADR), `react-native-builder-bob` for ESM/CJS/types, Changesets for versioning, ESLint + Prettier, Jest + React Native Testing Library, Maestro (or Detox) for device flows, Storybook-free (the gallery app is the catalog), Docusaurus/Starlight for docs.

### 5.5 Public API principles
- Idiomatic, typed, discoverable. Prefer enums-as-string-unions: `variant`, `size`, `shape`, `selected`, `toggleable`.
- Every visual value flows from the theme (tokens) — no magic numbers in components.
- All components accept `style` for the **outer** container, plus semantic override props (`colors`, `shapes`, `motion`) — never reach into `style` for values that need animating (lesson from Paper's alpha.3 change).
- `ref` forwarding, `testID`, a11y props pass-through, `hitSlop` honored.
- Polymorphic where natural (e.g., `Card` pressable or not).
- Compound components only where the spec has parts (`Card.Media`, `ListItem.Leading`, …), keep flat otherwise.
- Provider: `<M3Provider seedColor | colorScheme | dynamicColor motionScheme="expressive|standard" typography fonts reduceMotion="system|on|off" />`; hooks: `useTheme`, `useColorScheme`, `useMotionScheme`, `useShapes`, `useWindowSizeClass`, `useReduceMotion`.
- A **Paper-theme bridge** (`fromPaperTheme`) for migration.

### 5.6 Foundations to implement (details in the day plan)
- **Color:** `@material/material-color-utilities` (official HCT; never reimplement). All scheme variants (tonalSpot, vibrant, expressive, neutral, monochrome, fidelity, content, rainbow, fruitSalad), contrast levels, full role set (incl. `surfaceContainerLowest…Highest`, fixed colors), light/dark, Android 12+ dynamic color via a small native module with fallback. Golden-test role values against Compose output for fixed seeds.
- **Typography:** baseline + emphasized scales (`VERIFY` counts), Roboto Flex via `fontVariationSettings`, custom brand font support, font scaling, line-height/tracking parity with Compose tokens.
- **Shape:** corner scale tokens (incl. the Expressive additions `VERIFY`), `MaterialShapes` (35), `RoundedPolygon`/`Morph` TS port, shape containers.
- **Motion:** spring tokens (§3.4), duration + cubic-bezier easing tokens, `MotionScheme` (expressive/standard), spring hooks; reduce-motion → fades/instant.
- **Elevation & state:** levels, tonal surface, shadows (Android `elevation` ≈ Compose; iOS shadow emulation), state layers (hover/focus/pressed/dragged opacities `VERIFY`), ripple + inset **focus ring** (match Compose `material3-ripple`), 48dp touch target.
- **Icons:** Material Symbols (variable font; FILL/wght/GRAD/opsz) via `fontVariationSettings`; **internal icons (check, close, arrows, chevrons, etc.) ship as vector path data** so no component depends on the user installing an icon font. Pluggable `IconSource` for app icons.
- **Layout:** window size classes, 8dp spacing system, edge-to-edge insets, RTL, adaptive scaffolds.
- **Haptics:** optional integration point (Expressive recommends haptic feedback for key interactions); implement via injectable adapter so no hard dependency.

---

## 6. SPEC EXTRACTION PIPELINE (Day 2)

1. Download `androidx.compose.material3:material3:1.5.0` **sources JAR** (and `material3-adaptive`, `material3-adaptive-navigation-suite`, `material3-window-size-class`, `material3-ripple`, `androidx.graphics:graphics-shapes`) from Google Maven (`maven.google.com`). Unpack to `tools/extract-tokens/vendor/` (git-ignored; record versions + sha256).
2. Parse token Kotlin files (`*Tokens.kt`: Button*Tokens, IconButton*Tokens, Fab*Tokens, Chip*Tokens, Slider*Tokens, ProgressIndicator*Tokens, NavigationBar/Rail*Tokens, Toolbar*Tokens, Typography/Color/Shape/Elevation/Motion tokens, etc.) into `docs/specs/<component>.json`: `{ token, value, unit, source: "<file>:<line>", sourceVersion }`.
3. Generate `packages/<PKG>/src/tokens/generated/*.ts` (do not hand-edit; CI fails on drift).
4. For each component, **read the Compose implementation** (`Button.kt`, `ButtonGroup.kt`, `SplitButton.kt`, `LoadingIndicator.kt`, `ProgressIndicator.kt`, `FloatingToolbar.kt`, …) to capture *behavior* tokens can't express: layout rules, state transitions, which spring drives what, content padding formulas, min sizes, a11y semantics.
5. Cross-check against m3.material.io spec pages (JS-rendered SPA; use a headless browser) and note any divergence in `UNVERIFIED.md`.
6. Cross-check *only* against Flutter `material_3_expressive` (44–45 widgets, grouped like the official catalog) for component-inventory completeness.

---

## 7. PIXEL-PERFECT VERIFICATION SYSTEM (Day 3, then used daily)

**Goal:** For every `scene = component × variant × size × state × theme (light/dark, ≥2 seeds) × font scale (1.0, 1.3) × direction (LTR/RTL where relevant)`, render in Compose (truth) and RN (ours) on the same emulator and compare.

- **Device/emulator profile (frozen):** Android emulator, Pixel-class, fixed density (e.g., 420dpi / 2.625), fixed API level (record it; test matrix later), animations disabled for stills, locale en-US, font scale controlled per scene, no dynamic color unless the scene asks.
- **Same inputs:** both apps bundle the same Roboto Flex + Material Symbols files; same seed colors; same scene manifest (`tools/scenes/*.json`) drives both harnesses (a scene = props/state; the Compose app and the RN gallery each implement a scene renderer).
- **Capture:** `adb exec-out screencap` (or in-app capture of the scene root) at native resolution, crop to the scene bounds.
- **Compare:** `odiff` or `pixelmatch` with anti-aliasing detection. **Gate for static states: ≤ 0.05% differing pixels and zero differing *layout* edges (bounding boxes of non-background content must match to ±0 px).** Text is rendered by the same OS stack so it should match; investigate any text diff as a font-axis or metric bug.
- **Report:** HTML report per run with side-by-side, overlay, and diff heatmap; stored under `docs/diff-reports/<date>/`; summary table appended to `PROGRESS.md`. CI uploads reports as artifacts.
- **Motion verification (cannot be pixel-diffed in a still):**
  1. *Numeric:* sample the spring token trajectories from Compose (`SpringSpec` via a JVM test or on-device logging at fixed timestamps) and assert our worklet's values match within 1% at each sample.
  2. *Frame-sampled:* for signature animations (button press morph, switch thumb, loading-indicator morph, wavy indicator, FAB-menu expand, button-group bump), record both apps' screen at 60fps, extract frames at fixed timestamps (scripted touch via `adb shell input`/Maestro), and diff those frames with a looser threshold (≤ 0.5%).
- **iOS:** produce baseline screenshots from our own renders on a fixed simulator and track regressions; compare to the Android renders for *structural* sanity (not pixels); human review via the gallery.
- **Determinism checks (Day 3 exit):** render the same trivial scene 20× → zero diffs; prove the pipeline is stable before trusting it.
- **Failure handling:** diff fails → fix → re-run. After 3 real attempts → `KNOWN_DEVIATIONS.md` entry with evidence and a proposed owner decision.

---

## 8. SCOPE: COMPONENT INVENTORY (reconcile on Day 1 against Compose 1.5.0 + m3.material.io)

Everything below is **in scope for 1.0**. Names are indicative; the Compose public API is the naming authority for concepts (we use idiomatic RN prop names).

**Foundations & primitives:** M3Provider, theme/tokens, color schemes + dynamic color, typography, shape tokens, `MaterialShapes` + `RoundedPolygon`/`Morph`, motion scheme + spring hooks, elevation/shadows, state layers, ripple + focus ring, `Interactive` pressable primitive, `Surface`, `Text`, `Icon` (Material Symbols + internal path icons), `OverlayHost/Portal`, window size classes, haptics adapter.

**Actions:** Button (elevated/filled/tonal/outlined/text × XS–XL × round/square × toggle × leading/trailing icon, press shape-morph), IconButton (types × sizes × widths × toggle), ButtonGroup (standard + connected, press "bump"), SplitButton, FAB (small/regular/medium/large), ExtendedFAB, ToggleFAB + **FAB Menu**.

**Selection & input:** Checkbox (+ tri-state), RadioButton, Switch (expressive handle states + icon), Chips (assist/filter/input/suggestion, elevated, selection shape morph), SegmentedButton / connected button group (single/multi), **Slider** (standard/centered/range, sizes XS–XL, inset icon, value indicator, ticks/stop indicators, vertical), TextField (filled/outlined, label animation, supporting/counter/prefix/suffix/icons, error, multiline), **Search** (SearchBar, SearchView, search app bar), DatePicker (modal/docked/input/range), **TimePicker** (dial/input/scroll variant).

**Containment:** Card (elevated/filled/outlined, clickable), Carousel (multi-browse, uncontained, hero, center-hero, full-screen), Dialog (basic, full-screen), BottomSheet (standard/modal), SideSheet, ListItem (standard, expressive, **segmented**, swipeable), Divider, Menu (dropdown, nested/submenu, expressive grouped), Tooltip (plain/rich), Badge.

**Navigation & structure:** NavigationBar, NavigationRail (collapsed/expanded/modal), NavigationDrawer (standard/modal), Tabs (primary/secondary, scrollable), Top app bars (small, center-aligned, medium-flexible, large-flexible, search; scroll behaviors), BottomAppBar, **Toolbars** (docked, floating horizontal/vertical, with FAB), Scaffold, NavigationSuiteScaffold, list-detail & supporting-pane scaffolds (adaptive).

**Feedback:** Linear/Circular **progress** (determinate/indeterminate; flat + **wavy**), **LoadingIndicator** (morphing shapes; contained/uncontained), Snackbar (+ host/queue), Banner.

**Parity extras (Paper compatibility / dev needs):** Avatar, Portal, DataTable (expressive styling), HelperText, ToggleButton (legacy mapping), Drawer sections, Accordion/expandable list, Appbar legacy-compat wrappers, `Text` variants, `Surface` elevation API.

**Integrations:** React Navigation adapters (bottom tabs, native stack header, drawer), Expo Router example, optional Paper-theme bridge.

### 8.1 Per-component Definition of Done (all boxes, with evidence)
- [ ] Spec JSON extracted + Compose implementation read; open questions logged in `UNVERIFIED.md` (must be empty to finish).
- [ ] All variants/sizes/states implemented from tokens (no hardcoded values).
- [ ] Android pixel-diff pass for the full scene matrix (§7) — report linked in `COMPONENT_MATRIX.md`.
- [ ] Motion verified (numeric + frame-sampled where applicable).
- [ ] iOS checked (screenshots + behavior), shadows/fonts/safe areas verified.
- [ ] Accessibility: roles/states/labels/hints, 48dp targets, focus ring + keyboard/D-pad, screen-reader traversal order, font scale 200% no clipping, reduce-motion fallback, RTL, high-contrast sanity.
- [ ] Types: strict, documented props (TSDoc), no `any`, exported.
- [ ] Unit tests (logic, state machines) + render tests (RNTL) + a11y tests; coverage ≥ 90% for logic files.
- [ ] Gallery page with every variant/state + playground controls.
- [ ] Docs page (usage, props table auto-generated, a11y notes, differences from Paper).
- [ ] Perf check: no dropped frames in the gallery stress scene on the reference mid-range device (§11).
- [ ] No new `KNOWN_DEVIATIONS.md` entry without approval.

---

## 9. QUALITY, TOOLING, CI

- CI (GitHub Actions): typecheck, lint, unit tests, token-drift check, build (bob), size-limit, Android emulator diff job (nightly + on PRs touching components), iOS simulator build + snapshot job, docs build, `npm pack` install smoke test in a clean Expo app and a clean bare RN app.
- Bundle: `sideEffects: false`, ESM + CJS + types, `exports` map, per-component entry points where useful, tree-shaking verified by a test bundle.
- Supply chain: exact-pin dev deps, lockfile committed, `npm audit` clean, provenance-enabled publish, SBOM, `NOTICE`.
- Versioning: Changesets; `1.0.0-rc.N` before `1.0.0`.

### 9.1 Documentation wording rules (added 2026-11-26, U-25)

Text is **not** described as pixel-perfect. React Native's integer text pipeline guarantees a
sub-pixel residual even when the layout box is exact (ADR-010, D-001). Every doc, README, gallery
label, release note, and report follows these rules:

- **Never write "pixel-perfect text", "identical text", or "byte-identical text"** unless the
  measured exact-diff count is zero. State the mode instead: `faithful`, `matched`, or
  `compensated`.
- **Say what is measured**, with numbers: layout box height/width deltas, AA-aware pixels, text ink
  pixels, glyph count, `AA px / 1,000 ink px`, and `AA px / glyph`.
- **Use "layout-exact"** only when the text layout-box height delta is 0 px and the width delta is
  inside the documented bound (ADR-010: ≤5 px faithful, ≤1 px matched).
- **Apply the ±1 px baseline rule** explicitly where it is the cause (four matched-grid roles;
  see U-25.2). Do not hide it behind a rounded "0 px" claim.
- **Keep verification labels precise:** "Compose-verified" only for an Android pixel diff;
  "spec-verified" per ADR-005; "MCU-spec-verified" per ADR-009.
- **Example:** "Layout-exact (height Δ 0 px, width Δ 0.4 px); AA differs by 28.1% of text ink
  (6,682 px) on this dialog." Not: "Text is pixel-perfect."

---

## 10. DAY-BY-DAY EXECUTION PLAN (60 days)

> Format: **Day N — Title.** Tasks → **Exit:** evidence required to close the day.
> Each day ends with: update `PROGRESS.md`, `COMPONENT_MATRIX.md`, commit + push.

### PHASE A — FOUNDATIONS (Days 0–10)

**Day 0 — Orientation & competitive gate (no code).** Read this file fully. Verify `UNVERIFIED-1..6`. Re-check Paper's latest release + issue #5150 + their Notion foundation doc; build `docs/COMPETITOR_MATRIX.md` (Paper component × expressive status). Search npm/GitHub for any new RN M3E library. Reconcile §8 against Compose 1.5.0 API + m3.material.io + Flutter `material_3_expressive`; produce `COMPONENT_MATRIX.md` rows for every component. **Exit:** matrix files committed; a one-paragraph "what changed since the plan was written" note; if Paper covers >60% of our signature set already, **stop and ask Nasyx** before Day 1.

**Day 1 — Repo, tooling, decisions.** Ask the §2 questions in one message. Create monorepo (§5.4), strict TS, lint/format, bob build, Changesets, CI skeleton, example Expo app on RN 0.88/SDK 58 with pinned Reanimated/Worklets pair, copy this playbook to `docs/PLAYBOOK.md`, create all tracking files, ADR-001 and ADR-003 drafts. **Exit:** `pnpm install && pnpm build && pnpm test` green on a clean clone; gallery app boots on Android emulator + iOS simulator; CI green.

**Day 2 — Source of truth.** Implement §6 pipeline: fetch sources JARs, extract tokens to JSON, generate TS, drift check in CI. Cover color/type/shape/elevation/motion/state tokens + all component token files present. **Exit:** `docs/specs/*.json` exists for every token file; generated TS compiles; spot-check 20 random values against m3.material.io and log results.

**Day 3 — Reference harness & diff pipeline.** Build `apps/reference-compose` (Compose M3 1.5.0), the scene manifest format, the RN scene renderer in gallery, capture scripts, compare + HTML report. Bundle identical fonts in both. **Exit:** one trivial scene (colored rounded rect + text) renders identically (0 diff) 20×; report generated; emulator profile frozen and documented.

> **Follow-up (2026-11-26):** `U-23` resolved by measurement: the residual is RN-vs-Compose text-layout quantization (subpixel/linear flags and integer physical-pixel sizes/offsets), not an implementation defect. The existing AA-aware gate is unchanged. See `docs/evidence/day4/text-scaling/README.md` and `KNOWN_DEVIATIONS.md` D-001.

**Day 4 — Color system.** Integrate `material-color-utilities`; all scheme variants + contrast levels + full role set + light/dark; Android dynamic color native module with fallback; Compose-side script dumps role values for N seeds → golden JSON. **Exit:** role values match Compose goldens exactly (or within 1 RGB unit with documented reason) for ≥6 seeds × variants × light/dark; dynamic color works on an API 31+ emulator.

> **Closeout note (2026-11-26):** Compose 1.5.0 has no public seed→scheme or variant→scheme API. Defaults and API-31 dynamic colour are compared to Compose exactly; Compose's own role mapping is exercised via reflection with MCU tonal palettes for 6 seeds × 9 variants × light/dark (108 schemes, 0 differences); the seed generator is verified against MCU 0.4.0 `2021` goldens (432 schemes, 20,736 values, 0 differences). Generated schemes are **spec-verified**, never Compose-verified. See ADR-009 and `docs/evidence/day4/color/`.

**Day 5 — Typography.** Roboto Flex via `fontVariationSettings` (capability-detected); baseline + emphasized scales from tokens; custom brand font option; font scaling; fallback path for RN <0.88. Compose-side text scenes for every style. **Exit:** text scenes for all styles diff-pass (size, weight, width, tracking, line height); fallback path documented.

**Day 6 — Shapes core (pure TS).** Port `androidx.graphics.shapes` (`RoundedPolygon`, `CornerRounding`, `Cubic`, `Feature`, measuring/`Morph` + feature/`DoubleMapper` mapping) as worklet-safe code; `MaterialShapes` all 35. Compose JVM test dumps cubic control points for every shape and several morph progress values → golden JSON. **Exit:** all 35 shapes + ≥50 morph pairs × 5 progress values match goldens within 1e-4; Apache headers + NOTICE in place.

**Day 7 — Rendering spike & decision.** Implement `PathCanvas` on Skia and on SVG+Reanimated; benchmark a morphing 35-shape cycle, 10 concurrent morphs, clipping children; measure frame time, binary size, install friction. Write ADR-002 and finalize ADR-003 (peers). Build `Shape`, `MorphingShape`, `ShapeContainer` primitives. **Exit:** ADR-002 with numbers; shape gallery page showing all 35 shapes and animated morphs; diff-pass of static shapes vs Compose.

**Day 8 — Motion.** Spring tokens → solver; verify Reanimated `withSpring` vs analytic solution; if deviation >1% implement a custom analytic spring animation (`defineAnimation`) and use it. Easing/duration tokens; `MotionScheme` (expressive/standard); `useSpring`, `useSpatialSpring`, `useEffectsSpring`; reduce-motion mapping (fades). **Exit:** numeric traces for all 12 spring tokens match Compose within 1%; demo page with live comparisons; reduce-motion verified.

**Day 9 — Interaction primitives.** `Interactive` primitive (state machine: enabled/disabled, hovered, focused, pressed, dragged, long-press), state-layer opacities, ripple + inset focus ring matching `material3-ripple`, 48dp hit targets, elevation levels + tonal surfaces, Android elevation vs iOS shadow emulation, haptics adapter. **Exit:** state-layer + focus-ring + elevation scenes diff-pass on Android; iOS shadow screenshots reviewed.

**Day 10 — Provider, Surface, Text, Icon, layout, overlay. Foundation gate.** `M3Provider`, hooks, `Surface`, `Text`, `Icon` (Material Symbols axes + internal path icons), `OverlayHost/Portal` (stacking, back/Escape, focus trap/restore, insets, keyboard), window size classes, RTL utilities. **Exit (GATE):** every foundation item has docs + tests + diff evidence; `COMPONENT_MATRIX.md` foundations all DONE; Nasyx gets a progress summary.

### PHASE B — ACTIONS, SELECTION, INPUT (Days 11–24)

**Day 11 — Button (1/2).** All 5 types × sizes XS–XL × shapes; content padding rules; icon sizing; disabled/pressed/hovered/focused. **Exit:** static scene matrix diff-pass.
**Day 12 — Button (2/2).** Press shape-morph (round↔square↔pressed radius) with springs, toggle buttons (selected shape change), loading/progress content slot if in spec, a11y. **Exit:** motion verified; a11y checklist; docs + gallery.
**Day 13 — IconButton.** Types × sizes × widths × round/square × toggle + morph. **Exit:** DoD.
**Day 14 — ButtonGroup + SplitButton.** Standard group with neighbor "bump" interaction; connected group; split button (leading + trailing menu toggle with chevron rotation/shape changes). **Exit:** DoD incl. frame-sampled motion diff.
**Day 15 — FAB family.** FAB S/R/M/L, ExtendedFAB (expand/collapse on scroll), ToggleFAB, **FAB Menu** (items, stagger, close button morph). **Exit:** DoD.
**Day 16 — Checkbox, Radio, Switch.** Expressive handle sizes/states, icon-in-thumb, tri-state, state layers. **Exit:** DoD.
**Day 17 — Chips.** Assist/filter/input/suggestion, elevated, selection shape morph, leading/trailing icons, avatars, ChipGroup/flow. **Exit:** DoD.
**Day 18 — Segmented / connected selection groups.** Single/multi select, overflow behavior, sizes. **Exit:** DoD.
**Day 19 — Slider (1/2).** Layout engine (track, handle, stop indicators, ticks, value indicator), sizes XS–XL, standard + centered. **Exit:** static diff-pass.
**Day 20 — Slider (2/2).** Range slider, vertical, inset icon, gestures (RNGH, UI-thread), haptics ticks, a11y adjustable actions, RTL. **Exit:** DoD incl. gesture tests.
**Day 21 — TextField.** Filled/outlined, animated label, supporting/counter/prefix/suffix, leading/trailing icons, error, disabled, multiline, secure; IME/keyboard; RTL; a11y labelling. **Exit:** DoD.
**Day 22 — Search.** SearchBar, SearchView (expand/collapse transitions), search app bar; suggestions list integration. **Exit:** DoD.
**Day 23 — DatePicker.** Modal, docked, input, range; calendar layout/animation; locale/first-day-of-week; a11y. **Exit:** DoD.
**Day 24 — TimePicker. Phase B gate.** Dial, input, expressive scroll variant, 12/24h. **Exit (GATE):** Phase B components all DONE per §8.1; Android diff dashboard published; summary to Nasyx.

### PHASE C — CONTAINMENT, NAVIGATION, FEEDBACK (Days 25–37)

**Day 25 — Card, Divider, Badge.** **Exit:** DoD.
**Day 26 — ListItem family.** Standard, expressive, segmented (rounded container segmenting + selection morph), leading/trailing slots, swipe actions. **Exit:** DoD.
**Day 27 — Menu.** Dropdown, exposed dropdown, nested/submenu, expressive grouped menus, anchoring/flipping/insets, keyboard nav. **Exit:** DoD.
**Day 28 — Dialog, Tooltip, Snackbar.** Basic/full-screen dialog; plain/rich tooltip; snackbar host with queue/actions/long-text. **Exit:** DoD.
**Day 29 — Sheets.** Bottom (standard/modal) + side sheet; drag/velocity/snap points; gesture/scroll handoff; a11y escape. **Exit:** DoD.
**Day 30 — Carousel.** Multi-browse, uncontained, hero, center-aligned hero, full-screen; scroll-driven item sizing/shape. **Exit:** DoD; perf check with 200 items.
**Day 31 — Progress indicators.** Linear + circular, determinate/indeterminate, flat + **wavy** (amplitude/wavelength/phase animation), sizes, track gaps/stop indicators. **Exit:** diff-pass + motion verified.
**Day 32 — LoadingIndicator.** Morphing shape cycle (contained/uncontained), color roles, a11y (busy state). **Exit:** DoD with frame-sampled motion diff.
**Day 33 — NavigationBar & Tabs.** Expressive nav bar (label positions, badges, indicator morph), primary/secondary tabs, scrollable tabs. **Exit:** DoD.
**Day 34 — NavigationRail & Drawer.** Collapsed/expanded/modal rail; standard/modal drawer; item states; adaptive behavior. **Exit:** DoD.
**Day 35 — App bars.** Small, center-aligned, medium-flexible, large-flexible, search; scroll behaviors (pinned, enterAlways, exitUntilCollapsed), bottom app bar. **Exit:** DoD.
**Day 36 — Toolbars.** Docked, floating horizontal/vertical, with FAB, overflow, expand/collapse on scroll. **Exit:** DoD.
**Day 37 — Scaffolds & adaptive layout. Phase C gate.** Scaffold, NavigationSuiteScaffold, list-detail, supporting pane, edge-to-edge insets, window-size-class switching. **Exit (GATE):** all Phase C components DONE; adaptive demo works on phone, tablet emulator, foldable emulator.

### PHASE D — PARITY, INTEGRATION, PLATFORMS, DOCS (Days 38–50)

**Day 38 — Paper-parity extras.** Avatar, Banner, DataTable, HelperText, Portal API, ToggleButton mapping, Drawer sections, Accordion/expandable list, legacy `Appbar` compat, `Surface` API. Re-run competitor matrix. **Exit:** every Paper v6 component has an equivalent or a documented intentional omission.
**Day 39 — Navigation integrations.** React Navigation (bottom tabs, native stack header, drawer) adapters; Expo Router example; theme bridging (incl. dark mode + dynamic color). **Exit:** example apps run; docs.
**Day 40 — Accessibility audit #1.** TalkBack + VoiceOver scripted passes on every component, Android Accessibility Scanner, keyboard/D-pad traversal, font scale 200%, reduce-motion, RTL, high-contrast. File and fix defects. **Exit:** `docs/A11Y_REPORT.md` with per-component results; zero P0/P1 open.
**Day 41 — iOS fidelity pass.** Shadows, fonts, safe areas, haptics, scroll physics interplay, Dynamic Type, pointer/keyboard. Per-component iOS baselines in CI. **Exit:** iOS screenshot set reviewed; deviations explained in docs ("iOS: faithful, not Compose-diffed").
**Day 42 — Android compat matrix.** Test API 24→latest: variable-font fallback (<10), dynamic color (<12), edge-to-edge, predictive back, gesture nav, tablets/foldables, low-end device profile. **Exit:** matrix table with results; fixes merged.
**Day 43 — Web (react-native-web).** Compile + render all components; hover/focus/keyboard parity; Skia/SVG path web story; a11y semantics. **Exit:** web gallery builds and deploys to docs; limitations documented.
**Day 44 — Performance.** Benchmarks: mount time, 100-item list with interactive items, button-press latency, morph/wavy frame time, memory; compare with Paper v6 alpha on the same device. Optimize hotspots (memoization, worklet hygiene, avoiding JS-thread work during animation). **Exit:** budgets in §11 met; `docs/PERFORMANCE.md` with method + numbers.
**Day 45 — API review & bundle.** Prop-name consistency audit, TS ergonomics, defaults, deprecation policy, tree-shaking test, `exports` map, per-component entry points, size-limit budgets. **Exit:** API review doc; public API snapshot (api-extractor) committed.
**Day 46 — Visual regression CI hardening.** Nightly emulator diffs in CI, golden update workflow, flake triage (retries only for infra, never for diffs). **Exit:** CI shows stable diff job for ≥5 consecutive runs.
**Day 47 — Gallery app & playground.** Catalog mirroring the official M3 catalog structure; theme playground (seed color picker, scheme variant, contrast, motion scheme toggle, font scale, RTL, reduce-motion); build release APK; prep Play Store/TestFlight listing (ask Nasyx for accounts one week earlier). **Exit:** release builds produced; playground works.
**Day 48 — Docs site (1/2).** Docusaurus/Starlight site: getting started (Expo + bare), theming, motion, shapes, typography, color, dynamic color, accessibility, adaptive layout, FAQ. Auto-generated API pages from TS. **Exit:** site builds; all guides written.
**Day 49 — Docs site (2/2) & migration.** Per-component pages with live web examples and props; Paper→`<PKG>` migration guide + `fromPaperTheme` bridge (+ optional codemod); comparison page (honest, cited). **Exit:** every component documented; migration tested on a sample Paper app.
**Day 50 — Dogfooding apps.** Build 3 apps using only the library (Mail-style adaptive app, Settings/forms app, Media/home with carousels + toolbars). Log every friction point. **Exit:** friction list triaged; P0/P1 fixed or scheduled.

### PHASE E — HARDENING & RELEASE (Days 51–60)

**Day 51 — Bug bash A (actions/selection/input).** Real devices (≥3 Android incl. low-end, ≥2 iOS). Fix + add regression tests. **Exit:** zero P0/P1.
**Day 52 — Bug bash B (containment/navigation/feedback).** Same. **Exit:** zero P0/P1.
**Day 53 — Competitor re-check & gap closure.** Re-run Day 0 research on Paper/others; close any parity or fidelity gap discovered; update comparison docs. **Exit:** updated `COMPETITOR_MATRIX.md`; no uncovered parity item.
**Day 54 — Diff backlog zero.** Burn down every failing scene and every `UNVERIFIED.md` / `KNOWN_DEVIATIONS.md` entry (resolve or get Nasyx sign-off). **Exit:** both files empty or signed off; diff dashboard 100% green.
**Day 55 — Security & supply chain.** Dependency audit, license audit (`NOTICE`, fonts, icons), no secrets, provenance setup, SBOM, `npm pack` smoke tests in clean Expo + bare apps across RN 0.81/0.85/0.88. **Exit:** reports in `docs/SECURITY.md`; smoke tests green.
**Day 56 — Release candidate.** Version `1.0.0-rc.1`; changelog; docs freeze; publish RC (Nasyx runs publish or supplies CI token); announce to a small beta group; collect feedback. **Exit:** RC on npm; install instructions verified on a clean machine.
**Day 57 — RC feedback fixes.** Triage + fix; rc.2 if needed. **Exit:** no open P0/P1.
**Day 58 — Final gates.** Re-run every gate in §11 on the exact release commit: full diff suite, a11y, perf, size, API snapshot, docs links, gallery builds. **Exit:** `docs/RELEASE_CHECKLIST.md` fully ticked with evidence.
**Day 59 — Launch assets.** README with GIFs, comparison table, diff-report highlights, demo video script, Play Store gallery listing, social copy, docs site on custom domain. **Exit:** assets reviewed by Nasyx.
**Day 60 — Release `1.0.0`.** Tag, publish, GitHub release notes, docs deploy, post-release smoke test from npm in clean apps, open a "known issues + roadmap" issue. **Exit:** `1.0.0` installable; post-release smoke green; `PROGRESS.md` final entry.

---

## 11. RELEASE GATES (all must be true on the release commit)

1. **Fidelity:** 100% of Compose-backed scenes pass the Android diff gate (§7); 100% of spec-verified scenes pass their measured m3.material.io spec assertions and have a frozen self-regression baseline; `KNOWN_DEVIATIONS.md` empty or Nasyx-signed.
2. **Completeness:** every row of `COMPONENT_MATRIX.md` is DONE; every Paper v6 component has an equivalent or documented omission.
3. **Accessibility:** `A11Y_REPORT.md` zero P0/P1; keyboard + screen reader + 200% font + reduce-motion + RTL verified.
4. **Performance (targets; adjust only via ADR with measured evidence):** gallery stress scenes hold 60fps (120fps on capable devices) on the reference mid-range Android; no JS-thread animation work; button press → visual response within 1 frame; bundle cost per-component tree-shaken and published in docs.
5. **Quality:** strict TS, lint clean, test coverage ≥90% on logic, API snapshot committed, CI green including emulator diffs.
6. **Compatibility:** tested matrix (RN 0.81/0.85/0.88; Android API 24→latest; iOS min→latest; web best-effort) documented.
7. **Legal/supply chain:** NOTICE, licenses, disclaimers, audit clean.
8. **Docs:** every component documented; migration guide; gallery builds; docs site live.

---

## 12. RISKS & MITIGATIONS

| Risk | Mitigation |
|---|---|
| Paper ships expressive parity before we do | Day 0/53 gap checks; fidelity + breadth moats; parity floor (Day 38); stop-and-ask rule. |
| Spec drift (Google keeps changing Expressive) | Pin Compose 1.5.0 as the baseline; tokens generated; a `tools/extract-tokens` re-run on new Compose releases produces a reviewable diff. |
| Shape morph perf / clipping | Day 7 spike with numbers; `PathCanvas` abstraction keeps renderer swappable. |
| Reanimated/Worklets/RN version churn | Exact compat table, CI matrix on 3 RN versions, minimal peer surface. |
| Variable-font gaps on older RN/Android | Capability detection + documented fallback; fidelity claims scoped to RN ≥0.88 / Android ≥10. |
| Pixel diffs flake | Frozen emulator profile, determinism check (Day 3), no retries on diffs, separate infra flake handling. |
| Scope too large for 60 days | Gates at Days 10/24/37 force honest re-planning; slippage is logged, never hidden; cut *polish*, never *verification*. |
| Legal/trademark | Apache headers + NOTICE, disclaimer, no Google marks; ask Nasyx on any ambiguity. |
| Context loss in long session | §0 protocol: all state lives in repo files; re-read each day. |

---

## 13. APPENDICES

### A. Spring conversion note (Compose → Reanimated)
Compose spring: `stiffness k`, `dampingRatio ζ`, mass fixed at 1. Reanimated physics config: `mass m`, `damping c`, `stiffness k`. Use `m = 1`, `c = 2·ζ·√k`. Examples: expressiveSpatialDefault (k=380, ζ=0.8) → c ≈ 31.2; standardSpatialDefault (k=700, ζ=0.9) → c ≈ 47.6. **Do not trust the mapping — verify numerically (Day 8)**, and check Reanimated 4's new spring defaults and rest thresholds (`restDisplacementThreshold`, `restSpeedThreshold`) vs Compose's visibility threshold.

### B. Template: `COMPONENT_MATRIX.md`
```
| Component | spec | impl | android diff | motion | ios | a11y | tests | docs | gallery | DONE |
|-----------|------|------|--------------|--------|-----|------|-------|------|---------|------|
| Button    | [ ]  | [ ]  | [ ] report#  | [ ]    | [ ] | [ ]  | [ ]   | [ ]  | [ ]     | [ ]  |
```

### C. Template: `PROGRESS.md` entry
```
## Day N — <title> — YYYY-MM-DD
- Done: …
- Evidence: commit <hash>; diff report docs/diff-reports/…; tests …
- Deviations / slippage: …
- UNVERIFIED added/resolved: …
- Next: …
```

### D. Template: spec JSON record
```json
{ "component": "Button", "token": "ButtonSmallTokens.ContainerHeight", "value": 40, "unit": "dp",
  "source": "material3-1.5.0-sources.jar!/androidx/compose/material3/tokens/ButtonSmallTokens.kt:NN",
  "verifiedAgainst": ["m3.material.io/components/buttons/specs"], "notes": "" }
```

### E. Research source list (for traceability; re-open and re-verify)
- Compose Material 3 1.5.0 stable — `https://m3.material.io/blog/compose-material-3-is-stable`
- Compose Material3 release notes — `https://developer.android.com/jetpack/androidx/releases/compose-material3`
- `MaterialShapes` reference — `https://developer.android.com/reference/kotlin/androidx/compose/material3/MaterialShapes`
- `androidx.graphics.shapes` — `https://developer.android.com/reference/kotlin/androidx/graphics/shapes/package-summary` and `https://developer.android.com/develop/ui/compose/graphics/draw/shapes`
- Spring token cross-checks — `pub.dev` `motor` / `m3e_slider` / `material_3_expressive`; `docs.rs` `frust-material` (motion.rs, shapes/catalog.rs)
- Paper v6 releases — `https://github.com/callstack/react-native-paper/releases` (alpha.2, alpha.3, alpha.4), discussion #5284, issue #5150, PRs #4917/#4922/#4923
- RN 0.88 — `https://reactnative.dev/blog/2026/10/19/react-native-0.88`; text style props — `https://reactnative.dev/docs/text-style-props`; Expo fonts — `https://docs.expo.dev/develop/user-interface/fonts`
- Reanimated 4 — `https://swmansion.com/blog/reanimated-4-stable-release-the-future-of-react-native-animations-ba68210c3713`; changelog — `https://swmansion.com/changelog/react-native-reanimated/`
- Related (cross-check only): React-web `m3x` (`github.com/tankrap/m3x`), Flutter `material_3_expressive` (`pub.dev`), Expo `@pchmn/expo-material3-theme` (dynamic color reference)

*End of playbook.*
