# Architecture Decision Records

Status values: **Accepted**, **Proposed** (needs Nasyx), **Superseded**, **Rejected**.
Every accepted decision has a date and evidence. Day 0 decisions are research-only; no implementation is implied.

---

## ADR-000 — Pin the fidelity baseline to Compose Material3 1.5.0

- **Date:** 2026-11-25
- **Status:** Accepted (per playbook §1/§10)
- **Decision:** The reference baseline is:
  - `androidx.compose.material3:material3:1.5.0`
  - `androidx.compose.material3:material3-ripple:1.5.0`
  - `androidx.compose.material3:material3-window-size-class:1.5.0`
  - `androidx.compose.material3:material3-adaptive-navigation-suite:1.5.0`
  - `androidx.compose.material3.adaptive:{adaptive,adaptive-layout,adaptive-navigation}:1.3.0`
  - `androidx.graphics:graphics-shapes:1.1.0`
  - m3.material.io snapshot 2026-11-25.
- **Why:** 1.5.0 is the stable Expressive release. 1.6.0-alpha01 exists (2026-11-18) and would drift. The old `material3-adaptive` artifact is stale (1.0.0-alpha06); the new `androidx.compose.material3.adaptive` group at 1.3.0 is the current stable surface.
- **Alternatives rejected:** Track 1.6.0-alpha01 (unstable, API churn); use Flutter/web ports as truth (violates Core Rule 1); use Paper as truth (it is a competitor, not a reference).
- **Consequences:** Any 1.6 API is out of scope until an approved baseline bump. The extractor records versions + sha256 so a bump is a reviewable diff.

---

## ADR-001 — Targets and floors

- **Date:** 2026-11-25
- **Status:** Accepted (Day 1, per playbook §5.1)
- **Decision:**
  - **New Architecture only.** Fabric/TurboModules, Hermes. Reanimated 4 requires it; there is no legacy-architecture path and no plan to add one.
  - **Strict TypeScript** everywhere (`strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `isolatedModules`). No `any` in public types.
  - **RN peer floor `>=0.81.0`**; latest tested `0.88.1` (Expo SDK `58.0.26`). `fontVariationSettings` capability is detected at runtime: on 0.88+ use variable-font weights, below that fall back to static weights and record the degradation (U-14/U-19).
  - **Android + iOS first-class; web best-effort.** Web must compile and render; it is not pixel-gated. Pixel gating is Android-only (ADR-004 makes iOS structural/reference evidence).
  - **Android minSdk** follows RN 0.88's floor (24). Features that need a newer API — variable fonts (API 26+ for reliable `fontVariationSettings`), dynamic color (API 31+) — must ship documented fallbacks, not silent degradation.
  - **Node `>=22.14`**, pnpm `12.23.0` pinned via `packageManager`, Expo SDK 58 for the gallery.
- **Why:** This is the smallest supported surface that lets Reanimated 4, Worklets, and the New Architecture be assumed rather than branched around. Every extra supported permutation multiplies the diff/regression matrix.
- **Alternatives rejected:** Legacy architecture support (would require a separate animation engine and double the test matrix); RN <0.81 (no Worklets 0.13 guarantee); web-first (no Compose reference exists to diff against).
- **Consequences:** Apps on RN 0.80 or the old architecture cannot use 1.0. That is documented in the README and the migration guide, and checked by the `peerDependencies` range.

---

## ADR-002 — Rendering strategy: decide by Day 7 spike

- **Date:** 2026-11-25 (placeholder created Day 1)
- **Status:** **Open — decision due Day 7** (playbook §5.2)
- **Decision deferred:** Skia vs `react-native-svg` + Reanimated `animatedProps` for path-based drawing, behind an internal `PathCanvas` abstraction. Default RN views + Reanimated shared values for everything that can animate as corner radius/size/color/opacity.
- **Gate:** Day 7 spike must record frame time, UI/JS-thread cost, binary size, clipping behavior, web story, and install friction, then accept or reject Skia with numbers.
- **Consequences until then:** No component may import Skia or SVG directly. Only `PathCanvas` may, so the Day 7 decision is a one-file swap.

---

## ADR-003 — Peer dependencies (draft; finalize Day 7)

- **Date:** 2026-11-25
- **Status:** **Draft accepted for Day 1**; final pin Day 7 (playbook §5.3)
- **Draft peers:**
  - `react >=19.0.0`
  - `react-native >=0.81.0`
  - `react-native-reanimated >=4.0.0`
  - `react-native-worklets >=0.7.0`
  - `react-native-gesture-handler` — required only if the Day 7 gesture spike chooses it for slider/sheets/carousel; currently **not** a peer.
  - `react-native-safe-area-context` — same, pending the overlay/inset design.
  - `react-native-svg` / `react-native-skia` — must not be peers of the core package; they are implementation detail of `PathCanvas` (ADR-002), and only the chosen one becomes a peer (or an optional peer) on Day 7.
- **Gallery pin (not a library peer):** Expo SDK `58.0.26` → RN `0.88.1`, Reanimated `4.7.1`, Worklets `0.13.0`, React `19.3.0`.
- **Compatibility rule:** Reanimated and Worklets are upgraded only in the Expo-blessed pair; the compatibility table lives in `docs/research/DAY0_SOURCES.md` and is re-checked every Expo patch.
- **Why draft now:** The library must declare *something* to install in the gallery, but the rendering spike can legitimately add one peer. Declaring Skia/SVG now would pre-empt ADR-002.
- **Consequences:** 1.0's install story is "you already have Reanimated 4" — which is true for any Expo SDK 58 app. Any extra peer added on Day 7 must be justified in the ADR with install-friction numbers.

---

## ADR-004 — iOS reference harness uses Compose Multiplatform 1.13.0-rc01, as a reference only

- **Date:** 2026-11-25
- **Status:** **Accepted, subject to Day 3 runtime spike** (requested by Nasyx in the Day 0 addendum)
- **Decision:** Add `apps/reference-compose-ios` pinned to **Compose Multiplatform 1.13.0-rc01**, and extend `tools/diff` to capture iOS scenes. iOS diffs are **structural/reference evidence**, never the release gate. Components whose CMP source is not identical to AndroidX 1.5.0 are marked “inspect + baseline” rather than diffed, until the delta is understood.
- **Evidence:**
  - CMP `material3` **1.9.0** (last stable line) is missing `ButtonGroup`, `SplitButton`, `WavyProgressIndicator`, `LoadingIndicator`, `FloatingToolbar`, `MaterialShapes`, `FloatingActionButtonMenu`, and `ScrollField`.
  - CMP `material3` **1.13.0-rc01** contains all of those, plus `ScrollField`, `SecureTextField`, `PullToRefresh`, `ShortNavigationBar`, `WideNavigationRail`, `TimePicker`, `SegmentedButton`.
  - Source comparison against AndroidX 1.5.0: **245 shared `.kt` files, 235 byte-identical (95.9%)**. The 10 differing shared files are `BasicTooltip.kt`, `Checkbox.kt`, `MaterialTheme.kt`, `NavigationItem.kt`, `RadioButton.kt`, `ScrollField.kt`, `SearchBar.kt`, `ShortNavigationBar.kt`, `TimePicker.kt`, `WideNavigationRail.kt`.
  - `ScrollField.kt` is a real API delta: AndroidX 1.5.0 has an internal `ScrollFieldImpl` + configurable `field` slot; CMP 1.13 has an older/smaller surface. This component must be inspect/baseline on iOS, not diffed.
  - CMP 1.13.0-rc01 is a **release candidate**, not stable; CMP 1.13.0 must replace it on release.
- **Why:** This is the only way to get an iOS reference render for the Expressive set without waiting for CMP stable. Source identity is high enough to be useful for layout/shape/motion comparison, but iOS text (UIKit vs Android text stack), shadows, and safe areas make pixel equality unrealistic.
- **Alternatives rejected:** CMP 1.9.0 stable (missing 8 signature components); no iOS reference app (fails the addendum); use RN iOS vs Android Compose directly (meaningless pixel comparison across platforms).
- **Consequences:** Extra app + CI job; pin upgrades are explicit. Add this to the Day 3 exit evidence and Day 41 iOS pass. Do **not** claim “iOS pixel-perfect” in docs; say “iOS: faithful, Compose-reference-checked where source-identical; otherwise inspection + regression baselines.”

---

## ADR-005 — Components with no Compose reference cannot use the Android diff gate

- **Date:** 2026-11-25
- **Status:** **Accepted with conditions (Nasyx, 2026-11-25)**
- **Approved conditions:**
  1. These rows are **spec-verified**, never Compose-verified. The term `NCR` is retired; the matrix and docs use **spec-verified**.
  2. "Spec-verified" requires **measured m3.material.io assertions** — padding, size, radius, type, color role, state layers, and motion — recorded as `docs/specs/<component>.json` with a source URL + capture date per assertion. A row cannot be marked DONE with an empty spec file.
  3. Release Gate #1 is reworded: *"100% of Compose-backed scenes pass the Android diff gate; 100% of spec-verified scenes pass their measured spec assertions and have a frozen self-regression baseline."*
  4. Self-regression baselines are stored separately from fidelity diffs and are never presented as Compose evidence.
- **Problem:** §8’s parity floor includes `Banner`, `Avatar`, `DataTable`, `HelperText`, `Accordion`, and `SideSheet`. Compose Material3 1.5.0 has **no public API** for any of these (SideSheet has an m3 spec page but no Compose implementation; the others are Paper-only/M2 holdovers). §8.1 and Release Gate #1 require an Android pixel diff against Compose for every in-scope component. That is impossible for these rows.
- **Options:**
  1. **Diff against a frozen Paper v6 alpha.4 baseline.** Pros: real reference, catches API-parity visual drift. Cons: encodes Paper’s bugs as truth (Paper is explicitly not a fidelity authority); violates Core Rule 1.
  2. **Visual/a11y review only, with `reference: none` recorded in the matrix and docs.** Pros: honest; does not invent a false reference; keeps these as migration surfaces. Cons: release gate must explicitly exempt them; no pixel guarantee.
  3. **Drop them from 1.0.** Pros: gate stays pure. Cons: breaks the Paper parity promise; migration friction.
- **Recommendation (approved):** **Option 2**, plus a frozen screenshot baseline of *our own* implementation for regression only (not called a fidelity diff). Mark these rows **spec-verified** in `COMPONENT_MATRIX.md` and state the limitation prominently in docs. Keep SideSheet (m3 spec) in this bucket too, because there is no Compose implementation to render.
- **Why not Option 1:** Paper’s alpha has known visual bugs (Dialog gap, hover layer, RTL supporting text). Using it as truth would make us faithfully wrong.
- **Feasibility precedent (not truth):** the MIT Flutter port `material_3_expressive` 1.2.3 implements 39 component families including `side_sheets`, `toolbars`, and `carousel`; m3-spec-only surfaces are implementable. See `docs/research/DAY0_SOURCES.md` §10. Their values are still not citable (Core Rule 1).
- **Consequences (approved):** Release Gate #1 changes from “100% of in-scope scenes” to “100% of Compose-backed scenes pass the Android diff gate; all spec-verified surfaces pass measured m3 spec assertions and are regression-baselined.” This threshold change has explicit sign-off (Core Rule 8) and is recorded in the Day 1 progress entry.
- **Blocked work:** None. Spec-verified components are Day 38 scope; their spec JSON files are due with the implementation, not before.

---

## ADR-006 — Mirror Compose 1.5.0’s Expressive defaults; ship a generated dark scheme as a documented extension

- **Date:** 2026-11-25
- **Status:** **Accepted with conditions (Nasyx, 2026-11-25)**
- **Approved conditions:**
  1. Dark mode ships at **full quality**, not as a degrades-to-standard afterthought. It is generated from the **same seed** as the light scheme using `material-color-utilities` (official HCT), covering the full role set.
  2. The generated dark scheme is documented as **Expressive dark, not Compose-verified**: Compose 1.5.0 has no `expressiveDarkColorScheme()`, so there is no reference render. It must never be described as parity.
  3. Where a dark role has a Compose `darkColorScheme()` counterpart, check it against the standard dark values and record pass/fail in `docs/specs/color-dark.json`. Divergence is expected for expressive tonal mappings and must be explained, not hidden.
  4. The default `MaterialExpressiveTheme` behavior stays faithful: expressive light + standard dark + standard `Typography()`. The generated expressive dark is opt-in via `expressiveDarkColorScheme(seed)` / `themeMode="expressive"`.
- **Decision:**
  - Light defaults to `expressiveLightColorScheme()` + `MotionScheme.expressive()` + `Shapes()` + **standard `Typography()`**, exactly like Compose 1.5.0.
  - Standard dark uses `darkColorScheme()`.
  - The generated `expressiveDarkColorScheme(seed)` ships as a first-class, documented API (condition 1), marked non-reference.
  - Expose the 15 **emphasized** type styles from `TypeScaleTokens`/`TypographyTokens` as opt-in tokens. Do **not** make them the default, because Compose 1.5.0’s `MaterialExpressiveTheme` still has `// TODO: replace with calls to Expressive typography default` and passes `Typography()`.
- **Evidence:**
  - `ColorScheme.kt:1172` defines only `expressiveLightColorScheme()`. No `expressiveDarkColorScheme` exists in 1.5.0.
  - `MaterialTheme.kt:238` `MaterialExpressiveTheme`; line ~264 has the typography TODO.
  - `TypeScaleTokens.kt`/`TypographyTokens.kt` contain `*Emphasized` styles (15), but they are not wired into the default theme.
- **Alternatives rejected:** Invent an expressive dark scheme and present it as default parity (unsourced, violates Core Rule 1); make emphasized typography default (would not match Compose renders); ship no expressive dark at all (rejected by Nasyx: dark must be full quality).
- **Consequences:** Our opt-in expressive dark may look different from marketing expectations, but it is generated, seed-stable, and honestly labeled. Default dark remains Compose-faithful. Revisit when Compose ships a dark Expressive scheme.

---

## ADR-008 — npm publishing: manual 1.0.0 with 2FA, then trusted publishing (OIDC)

- **Date:** 2026-11-25
- **Status:** Accepted
- **Decision:**
  - **1.0.0 is published manually by Nasyx with 2FA** from a clean, tagged checkout. This is required anyway: npm cannot configure a trusted publisher for a package that does not exist yet.
  - After 1.0.0 exists, configure a **trusted publisher** for `nasyx-rakeeb/react-native-material-expressive`, workflow file `publish.yml`, environment `npm-release`.
  - All later releases use **`npm stage publish`** from GitHub Actions with `id-token: write`, OIDC, and automatic provenance. A maintainer approves the staged release with 2FA (`npm stage approve`). No long-lived npm token is stored in the repo or in GitHub secrets.
  - Requirements: npm CLI `>=11.5.1`, Node `>=22.14`, GitHub-hosted runners.
  - `.github/workflows/publish.yml` is committed now but is inert until the trusted publisher is configured; it is not wired to npm before the package exists.
- **Why:** OIDC + staged publishing gives provenance without a token that can leak, and still keeps a human 2FA approval in the release path. Matches how npm recommends publishing today.
- **Alternatives rejected:** Granular automation token in GitHub secrets (rotation burden, exfiltration risk); publish from a laptop for every release (no provenance, no reproducibility).
- **Consequences:** Release cadence requires a GitHub Actions run plus manual approval. If GitHub Actions is unavailable, the fallback is a manual 2FA publish, documented in the release runbook. Provenance attestations are public on npm for every OIDC release.

---

## ADR-007 — ButtonGroup is the primary selection-group API; SegmentedButton is legacy

- **Date:** 2026-11-25
- **Status:** Accepted (source-backed)
- **Decision:** Public API leads with `ButtonGroup` (standard + connected, single/multi/selection-required) and `SplitButton`. `SegmentedButton` remains available only as a legacy/migration surface, marked deprecated in docs and gallery, with a pointer to ButtonGroup.
- **Evidence:**
  - m3 button-groups: “Connected button groups replace the segmented button… Segmented buttons… are deprecated in the expressive update.”
  - m3 segmented-buttons: “no longer recommended in the Material 3 expressive update… use the connected button group instead.”
  - Compose 1.5.0 still ships `SegmentedButton.kt` for compatibility.
  - Paper #5150 D8: `SegmentedButtons` deprecated in 6.1, removed in 7.0; ConnectedButtonGroup in 6.1.
- **Consequences:** Do not build new expressive behavior into SegmentedButton. It still needs a11y/tests/docs because Paper users will migrate from it.

---

## ADR-009 — Colour verification boundary: Compose-exact defaults/dynamic, MCU-spec-verified generated schemes

- **Date:** 2026-11-26
- **Status:** Accepted for Day 4 implementation; **flagged to Nasyx for confirmation** (no threshold or fidelity gate is changed)
- **Context:**
  - The Day 4 plan asks for Compose goldens for **N seeds × variants × light/dark**. Compose Material3 **1.5.0 has no public seed-to-scheme or variant-to-scheme API**. The public dynamic functions take a `Context`; the internal API-31/34 helpers take a `TonalPalette`, not a seed, and expose no variant or contrast parameter.
  - `@material/material-color-utilities@0.4.0` is the current reference implementation for seed → tonal palettes → 48-role schemes. It supports 9 variants, contrast `-1..1`, light/dark, and spec versions `2021`/`2025`.
  - MCU 0.4.0’s `2021` spec is a **later revision** than the mapping in Compose 1.5.0 and `com.google.android.material:material:1.11.0`: for non-fidelity light schemes, the revised spec uses on-container tone 30 (e.g. `onPrimaryContainer` `#4D3D75` for the default tonal-spot palette), while Compose/API-31 and material-java use tone 10 (e.g. `#201047`).
- **Decision:**
  1. **Default schemes** (`lightColorScheme()`, `darkColorScheme()`, `expressiveLightColorScheme()`) remain extracted Compose 1.5.0 tokens and are compared to a Compose device dump **exactly**. They are the only schemes claimed as Compose-token-exact.
  2. **Native dynamic colour** is compared **exactly** to Compose’s `dynamicLightColorScheme` / `dynamicDarkColorScheme` on API 31. API 34+ role resources are source-mapped and remain an open verification item (U-24).
  3. **Seed-generated schemes** use MCU 0.4.0 with `specVersion: '2021'`, all 9 variants, contrast `-1..1`, all 48 roles, light/dark. They are verified against **MCU goldens**, not Compose goldens, and must never be described as Compose-verified.
  4. **Compose role mapping** is verified separately by feeding the MCU tonal palettes into Compose’s internal `dynamicLightColorScheme31` / `dynamicDarkColorScheme31` through reflection, including Compose’s own intermediate-tone derivation. This exercises Compose’s role table and tone mapping for 6 seeds × 9 variants × light/dark without pretending Compose has a seed API.
  5. **`material` 1.11.0** is recorded as an independent Java oracle cross-check only. It implements the earlier on-container mapping and is **not** a release gate; divergence is expected and documented.
- **Evidence:**
  - `docs/evidence/day4/color/compose-dump.json` — Compose defaults, device dynamic schemes, 54 mapped palettes (108 schemes), and the Java oracle dump.
  - `docs/evidence/day4/color/mcu-goldens.json` — 432 MCU schemes × 48 roles.
  - `docs/evidence/day4/color/native-dynamic-payload.json` — API 31 release-app payload.
  - `docs/evidence/day4/color/java-oracle-summary.json` — generated comparison; at standard contrast **321 / 5,184** role values differ (6.19%), concentrated in nine roles; across all contrast levels **5,740 / 20,736** differ (27.68%).
  - `packages/react-native-material-expressive/src/color/__tests__/composeGoldens.test.ts` and `mcuGoldens.test.ts` — executable gates.
- **Why:** This is the strongest honest verification available without inventing a Compose API. It keeps the Compose fidelity claim narrow and auditable, while still shipping a complete, seed-stable Material colour generator.
- **Alternatives rejected:**
  - Treat MCU-generated schemes as “Compose goldens” (false; Compose has no seed API).
  - Make the generator imitate Compose’s older tone-10 mapping (would abandon the current Material spec, fixed roles, and contrast levels).
  - Drop seed/variant generation until Compose ships an API (fails ADR-006 and the product requirement).
- **Consequences:**
  - Day 4 exit is met under this boundary. No pixel threshold, scene, or fidelity baseline is changed.
  - Generated expressive dark remains opt-in (ADR-006); it is now explicitly MCU-2021-spec-verified.
  - `KNOWN_DEVIATIONS.md` D-002 records the on-container tone drift so no later doc can accidentally claim full Compose parity for generated variants.
  - The default provider still ships expressive light + standard dark; `mode="expressive"` switches only the dark side to the generated expressive scheme. A seed-generated light scheme requires `createColorScheme()` + `lightScheme`.

---

## ADR-010 — Text-category metric: ink-normalized AA plus a documented baseline rule

- **Date:** 2026-11-26
- **Status:** **Proposed — do not apply until Nasyx approves.** No gate, threshold, scene, or token is changed by this ADR.
- **Context:**
  - The PLAYBOOK §7 gate is `≤0.05%` AA-aware differing pixels of the **whole image** plus **zero** differing content-bbox edges. That is appropriate for solid/rect/shadow scenes, where the content fills a large part of the image.
  - For text it is the wrong denominator. On the 30 one-line type scenes (`840×525 = 441,000 px`, budget `220.5 px`), the faithful run has **17,798 AA px** — **10.64% of the text ink** but only **0.040% of the image**. The 0.05% image budget is smaller than the AA difference of a single 14sp label (`labelLarge` alone is 397 AA px), so any Day 11 component with a text label would fail even when its geometry is exact.
  - The matched-grid run (Compose `TextMotion.Animated`, integer physical font sizes, floored offsets) shows the achievable parity: **269 AA px**, **0.16% of ink**, 26/30 byte-identical, four scenes with a **+1 px** baseline (explained in U-25.2).
  - The faithful residual is inherent to RN's integer text pipeline: font size is `ceil`ed, line height and half-leading are integer, letter spacing is converted to em against the integer size; the faithful run also differs in rasterization mode (Compose `TextMotion.Static` hints with subpixel positioning off, RN is linear with subpixel on). U-25.1 measured four compensation strategies; none is a shippable, string- and density-independent fix.
- **Decision (proposed):**
  1. **Separate category.** Text scenes and components with text are gated in a **text category** with the metric below. Non-text pixels in the same render keep the existing `≤0.05%` image-area gate. The standard five-scene gate is unchanged.
  2. **Geometry.**
     - Component layout box: **±0 px**, unchanged.
     - Text layout box: **height Δ = 0 px**; **width Δ ≤ 5 px faithful / ≤ 1 px matched**. Measured: faithful max **4.57 px** (24/30 > 1 px, 18/30 > 2 px, 0/30 > 5 px); matched max **1.97 px** (17/30 > 1 px, 0/30 > 2 px); height max **0.00001 px**.
     - Ink bbox: vertical edges **±1 px** (the documented baseline rule; cause and arithmetic in U-25.2). Horizontal edges are reported and bounded by the layout-width rule above. A strict ±0 px ink bbox is not achievable in faithful mode without per-role compensation; if Nasyx requires it, the only path is the C4-style lookup table, which this ADR does **not** recommend.
  3. **AA budget, normalized by text ink and glyph count.** `AA_px` is the AA-aware differing pixel count inside the union of text ink (pixels that are not exactly the scene background). The budget is the **tighter** of an ink ratio and a per-glyph cap:
     - **Faithful (shipped styles):** `AA_px ≤ 450 per 1,000 ink px` **and** `AA_px ≤ 250 per glyph`. Measured maxima: **410 per 1,000** (`labelMediumEmphasized`, 41.00%) and **229.9 per glyph** (`displaySmallEmphasized`). Headroom ≈ 9%.
     - **Matched (diagnostic parity reference):** `AA_px ≤ 15 per 1,000 ink px` **and** `AA_px ≤ 15 per glyph`. Measured maxima: **12.7 per 1,000** (`headlineSmall`, 1.27%) and **13.1 per glyph** (`displaySmallEmphasized`).
     - **Compensated (only if a compensation layer is separately approved):** `AA_px ≤ 150 per 1,000 ink px` **and** `AA_px ≤ 25 per glyph`. The measured C4 run is **21/21**, **994 AA px**, maxima **131.9 per 1,000** (`bodySmall`, 13.19%) and **22.3 per glyph** (`displaySmallEmphasized`). C4 is a per-string fit and is **not** proposed for shipping by this ADR.
  4. **Reporting.** Every text report states the mode (faithful/matched/compensated), the ink pixel count, the glyph count, `AA_px`, `AA_px / 1,000 ink`, `AA_px / glyph`, the layout width/height deltas, and the ink-bbox deltas. It never says "pixel-perfect text"; it says, for example, "layout-exact; AA differs by 28.1% of text ink (6,682 px) on this dialog".
- **Measured roles (all 30, 8-glyph `"Material"` sample):**

| Role | sp / line / weight | Faithful AA px | Faithful AA / ink | Faithful AA / glyph | Matched AA px | Matched AA / ink | Matched AA / glyph |
|---|---:|---:|---:|---:|---:|---:|---:|
| bodyLarge | 16 / 24 / 400 | 5 | 0.25% | 0.6 | 0 | 0.00% | 0.0 |
| bodyMedium | 14 / 20 / 400 | 676 | 40.58% | 84.5 | 0 | 0.00% | 0.0 |
| bodySmall | 12 / 16 / 400 | 334 | 26.38% | 41.8 | 0 | 0.00% | 0.0 |
| displayLarge | 57 / 64 / 400 | 2745 | 12.79% | 343.1 | 0 | 0.00% | 0.0 |
| displayMedium | 45 / 52 / 400 | 1629 | 11.98% | 203.6 | 0 | 0.00% | 0.0 |
| displaySmall | 36 / 44 / 400 | 949 | 10.60% | 118.6 | 63 | 0.70% | 7.9 |
| headlineLarge | 32 / 40 / 400 | 3 | 0.04% | 0.4 | 0 | 0.00% | 0.0 |
| headlineMedium | 28 / 36 / 400 | 993 | 17.56% | 124.1 | 0 | 0.00% | 0.0 |
| headlineSmall | 24 / 32 / 400 | 58 | 1.39% | 7.3 | 53 | 1.27% | 6.6 |
| labelLarge | 14 / 20 / 500 | 397 | 21.83% | 49.6 | 0 | 0.00% | 0.0 |
| labelMedium | 12 / 16 / 500 | 375 | 27.57% | 46.9 | 0 | 0.00% | 0.0 |
| labelSmall | 11 / 16 / 500 | 219 | 18.58% | 27.4 | 0 | 0.00% | 0.0 |
| titleLarge | 22 / 28 / 400 | 598 | 16.86% | 74.8 | 0 | 0.00% | 0.0 |
| titleMedium | 16 / 24 / 500 | 2 | 0.09% | 0.3 | 0 | 0.00% | 0.0 |
| titleSmall | 14 / 20 / 500 | 397 | 21.83% | 49.6 | 0 | 0.00% | 0.0 |
| bodyLargeEmphasized | 16 / 24 / 500 | 5 | 0.22% | 0.6 | 0 | 0.00% | 0.0 |
| bodyMediumEmphasized | 14 / 20 / 500 | 326 | 17.92% | 40.8 | 0 | 0.00% | 0.0 |
| bodySmallEmphasized | 12 / 16 / 500 | 311 | 22.87% | 38.9 | 0 | 0.00% | 0.0 |
| displayLargeEmphasized | 57 / 64 / 500 | 1236 | 5.01% | 154.5 | 0 | 0.00% | 0.0 |
| displayMediumEmphasized | 45 / 52 / 500 | 1696 | 10.95% | 212.0 | 0 | 0.00% | 0.0 |
| displaySmallEmphasized | 36 / 44 / 500 | 1839 | 17.90% | 229.9 | 105 | 1.03% | 13.1 |
| headlineLargeEmphasized | 32 / 40 / 500 | 1 | 0.01% | 0.1 | 0 | 0.00% | 0.0 |
| headlineMediumEmphasized | 28 / 36 / 500 | 714 | 11.19% | 89.3 | 0 | 0.00% | 0.0 |
| headlineSmallEmphasized | 24 / 32 / 500 | 51 | 1.08% | 6.4 | 48 | 1.01% | 6.0 |
| labelLargeEmphasized | 14 / 20 / 700 | 474 | 21.65% | 59.3 | 0 | 0.00% | 0.0 |
| labelMediumEmphasized | 12 / 16 / 700 | 663 | 41.00% | 82.9 | 0 | 0.00% | 0.0 |
| labelSmallEmphasized | 11 / 16 / 700 | 397 | 27.65% | 49.6 | 0 | 0.00% | 0.0 |
| titleLargeEmphasized | 22 / 28 / 500 | 222 | 5.51% | 27.8 | 0 | 0.00% | 0.0 |
| titleMediumEmphasized | 16 / 24 / 700 | 9 | 0.33% | 1.1 | 0 | 0.00% | 0.0 |
| titleSmallEmphasized | 14 / 20 / 700 | 474 | 21.65% | 59.3 | 0 | 0.00% | 0.0 |
| **Total (240 glyphs)** | — | **17,798** | **10.64%** | **74.2** | **269** | **0.16%** | **1.1** |

  Ink is the Compose non-background pixel count for the 8-glyph sample; matched ink totals 167,475 px. Per-role layout deltas are in `docs/evidence/day5/typography/README.md`.
- **Projections (at 420 dpi, 2.625×; glyph counts include spaces):**

| Screen | Text | Glyphs | Ink px | Faithful AA px | Faithful / ink | Faithful / image | C4 AA px | C4 / ink | Matched AA px | Matched / ink |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Dialog | `headlineSmall` "Delete file?" (12) + `bodyMedium` 71-char body + two `labelLarge` actions (12) | 95 | 23,777 | 6,682 | 28.1% | 1.515% | 107 | 0.4% | 80 | 0.3% |
| List (3 items) | 3 × `bodyLarge` "Project files" (13) + 3 × `bodyMedium` "Updated 2 hours ago" (19) | 96 | 21,757 | 4,841 | 22.2% | 1.098% | 78 | 0.4% | 0 | 0.0% |

  Image percentages use the 441,000 px scene; the current 0.05% budget is 220.5 px. The faithful dialog and list are **30× and 22× over** the image budget, but **inside** the proposed 450/1,000 ink and 250/glyph caps. The matched dialog's 80 px is almost entirely the `headlineSmall` +1 px baseline (12 glyphs × 6.6 px/glyph).
- **Why this is the right denominator:** a sub-pixel baseline/size shift changes the pixels on glyph **edges**, whose count scales with glyph perimeter (≈ font size × glyph count), not with image area. The measured `AA/glyph ÷ font px` is **0.48–2.63** across the 21 failures (the top group is **2.29–2.63**: `displayLarge`, `bodyMedium`, `displaySmallEmphasized`, `labelMediumEmphasized`) and **≈0** for roles whose font size and line height are integer-exact. Ink and glyph normalization capture that; image area does not.
- **Alternatives rejected:**
  - **Keep the image-area gate for text.** Fails every realistic dialog/list and any Day 11 component with a 14sp label; would force per-component thresholds, which is less honest than one text metric.
  - **Require byte-identical text.** Impossible without replacing RN's text engine; the matched grid still has four +1 px baselines.
  - **Drop the 30 type scenes.** Loses regression coverage for tokens, weights, line heights, and the font fallback.
  - **Ship C2/C4 per-role compensation.** String- and density-specific; changes shipped token values; overfits one 8-glyph sample. Rejected for 1.0.0.
  - **Gate on exact pixels only.** Ignores the AA residual that the product actually ships; contradicts the existing AA-aware pipeline.
- **Consequences if approved:**
  - Day 11 components with text can be diffed with a meaningful budget; non-text geometry stays at ±0 px.
  - Reports and docs must use the wording rule in PLAYBOOK §9.1: never "pixel-perfect text"; state the mode, ink, glyphs, and measured AA ratio.
  - The faithful budget is a **regression ceiling**, not a parity claim. The matched grid remains the parity reference.
  - The C4 tier stays unused unless a compensation layer is separately approved; if approved, the budget tightens to 150/1,000 ink and 25/glyph.
- **Evidence:** `docs/evidence/day5/typography/compensation/README.md` (D-001 pipeline + C1–C4), `docs/evidence/day5/typography/baseline/README.md` (+1 px baseline arithmetic), `docs/evidence/day5/typography/README.md` (30-role faithful/matched tables), `docs/evidence/day5/typography/compensation.json`, `runs/{faithful,matched-grid}/results.json`.
