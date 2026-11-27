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

## ADR-002 — Path rendering: `react-native-svg` for 1.0.0, Skia rejected

- **Date:** 2026-11-26 (placeholder created Day 1; decided Day 7)
- **Status:** **Accepted for 1.0.0.** The functional decision is final. The physical-device frame-time confirmation is tracked by `U-29` and does not reopen the renderer choice by itself.
- **Context:** Shape morphs, shaped containers, loading indicators, wavy progress and internal path icons need path drawing. The candidates were `react-native-skia@3.13.1` and `react-native-svg@15.16.0` driven by Reanimated 4 `useAnimatedProps` / `useDerivedValue`, both behind the `PathCanvas` boundary. Everything that can animate as corner radius, size, colour or opacity stays a plain RN view with shared values.
- **Decision:** `react-native-svg` is the 1.0 path renderer. `react-native-skia` is not a dependency of the library. `PathCanvas.tsx` remains the only file that imports a path renderer, so a future swap is still one file plus an ADR.
- **Evidence:**
  1. **Binary size.** Release APK, `arm64-v8a`, measured with `unzip -l`: SVG adds `libreact_codegen_rnsvg.so` = **771,984 B (0.77 MB)**. Skia adds `librnskia.so` 13,961,504 B + `libwebgpu_dawn.so` 15,818,592 B = **29,780,096 B (29.78 MB)**. Across the four packaged ABIs Skia adds **115,468,444 B** of native libraries. Skia pulls Dawn even though the spike never uses WebGPU. Full measurements: `docs/evidence/day7/renderer/README.md`.
  2. **Build and install friction.** Skia compiled native code from source on the first Day 7 release build (**14m 25s**). SVG's native artifact ships prebuilt; JS-only rebuilds of the same gallery took **59s–2m 35s**. Both renderers built, installed and ran on `emulator-5554` (API 31), release/Hermes, New Architecture, RN 0.88.1. `react-native-svg` is already present in most Expo/RN apps; Skia adds a large native dependency plus Dawn.
  3. **Clipping RN children — the deciding functional constraint.** `ShapeContainer` must clip arbitrary React Native views to a morphing path. SVG does this with `clipPath` + `foreignObject`: the device capture shows three RN band views and an RN `Text` clipped to the morph. Skia's `Group clip` clips only Skia-drawn content; RN children are outside its canvas and cannot be clipped without rasterizing the child tree. Screenshots: `docs/evidence/day7/clipping/`.
  4. **Frame time (emulator-only / SwiftShader).** 35-shape morph cycle: avg **16.69 ms** SVG / **16.72 ms** Skia. Ten concurrent morphs: avg **16.67 ms** / **16.67 ms**. Clipped gradient: avg **16.67 ms** / **16.68 ms**. Both renderers sit at the 60 Hz vsync ceiling; repeat runs varied by ≤0.07 ms on average and maxima ranged from 16.67 ms to 83.33 ms (scheduling noise). These numbers cannot separate the renderers and are **not** a production performance claim. Details: `docs/evidence/day7/frame-times.md`.
  5. **JS/UI-thread cost.** No per-frame JS-thread work is required by either implementation: progress is a shared value and interpolation runs in a UI-thread worklet. SVG spends UI-thread time building the path string; Skia spends it in `PathBuilder`. The spike did not isolate those costs, and the emulator is vsync-bound, so no numeric winner is claimed.
  6. **Web story.** SVG maps to `react-native-svg`'s react-native-web implementation; Skia web needs CanvasKit/WASM assets. The web target is best-effort and is verified on Day 43, not here.
- **Alternatives rejected:** Skia (size, from-source build, and it cannot clip RN children); shipping both renderers (two native dependencies and two code paths with no measured benefit); rasterizing children to an image for Skia clipping (blurs text, breaks accessibility and dynamic content).
- **Consequences:**
  - `react-native-svg >=15.0.0` becomes a required peer (ADR-003).
  - `ShapeContainer` documents **visual clipping only**: touch targets remain rectangular and are not clipped to the path.
  - `PathCanvas` keeps the renderer boundary; no other file may import SVG.
  - Reopen only with a new ADR if a physical mid-range device cannot sustain the target frame rate for concurrent morphs **and** a Skia design solves RN-child clipping. Skia is not automatically the fallback.

---

## ADR-003 — Peer dependencies (final for 1.0.0)

- **Date:** 2026-11-25 (draft); finalized 2026-11-26
- **Status:** **Accepted (final for 1.0.0).**
- **Required peers:**
  - `react >=19.0.0`
  - `react-native >=0.81.0`
  - `react-native-reanimated >=4.0.0`
  - `react-native-worklets >=0.7.0`
  - `react-native-svg >=15.0.0` — chosen by ADR-002. **Required, not optional:** `PathCanvas` imports it and the package root re-exports the shape primitives, so the module must resolve at install time.
- **Not peers:** `react-native-gesture-handler` and `react-native-safe-area-context` (not used by the Day 7 primitives; add only when a component needs them), `react-native-skia` (rejected by ADR-002).
- **Tested compatibility matrix (gallery pin, exact):**

  | Expo SDK | React Native | React | Reanimated | Worklets | SVG | Skia (spike only) |
  |---|---|---|---|---|---|---|
  | 58.0.26 | 0.88.1 | 19.3.0 | 4.7.1 | 0.13.0 | 15.16.0 | 3.13.1 |

  The peer ranges are lower bounds, not a claim that every combination in range was tested. CI and the gallery use the exact pin above. Reanimated and Worklets are upgraded only in the Expo-blessed pair; the table is re-checked every Expo patch.
- **Worklets transform requirement:** the consuming app must compile with the Worklets Babel plugin. `babel-preset-expo` adds `react-native-worklets/plugin` automatically when `react-native-worklets` is installed. Without it, animated shape updates fail at runtime with `Tried to synchronously call a Remote Function` (observed and fixed on Day 7). This is an install-doc requirement, not a second animation runtime.
- **Why these peers:** Reanimated 4 is already the animation engine the library's public motion API targets; Worklets is its required companion; SVG is the ADR-002 renderer; React and RN are the host.
- **Consequences:** 1.0's install story is "Reanimated 4 + Worklets + `react-native-svg`". Gesture Handler and Safe Area Context stay optional until a component actually uses them. Any new peer needs an ADR with install-friction numbers. The install docs must mention the Worklets Babel plugin.

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

- **Date:** 2026-11-26; **revised 2026-11-27** after the profile matrix.
- **Status:** **Proposed — do not apply until Nasyx approves.** No gate, threshold, scene, or token is changed by this ADR.
- **Context:**
  - The PLAYBOOK §7 gate is `≤0.05%` AA-aware differing pixels of the **whole image** plus **zero** differing content-bbox edges. That is appropriate for solid/rect/shadow scenes, where the content fills a large part of the image.
  - For text it is the wrong denominator. On the 30 one-line type scenes (`840×525 = 441,000 px`, budget `220.5 px`), the faithful run has **17,798 AA px** — **10.64% of the text ink** but only **0.040% of the image**. The 0.05% image budget is smaller than the AA difference of a single 14sp label (`labelLarge` alone is 397 AA px), so any Day 11 component with a text label would fail even when its geometry is exact.
  - The matched-grid run (Compose `TextMotion.Animated`, integer physical font sizes, floored offsets) shows the achievable parity: **269 AA px**, **0.16% of ink**, 26/30 byte-identical, four scenes with a **+1 px** baseline (explained in U-25.2).
  - The faithful residual is inherent to RN's integer text pipeline: font size is `ceil`ed, line height and half-leading are integer, letter spacing is converted to em against the integer size; the faithful run also differs in rasterization mode (Compose `TextMotion.Static` hints with subpixel positioning off, RN is linear with subpixel on). U-25.1 measured four compensation strategies; none is a shippable, string- and density-independent fix.
  - The 2026-11-27 profile matrix tests the fixed C2 table at 420/1.0, 420/1.3, 320/1.0, and 320/1.3. C2 is profile-specific: it improves 21/30 at 420/1.0, regresses 18/30 at 320/1.0, improves 10 while regressing 11 at 420/1.3, and improves 11 while regressing 10 at 320/1.3 (image-gate failures rise 24 → 27 there). The 1.3 failure is dominated by a separate, generic mismatch: Compose UI 1.12.0 applies a non-linear font-scale converter for fontScale ≥1.03, while RN's `allowFontScaling` is linear. The converter is the shipping fix; C2 is not.
- **Answers to the four review questions (2026-11-27):**
  - **(a) What C2 does, and why it works.** C1 first snaps the token size to the nearest integer physical px: if `ceil(F·d·s) ≠ round(F·d·s)`, it replaces `F` with `(round(F·d·s) − 0.001)/(d·s)`. C2 then measures the 8-glyph sample's advance width on both stacks and replaces the absolute letterSpacing with `L0 + (W_compose − W_rn_at_C1)/((g − 1)·d·s)`. It works at 420/1.0 because RN's `ceil` error is constant per glyph, so the horizontal drift is linear in glyph index and a uniform spacing delta cancels it. It does not touch vertical metrics, line-height rounding, or rasterization flags.
  - **(b) Does C2 hold at two other density/scale combinations, including 1.3?** No. It fails both required tests: 320/1.0 regresses 18/30 (net +6,157 AA px; image-gate failures 10 → 19), and 420/1.3 improves 10/regresses 11 while all 25 remaining failures are dominated by the font-scale mismatch. The fourth profile, 320/1.3, improves 11/regresses 10 but raises image-gate failures 24 → 27. C2 therefore does **not** become the shipping text renderer.
  - **(c) Which roles still fail the original 0.05% gate under C2, and by how much?** At 420/1.0, one role: `bodySmall` **308 px vs 220.5** (1.40×). At 320/1.0, 19 roles; worst `displayLarge` **2,353 vs 128** (18.38×). At 420/1.3, 25 roles; worst `displayLargeEmphasized` **35,606 vs 220.5** (161.48×). At 320/1.3, 27 roles; worst `displayLargeEmphasized` **21,022 vs 128** (164.23×). Complete per-role tables are in `docs/evidence/day5/typography/profile-matrix/`.
  - **(d) Reject C4-style per-string/per-density tuning.** Accepted. C4 is a lookup table keyed by sample and profile; it cannot be derived from RN's pre-layout API, would require a post-layout reflow, and the matrix shows a fixed C2 table already regresses at a second density. No per-string or per-density table ships. The only acceptable generic layer is Compose's published `FontScaleConverter` plus a width fit measured at ≥2 profiles.
- **Decision (revised 2026-11-27, proposed):**
  1. **Separate category.** Text scenes and components with text are gated in a **text category** with the metric below. Non-text pixels in the same render keep the existing `≤0.05%` image-area gate. The standard five-scene gate is unchanged.
  2. **Geometry.**
     - Component layout box: **±0 px**, unchanged.
     - Text layout box: **height Δ = 0 px**; **width Δ ≤ 5 px faithful / ≤ 1 px matched**. Measured: faithful max **4.57 px** (24/30 > 1 px, 18/30 > 2 px, 0/30 > 5 px); matched max **1.97 px** (17/30 > 1 px, 0/30 > 2 px); height max **0.00001 px**.
     - Ink bbox: vertical edges **±1 px** (the documented baseline rule; cause and arithmetic in U-25.2). Horizontal edges are reported and bounded by the layout-width rule above. A strict ±0 px ink bbox is not achievable in faithful mode without per-role compensation; if Nasyx requires it, the only path is the C4-style lookup table, which this ADR does **not** recommend.
  3. **AA budget, normalized by text ink and by glyph × font size.** `AA_px` is the AA-aware differing pixel count inside the union of text ink (pixels that are not exactly the scene background). The budget is the **tighter** of an ink ratio and a scale-invariant per-glyph ratio:
     - **Faithful (shipped default):** `AA_px ≤ 450 per 1,000 ink px` **and** `AA_px ≤ 3.0 per glyph per font px` (`AA_px ÷ glyphs ÷ fontPx`). Measured maxima across the 420/1.0 and 320/1.0 token-exact runs: **410 per 1,000** (`labelMediumEmphasized`) and **2.63 per glyph per font px** (`labelMediumEmphasized`). The flat `≤250 per glyph` cap in the 2026-11-26 draft is **withdrawn**: `displayLarge` has **343.1 AA/glyph** at 420/1.0 while its ink ratio is only 12.79%, so a flat cap fails it even though its normalized residual is 2.29. The `glyph × font px` denominator is invariant across density and font scale.
     - **Compensated (only if a generic compensation layer is approved):** `AA_px ≤ 250 per 1,000 ink px` **and** `AA_px ≤ 1.5 per glyph per font px`. C2's fitted-profile run at 420/1.0 is **2,043 AA px**, maxima **243.3 per 1,000** and **1.22 per glyph per font px**, so it would meet this tier at that one profile. It does not meet it at 320/1.0 or 420/1.3 (§ profile matrix below), which is why C2 itself is rejected for shipping.
     - **Matched (diagnostic parity reference):** `AA_px ≤ 15 per 1,000 ink px` **and** `AA_px ≤ 0.2 per glyph per font px`. Measured maxima: **12.7 per 1,000** (`headlineSmall`, 1.27%) and **13.1 per glyph**; the per-font-px form is well under 0.2. This tier is a diagnostic reference, not a shipping claim.
  4. **Generic font-scale emulation is the shipping path.** Compose UI 1.12.0 applies its non-linear `FontScaleConverter` for **fontScale ≥ 1.03**; RN 0.88.1 `allowFontScaling` is linear. At 1.3, Compose renders `bodyLarge` at 20.2sp and `displayLarge` at 57sp, while RN renders 20.8sp and 74.1sp. This is a generic cross-stack mismatch, not a C2 width error. The library must map `fontSize`, `lineHeight`, and `letterSpacing` through the Compose table and set `allowFontScaling={false}` before claiming 1.3 parity. The converter is generic across roles, strings, densities, and scales; it is a Day 10 prerequisite (the Text foundation), not a text-threshold exemption.
  5. **C2 and C4 are rejected for shipping.** C2 is a per-role, per-string, per-profile width fit. At 420/1.0 it improves 21/30 and reduces AA from 17,798 to 2,043 px. At 320/1.0 it **improves 3 and regresses 18**, net **+6,157 AA px** (3,174 → 9,331; image-gate failures 10 → 19). At 420/1.3 it improves 10 and regresses 11 (failures 30 → 25). At 320/1.3 it improves 11 and regresses 10 but **raises image-gate failures from 24 to 27** (net −1,143 px). C4 is worse (per-string and per-density). Do not ship either. The compensated tier is reserved for a future **generic** layer; it must be measured at ≥2 profiles before use.
  6. **Reporting.** Every text report states the mode (faithful/matched/compensated), the ink pixel count, the glyph count, the effective font px, `AA_px`, `AA_px / 1,000 ink`, `AA_px / glyph / font px`, the layout width/height deltas, and the ink-bbox deltas. It never says "pixel-perfect text"; it says, for example, "layout-exact; AA differs by 28.1% of text ink (6,682 px) on this dialog".
- **Profile matrix (2026-11-27; 30 `type-*` scenes per run, one capture per scene):**

| Profile | Strategy | Total AA px | Image-gate failures | Worst AA / 1,000 ink | Worst AA / glyph / font px |
|---|---|---:|---:|---:|---:|
| 420dpi / 1.0 | token-exact | 17,798 | 21/30 | 410.0 | 2.63 |
| 420dpi / 1.0 | C2 | 2,043 | 1/30 | 243.3 | 1.22 |
| 320dpi / 1.0 | token-exact | 3,174 | 10/30 | 398.6 | 1.63 |
| 320dpi / 1.0 | C2 | 9,331 | 19/30 | 423.7 | 2.58 |
| 420dpi / 1.3 | token-exact | 214,694 | 30/30 | 1,542.6 | 30.56 |
| 420dpi / 1.3 | C2 | 213,357 | 25/30 | 1,513.9 | 29.75 |
| 320dpi / 1.3 | token-exact | 118,751 | 24/30 | 1,482.5 | 23.58 |
| 320dpi / 1.3 | C2 | 117,608 | 27/30 | 1,446.3 | 23.05 |

  The 1.3 rows are dominated by the Compose-vs-RN font-scale mismatch (§4); they are **not** evidence that C2 can compensate for it. C2 versus token-exact: 420/1.0 **21 improved / 0 regressed / −15,755 px**; 320/1.0 **3 / 18 / +6,157 px**; 420/1.3 **10 / 11 / −1,337 px**; 320/1.3 **11 / 10 / −1,143 px** (image-gate failures 24 → 27, so the total-pixel reduction does not make it safer). The C2 failure at the original image gate at 420/1.0 is `type-body-small` **308 px / 0.0698%** (budget 220.5 px; over 87.5 px, **1.40×**). At 320/1.0 C2's worst is `type-display-large` **2,353 px / 0.9191%** (budget 128 px; over 2,225 px, **18.38×**) — a regression, not a residual. Evidence: `docs/evidence/day5/typography/profile-matrix/`.
- **Measured roles (all 30, 8-glyph `"Material"` sample; 2026-11-26 faithful/matched table, retained as historical context):**

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

  Image percentages use the 441,000 px scene; the current 0.05% budget is 220.5 px. The faithful dialog and list are **30× and 22× over** the image budget, but **inside** the faithful 450/1,000 ink cap; each role is also inside 3.0/glyph/font px (the worst role in the projection is `bodyMedium` at 2.30). The matched dialog's 80 px is almost entirely the `headlineSmall` +1 px baseline (12 glyphs × 6.6 px/glyph).
- **Why this is the right denominator:** a sub-pixel baseline/size shift changes the pixels on glyph **edges**, whose count scales with glyph perimeter (≈ font size × glyph count), not with image area. The measured `AA/glyph ÷ font px` is **0.48–2.63** across the 21 failures (the top group is **2.29–2.63**: `displayLarge`, `bodyMedium`, `displaySmallEmphasized`, `labelMediumEmphasized`) and **≈0** for roles whose font size and line height are integer-exact. Ink and glyph normalization capture that; image area does not.
- **Alternatives rejected:**
  - **Keep the image-area gate for text.** Fails every realistic dialog/list and any Day 11 component with a 14sp label; would force per-component thresholds, which is less honest than one text metric.
  - **Require byte-identical text.** Impossible without replacing RN's text engine; the matched grid still has four +1 px baselines.
  - **Drop the 30 type scenes.** Loses regression coverage for tokens, weights, line heights, and the font fallback.
  - **Ship C2/C4 per-role compensation.** String- and density-specific; changes shipped token values; overfits one 8-glyph sample. The profile matrix confirms the failure mode: C2 improves 21/30 at 420/1.0 but **regresses 18/30 at 320/1.0** (net +6,157 AA px) and improves only 10 while regressing 11 at 420/1.3. Rejected for 1.0.0.
  - **Keep C2 only at 420/1.0 and re-fit per profile.** A per-density table is still per-string and per-profile; it cannot be derived from RN's pre-layout API and would need a visible post-layout reflow. Rejected for the same reason as C2 itself.
  - **Waive font scale 1.3 because Compose is non-linear.** The mismatch is a real shipping behavior; the generic converter is implementable and is the correct fix. A waiver would make the library diverge from Compose at every accessibility font scale.
  - **Gate on exact pixels only.** Ignores the AA residual that the product actually ships; contradicts the existing AA-aware pipeline.
- **Consequences if approved:**
  - Day 11 components with text can be diffed with a meaningful budget; non-text geometry stays at ±0 px.
  - Reports and docs must use the wording rule in PLAYBOOK §9.1: never "pixel-perfect text"; state the mode, ink, glyphs, font px, and measured AA ratios.
  - The faithful budget is a **regression ceiling**, not a parity claim. The matched grid remains the parity reference.
  - **Font scale ≥1.03 is not claimable until the Compose converter is implemented.** The 1.3 profile matrix is a failing measurement, not a waiver; the converter is a Day 10 prerequisite.
  - The compensated tier stays unused unless a **generic** compensation layer is separately approved; if approved, the budget is 250/1,000 ink and 1.5/glyph/font px, re-measured at ≥2 profiles.
- **Evidence:** `docs/evidence/day5/typography/compensation/README.md` (D-001 pipeline + C1–C4), `docs/evidence/day5/typography/baseline/README.md` (+1 px baseline arithmetic), `docs/evidence/day5/typography/README.md` (30-role faithful/matched tables), `docs/evidence/day5/typography/compensation.json`, `runs/{faithful,matched-grid}/results.json`, `docs/evidence/day5/typography/profile-matrix/` (420/1.0, 420/1.3, 320/1.0, 320/1.3 C2 matrix + converter table).

---

## ADR-011 — Emulate Kotlin Float32 at the shape API boundary and in shape math

- **Date:** 2026-11-26
- **Status:** Accepted for the Day 6 shapes engine
- **Context:**
  - `androidx.graphics:graphics-shapes` is Kotlin/JVM code that computes with `Float`. JavaScript numbers are IEEE-754 doubles, so a literal port silently gains precision the reference does not have.
  - The mismatch is visible at three boundaries: shape-definition literals (`pnr`, `CornerRounding`), geometric operations (normalisation, measuring, feature mapping), and `Matrix.rotateZ` (radians are computed in double, then `sin`/`cos` are rounded to Float before the matrix is applied).
  - The Day 6 golden compares cubic control points and centers at **1e-4**; without Float32 emulation, small differences can also change feature ordering and morph matching (see ADR-012).
- **Decision:**
  1. Shape-definition number literals are rounded with `Math.fround` at the public API boundary (`pnr`, `CornerRounding`).
  2. Shape construction, measuring, and mapping emulate Float32 with `Math.fround` on the values Kotlin stores as `Float`.
  3. `Matrix.rotateZ` computes radians in double, rounds `sin`/`cos` to Float32, and applies a Float32 matrix (`matrixRotate`), matching Compose's `Matrix.rotateZ` semantics.
  4. The port is not “Float32 everywhere”: intermediate JS arithmetic may stay double where Kotlin also promotes to `Double`, but every value that crosses into a Kotlin `Float` field is rounded.
- **Evidence:**
  - `packages/react-native-material-expressive/src/shapes/math.ts` — `f32`, `pnr`, `matrixRotate`.
  - `packages/react-native-material-expressive/src/shapes/CornerRounding.ts` — Float32 radius/smoothing.
  - `docs/specs/shapes/goldens.json` and `src/shapes/__tests__/shapes.test.ts` — worst shape delta **1.329e-7** (`Oval`), worst morph delta **1.2678e-6** (`Gem -> Ghostish` @ 0).
- **Why:** The golden is generated by the actual Kotlin implementation. Matching its numeric type is the only way to keep feature convexity, sorting, and morph matching stable across the port without adding arbitrary epsilons.
- **Alternatives rejected:**
  - **Pure double arithmetic.** Cleaner TypeScript, but it diverges from the reference and can flip near-collinear convexity (for example `PixelCircle` corner 0).
  - **Float32 every intermediate.** Slower, harder to read, and not what Kotlin does where it promotes to `Double`.
  - **WASM f32 module.** Adds a build target and a runtime boundary for a small pure-TS engine.
- **Consequences:**
  - The port is deterministic and golden-matched to 1e-4, with measured maxima three orders of magnitude tighter.
  - The Float32 boundary is part of the public contract: do not “clean up” `Math.fround` calls without regenerating and re-running the goldens.

---

## ADR-012 — Feature-distance sorting uses Float32 squared distance and stable insertion order

- **Date:** 2026-11-26
- **Status:** Accepted for the Day 6 shapes engine
- **Context:**
  - `Morph` matches start and end features by squared distance (`featureDistSquared`) and sorts the candidates. Kotlin computes the distance in `Float` and uses `sortedBy`, which is stable.
  - Exact ties are real: `Arch -> Clover4Leaf` matches because the geometry matches, not because of an epsilon tie-break. Changing the distance type or the sort stability can silently select a different feature pair.
- **Decision:**
  1. `featureDistSquared` is computed with Float32-rounded operands and returns a Float32 value, matching the Kotlin implementation.
  2. Candidate ordering uses a stable sort that preserves insertion order on exact ties, matching Kotlin's `sortedBy`. The implementation relies on ES2019 stable `Array.prototype.sort` (Hermes implements it) and does not add a secondary key or epsilon.
  3. Morph goldens must include pairs whose features tie; `Arch -> Clover4Leaf` is the regression case.
- **Evidence:**
  - `packages/react-native-material-expressive/src/shapes/FeatureMapping.ts` — `featureDistSquared`, stable ordering.
  - `src/shapes/__tests__/shapes.test.ts` — 50 morphs × 5 progress values, **0/50 failures**, max **1.2678e-6**.
  - `docs/evidence/day6/shapes/README.md` — tie-break analysis.
- **Why:** Matching the reference's numeric type and stable ordering is cheaper and more honest than tuning an epsilon until one golden passes.
- **Alternatives rejected:**
  - **Double-precision distance.** Can reorder near-ties and change morph pairing.
  - **Epsilon tie-break.** Not present in Kotlin; it would create a port-only rule and hide future drift.
  - **Unstable sort.** Would make morph output engine-dependent.
- **Consequences:**
  - Morph matching is deterministic across Hermes/JSC and matches the JVM golden.
  - Any future change to the sort or distance type requires regenerating the morph goldens and documenting the behavior change.

---

## ADR-013 — Pin `androidx.graphics:graphics-shapes` 1.1.0 in the reference harness

- **Date:** 2026-11-26
- **Status:** Accepted for the Day 6 golden harness
- **Context:**
  - `androidx.compose.material3:material3:1.5.0` declares a transitive `androidx.graphics:graphics-shapes` dependency that resolves to **1.0.1** in the reference app.
  - The shapes engine and `MaterialShapes` definitions targeted by this library are the **1.1.0** line; the golden must be generated by the version the port claims to match.
  - A transitive upgrade or downgrade would silently change the golden without changing the port.
- **Decision:**
  1. `apps/reference-compose/app/build.gradle.kts` pins `androidx.graphics:graphics-shapes:1.1.0` explicitly.
  2. The pinned artifact SHA-256 is recorded in `docs/COMPONENT_MATRIX.md` (`50586aa6c7b3a542a51b2abaf659f7a6c33d8c5d637d8f1a57aaf518dcb74f3d`).
  3. `ShapeGoldenTest.kt` is the only golden generator; its output is copied to `docs/specs/shapes/goldens.json` by `tools/shapes/generate-goldens.sh`.
  4. Removing or changing the pin requires regenerating the goldens and re-running the shapes tests; it is not a routine dependency bump.
- **Evidence:**
  - `apps/reference-compose/app/build.gradle.kts` — explicit pin.
  - `apps/reference-compose/app/src/test/java/com/nasyxrakeeb/m3ereference/ShapeGoldenTest.kt`.
  - `docs/specs/shapes/goldens.json` — `source` field names `graphics-shapes:1.1.0`.
- **Why:** The golden is only meaningful if it is generated by the implementation version the port targets. Relying on Material3's transitive resolution makes the reference version invisible.
- **Alternatives rejected:**
  - **Use Material3's transitive 1.0.1.** Would golden older geometry and leave the port unverifiable against the intended engine.
  - **Vendor the Kotlin sources into the repo.** Adds a large third-party source tree and a second copy to keep in sync.
- **Consequences:**
  - The reference app intentionally differs from Material3's default transitive graph; this is documented and must stay.
  - Dependency-upgrade PRs that touch `graphics-shapes` must regenerate the goldens.

---

## ADR-014 — Shape goldens live under `docs/specs/shapes/goldens.json`

- **Date:** 2026-11-26
- **Status:** Accepted for the Day 6 golden layout (fixes CI run `45819313412`)
- **Context:**
  - The token extractor owns `docs/specs/*.json` and verifies that every top-level JSON file is a generated token spec with a matching source hash.
  - The first Day 6 commit placed the shape golden at `docs/specs/shapes-goldens.json`. CI treated it as a token spec and failed the generated-spec verification.
  - Shape goldens are a different artifact: JVM-generated geometry, not Material3 token values.
- **Decision:**
  1. Shape goldens live at `docs/specs/shapes/goldens.json`, in a subdirectory the token extractor's top-level glob does not own.
  2. The file keeps its own `schema`, `source`, `shapeNames`, `shapes`, and `morphs` fields; it is not merged into `tokens.json`.
  3. `docs/specs/README.md` documents the namespace split: top-level `*.json` = token extractor output; subdirectories = other generated spec domains.
- **Evidence:**
  - `docs/specs/shapes/goldens.json` — 35 shapes, 50 morphs, 250 samples.
  - `docs/specs/README.md` — namespace rule.
  - Commit `9bb532e` — CI fix; run `45820381554` **success**.
- **Why:** Keeping the token extractor's ownership rule strict avoids false drift failures while keeping shape goldens discoverable next to the other specs.
- **Alternatives rejected:**
  - **Keep the golden at the top level and special-case it in the extractor.** Weakens the extractor's invariant and invites future collisions.
  - **Move it to `docs/evidence/`.** Hides a test fixture in an evidence folder and breaks the existing links.
- **Consequences:**
  - New generated spec domains must use a subdirectory, not a top-level file.
  - The token drift gate remains unchanged and green.

## ADR-015 — Material motion uses a Compose-exact analytic spring driver, not Reanimated `withSpring`

- **Date:** 2026-11-27
- **Status:** Accepted (Day 8)
- **Context:**
  - Day 8 must reproduce the twelve Material3 1.5.0 `MotionScheme` springs (standard/expressive × spatial/effects × default/fast/slow). The golden is generated from the pinned artifact (`SpringGoldenTest`, `docs/specs/motion/goldens.json`), not from copied constants.
  - Compose evaluates a closed-form spring with Float32 inputs and Float64 evaluation, and ends at `estimateAnimationDurationMillis` with `Spring.DefaultDisplacementThreshold` (0.01). Reanimated 4.7.1 `withSpring` uses the same closed form but terminates on an energy ratio (`6e-9`) with no estimated duration.
  - Measured against the golden while Compose is still animating: **2/12 tokens exceed the 1% gate** — `fastEffects` (both schemes) deviates **1.512%** — and **every** token settles later than Compose. `fastEffects` settles at 217 ms instead of 107 ms; `defaultSpatial` at 450 ms instead of 228 ms. Full table: `docs/evidence/day8/springs/verification.md`.
  - `fastEffects` is the spring most colour/alpha transitions use, so the deviation is visible in the common case, not an edge case.
- **Decision:**
  1. Ship the Compose solver in `src/motion/spring.ts`: `springMotionAtMillis`, `springValueAtMillis`, `springDurationMillis`, Float32 boundary, closed-form under/critically/over-damped branches, 0.01 exit threshold.
  2. Ship the driver in `src/motion/springAnimation.ts` (`withComposeSpring`) using Reanimated's `defineAnimation`. It samples the solver per frame and clamps to the target at the Compose duration.
  3. `useSpring` is the public API and routes through `resolveMotionTiming`; component code never calls Reanimated `withSpring` for Material motion.
- **Why:** The parity promise is numeric, and the stock driver changes both the duration and the shape of the most-used effects spring. The solver is 350 lines, deterministic, and testable off-device against the artifact golden, so the cost is bounded.
- **Maintenance cost:**
  - ~440 lines owned by the motion layer (`spring.ts` 350, `springAnimation.ts` 90) plus `tools/motion/` (golden generator, trace verifier, stock-`withSpring` transcription).
  - Regenerating the golden needs a JDK and Gradle (`tools/motion/generate-goldens.sh`); the artifact version is pinned in the script and in `docs/specs/motion/README.md`.
  - Every Reanimated upgrade needs a device smoke test of the gallery motion screen, because `defineAnimation` is not covered by Jest.
- **What breaks on a Reanimated upgrade:**
  - `defineAnimation` signature or animation-object contract (`onStart`/`onFrame`/`onEnd`) — the driver would fail to start or never call back.
  - Worklet serialization of the closure (config object, solver import) — the animation would throw on the UI thread.
  - `useSharedValue` assignment semantics for animation objects — the value would jump to the target instead of animating.
  - If `defineAnimation` disappears, the fallback is a `FrameCallback`-driven shared value (same solver, more boilerplate). `withTiming` keyframes are rejected: they approximate the curve and lose the interruption behaviour.
  - Stock-`withSpring` drift is separately visible because `tools/motion/reanimated-spring.mjs` transcribes the 4.7.1 solver; regenerating the comparison table after an upgrade shows any change.
- **Which test catches drift:** `src/motion/__tests__/spring.test.ts` — 9 tests. It compares all twelve traces with the golden at `1e-6` absolute, asserts exact durations, covers four non-zero-initial-velocity interruptions, the boundary clamp, the token constants, scheme routing, and the reduce-motion mapping. `tools/motion/verify-traces.mjs` reproduces the same check outside Jest and writes `summary.json`. A solver change that moves any sample or duration fails `pnpm test`.
- **Evidence:**
  - `docs/specs/motion/goldens.json` — artifact golden, 12 tokens + 4 interruptions.
  - `docs/evidence/day8/springs/verification.md` — solver max deviation ≈5e-10 (1% gate), stock comparison.
  - `docs/evidence/day8/springs/summary.json` — machine-readable run.
  - `apps/gallery/src/motion/MotionGallery.tsx` — side-by-side custom vs stock driver.

## ADR-016 — Reduce motion: spatial becomes instant, effects cross-fade over 100 ms

- **Date:** 2026-11-27
- **Status:** Accepted (Day 8)
- **Context:**
  - Compose Material3 1.5.0 has no reduce-motion API. On Android the platform convention is the animator duration scale; RN exposes it as `AccessibilityInfo.isReduceMotionEnabled` and the `reduceMotionChanged` event (Android `transition_animation_scale == 0`).
  - Removing all animation makes colour/alpha state changes imperceptible or abrupt: a pressed state that only changes colour would appear to do nothing under reduced motion.
- **Decision:**
  1. `useReduceMotion(override?)` reads `AccessibilityInfo.isReduceMotionEnabled`, subscribes to `reduceMotionChanged`, defaults to `false` until the first native answer, and lets an explicit override win (previews and tests).
  2. `resolveMotionTiming(kind, reduceMotion, config)` returns `spring(config)` normally; under reduced motion it returns `instant` for `spatial` and `fade` for `effects`.
  3. The effects fade is **100 ms linear**, `MotionDurations.short2` from the Material3 token set, applied with `withTiming`.
  4. `useSpring` applies the mapping; `useSpatialSpring`/`useEffectsSpring` exist so call sites classify their motion correctly.
  5. The gallery exposes `system` / `on` / `off` and logs `[M3E] motion_demo … effectiveReduce=…` so the mapping can be checked on device.
- **Why:** Spatial motion (translation, scale, morph) is what the setting is meant to suppress; colour and opacity changes are not motion and should stay perceptible. 100 ms is the shortest token duration that still reads as a transition, and it reuses the token set instead of inventing a value.
- **Alternatives rejected:**
  - **Disable every animation.** Colour/alpha state changes become invisible or instantaneous, which harms comprehension.
  - **Keep springs under reduced motion.** Ignores the platform setting.
  - **Scale all durations by a constant.** Still animates position and scale, so it does not satisfy the setting.
- **Consequences:**
  - Every animated component must pass the correct `kind`; a spatial animation tagged `effects` would still move under reduced motion. Review is part of each component's spec.
  - There is no Compose behaviour to diff against. The mapping is a platform decision recorded here, covered by unit tests and the gallery, not by a pixel gate.
  - `useReduceMotion` is async on first mount; components start in the full-motion state for one frame. This matches RN's own guidance and is not observable in the gallery.
- **Evidence:**
  - `packages/react-native-material-expressive/src/motion/motionTiming.ts`, `useReduceMotion.ts`, `useSpring.ts`.
  - `src/motion/__tests__/spring.test.ts` — "reduce-motion mapping" (2 tests).
  - `docs/evidence/day8/gallery/reduce-on.png`, `system-reduce-on.png`; `docs/evidence/day8/README.md`.

### Amendment (Day 9, 2026-11-27) — no full-motion first frame

The original consequence — "components start in the full-motion state for one frame" — was observable: `AccessibilityInfo.isReduceMotionEnabled` resolves asynchronously, so a component that mounted with the old `false` default could start a full spring before the native answer arrived. With reduce motion enabled, that is a visible violation of the setting, not an acceptable one-frame artefact.

- `useReduceMotion()` now starts at `{ enabled: true, ready: false }`: conservative until the native answer arrives, so no spatial motion starts by default.
- `useReduceMotionState()` exposes `{ enabled, ready }`. `useSpring` and `useTimedValue` hold the first animation while `ready === false`; when the answer is `false`, the held animation starts from its initial value. An explicit override is ready immediately.
- The old default (`false`) remains available only as an explicit override; it is no longer the initial state.
- Tests: `src/motion/__tests__/reduceMotion.test.ts` covers the pending state, the native `true`/`false` answers, the override, and the held-first-animation behaviour.
- This amendment supersedes decision item 1's "defaults to `false` until the first native answer" and the first consequence bullet above.

## ADR-017 — Interactive containers use rounded rectangles; `ShapeContainer` is decorative-only

- **Date:** 2026-11-27
- **Status:** Accepted (U-32 decision; Nasyx, 2026-11-27)
- **Context:**
  - The Day 7 `foreignObject` probe showed that visual clipping and animated children work, but the clipped RN subtree is 0×0. This is a real accessibility defect, not a test artifact: `uiautomator` exposes the container as `[146,458][146,458]` and its children with negative width/height, so TalkBack cannot focus usable bounds (`U-32`).
  - Nasyx chose `borderRadius` for interactive shape containers and visual-only `ShapeContainer` for complex polygons in 1.0.0, subject to an audit of the Compose 1.5.0 inventory.
- **Audit (Compose Material3 1.5.0):**
  - `MaterialShapes.*` appears only in `LoadingIndicator.kt`. `LoadingIndicator` and `ContainedLoadingIndicator` are leaf composables with no content or child slot.
  - `RoundedPolygon` appears only in `LoadingIndicator.kt`, `internal/CircularWavyProgressModifiers.kt`, `internal/ShapeUtil.kt` and `MaterialShapes.kt`. Progress and loading indicators are non-interactive leaves.
  - Every shape-typed `ContainerShape` token is a `ShapeKeyTokens.*` value or a `RoundedCornerShape` (rounded rectangle or corner-full circle). No component container token uses a polygon.
  - The 37-family matrix was reviewed: actions, selection/input, containment, navigation, feedback and parity extras. Controls that morph (Button, IconButton, ButtonGroup, SplitButton, FAB, chips) morph between rounded-rectangle corner radii; their semantics are merged on the control, not on child nodes. Cards, dialogs, sheets and menus are rounded rectangles whose children are separate semantics nodes, not clipped to a polygon.
  - **Result: the list is empty.** No stock Compose 1.5.0 component needs interactive or screen-reader-focusable children clipped to a non-rounded-rect MaterialShape.
- **Decision:**
  1. Interactive and accessibility-focusable containers in 1.0.0 use RN `borderRadius` (rounded rectangle or circle). No path-clipped interactive content ships.
  2. `ShapeContainer` is **decorative/non-interactive only**. The required `decorative: true` prop makes the contract a type-level call-site requirement; a development-only traversal warns when pressable or accessible children are detected; and the `foreignObject` subtree is hidden from assistive technology (`importantForAccessibility="no-hide-descendants"`, `accessibilityElementsHidden`) with `pointerEvents="none"`, so it cannot expose broken nodes or swallow input.
  3. Complex polygon clipping remains visual only, with no touch or accessibility claim.
  4. A native mask spike (normal RN view plus a native `clipPath`/mask host) is post-1.0 backlog, not a 1.0 deliverable.
- **Why:** The audit finds no 1.0 component that needs the capability, while the defect is silent and harmful when it is used. Rounded-rectangle containers keep native touch, scrolling, focus and TalkBack intact; complex shapes remain available for decoration.
- **Alternatives rejected:**
  - **Keep `foreignObject` interactive and document the bug.** Rejected: it hides content from assistive technology and swallows touches without a runtime signal.
  - **Skia-only `ShapeContainer`.** Rejected: Skia cannot clip RN children (ADR-002).
  - **Docs-only warning with unchanged types.** Rejected: the probe shows the failure is silent; a required prop and a dev warning are cheap and visible.
  - **Wrap children in a branded element type.** Rejected after testing: React 19 types every JSX element as `JSX.Element` with `any` props, so the brand does not reject plain children. A required literal prop is enforceable.
- **Consequences:**
  - Interactive expressive shapes are limited to corner-radius morphs in 1.0.0.
  - `ShapeContainer` call sites must pass `decorative`; omitting it is a TypeScript error and a development-time error for JS callers.
  - TalkBack coverage for polygon-clipped interactive content is deferred to the post-1.0 mask spike.
  - The compile-time guard lives in `src/shapes/__type_tests__/ShapeContainer.types.tsx`; removing the required prop fails `tsc`.
- **Evidence:**
  - `docs/evidence/day7/foreign-object/README.md` — probe method, results, root cause, decision.
  - `docs/UNVERIFIED.md` `U-32` — resolved by this scope decision.
  - `docs/COMPONENT_MATRIX.md` — `ShapeContainer` marked decorative-only.
  - `docs/BACKLOG.md` — native mask spike.
  - Audit commands: `grep -rl "MaterialShapes\." docs/research/raw/src/material3/commonMain/androidx/compose/material3/` → `LoadingIndicator.kt`; `grep -rln "RoundedPolygon" ...` → `LoadingIndicator.kt`, `internal/CircularWavyProgressModifiers.kt`, `internal/ShapeUtil.kt`, `MaterialShapes.kt`.

## ADR-018 — Interaction primitives are headless; 48 dp uses `hitSlop`, not layout

- **Date:** 2026-11-27
- **Status:** Accepted (Day 9)
- **Context:**
  - Compose Material3 1.5.0 draws state layers, ripples and the inset focus ring inside components, and reserves a 48 dp minimum interactive size in layout (`InteractiveComponentSize.kt:266-269`). React Native can express the same visuals, but `hitSlop` expands only the touch region.
  - The Day 8 motion gate requires every animated property to declare `spatial` or `effects`. A single component that animates opacity, radius and focus interpolation internally would need several kinds and would hide which property is which.
- **Decision:**
  1. `Interactive` is a headless `Pressable` state machine: enabled/disabled, hover, focus, press, drag and long-press. It renders no state layer, ripple or ring; consumers compose `StateLayer`, `Ripple` and `FocusRing` with a render-prop state.
  2. The 48 dp minimum is applied with `hitSlop` (`resolveHitSlop`), so a 24 dp visual stays 24 dp. A render test asserts the visual style and layout are unchanged while the target grows.
  3. State-layer opacities are the Compose tokens: hover 0.08, focus 0.10, pressed 0.10, dragged 0.16 (`StateTokens.kt:21-25`). The press visual is normally the ripple at 0.10; `StateLayer` exposes `pressed` only for surfaces that opt out of a ripple.
  4. Ripple geometry, 75/225/150 ms timings and the 0.10 press alpha come from `material3-ripple` `RippleAnimation.kt:83-115,157-174`; the focus ring is 0 dp/2 dp `secondary` outer and 1 dp/3 dp `onSecondary` inner, drawn inner first (`Ripple.kt:349-357,784-801`).
  5. Haptics are an injectable `M3Haptics` adapter with a documented no-op default; the library imports no haptics native module.
- **Why:** Keeping the visuals separate preserves the motion-kind contract, lets components choose ripple vs state-layer-only, and keeps the interaction logic testable without a renderer. `hitSlop` matches the RN platform model and keeps the visual size the designer specified; Compose's layout reservation is a platform difference, not a fidelity target.
- **Alternatives rejected:**
  - **One `Interactive` that draws everything.** It would animate three kinds in one file, making the motion-kind declaration meaningless and preventing ripple-less surfaces.
  - **Reserve 48 dp in layout.** It grows small visuals and changes spacing; Material's minimum is a target, not a visual size.
  - **Copy opacity values from memory or a design kit.** Rejected; every value is cited to the Compose 1.5.0 sources.
  - **Hard-depend on `expo-haptics`.** Adds a peer dependency for an optional platform nicety.
- **Consequences:**
  - A visual smaller than 48 dp can have a target that overlaps its neighbours if the layout spacing is under 48 dp; components must keep ≥48 dp between targets or opt into a smaller `minTouchTarget` deliberately.
  - `StateLayer` and `Ripple` need the content colour; `FocusRing` needs the shape radius. These are explicit props, not theme guesses.
  - The motion-kind gate (`tools/motion-kind/check.mjs`) fails any new animated component without a spec row and a literal kind.
- **Evidence:**
  - `docs/specs/interaction/behavior.md` — state precedence, opacities, ripple, focus ring, elevation, touch target, haptics, motion-kind table.
  - `src/interaction/` — implementation; `src/interaction/__tests__/` — state machine, state layer, touch target, haptics, ripple.
  - `docs/evidence/day9/README.md` and `docs/evidence/day9/diff/` — five Android diff scenes.

## ADR-019 — iOS elevation is a documented approximation, never a pixel match

- **Date:** 2026-11-27
- **Status:** Accepted (Day 9)
- **Context:**
  - Android elevation is a RenderNode property that draws an ambient and a spot shadow; Compose's `Surface`/`Modifier.shadow` use that model. React Native's iOS shadow props (`shadowColor`, `shadowOpacity`, `shadowRadius`, `shadowOffset`) cannot reproduce it.
  - There is no Compose iOS reference for Android elevation, so an iOS pixel diff against Compose would be a category error.
- **Decision:**
  1. `elevationToIosShadow(dp)` maps a Material elevation to `shadowOpacity = min(0.22, 0.05 + 0.012 × dp)`, `shadowRadius = 1.5 × dp`, and `shadowOffset.height = max(1, round(0.5 × dp))`, with a black shadow.
  2. Android keeps the native `elevation` value; iOS uses the approximation; web uses a CSS `boxShadow` of the same shape.
  3. The docs, component matrix and evidence call the iOS result an **approximation**. The iOS column is inspection, not the Compose diff gate (Core Rule 3, ADR-004).
  4. Side-by-side screenshots at levels 0–5 are captured for review; the measured difference is reported, not gated.
- **Why:** A monotonic, level-differentiated shadow preserves hierarchy on iOS without adding a rendering dependency. Being explicit about the approximation prevents a false fidelity claim.
- **Alternatives rejected:**
  - **No iOS shadow.** Loses the elevation hierarchy that Material relies on.
  - **One fixed shadow for every level.** Levels become visually indistinguishable.
  - **Skia drop shadow.** Adds a renderer dependency for a platform-only visual (ADR-002 keeps `PathCanvas` the only renderer importer).
  - **Claim pixel parity with Android.** False: the shadow models differ.
- **Consequences:**
  - iOS shadows will not match Android pixel-for-pixel; Day 41 may tune the coefficients after the iOS fidelity pass.
  - The Android elevation scene remains the gate; iOS evidence is reviewed visually and the deltas are documented.
- **Evidence:**
  - `src/elevation/elevation.ts` (`elevationToIosShadow`), `src/elevation/Surface.tsx`.
  - `docs/evidence/day9/ios/` — side-by-side captures and the approximation note.

## ADR-020 — Diff reports publish threshold-independent deltas (proposed)

- **Date:** 2026-11-28
- **Status:** **Proposed** — awaiting Nasyx. The gate is unchanged until approved.
- **Context:**
  - The PLAYBOOK §7 gate counts pixelmatch pixels at `threshold: 0.1`, `includeAA: false`. Threshold 0.1 is a YIQ squared-colour-distance limit (`35215 × 0.1²`), not a per-channel delta; for neutral grey it is roughly 26/255 per channel.
  - The Day 9 interaction scenes therefore report 22.2% and 42.6% exact-different pixels with max channel Δ 9 while the AA-aware count is 0. That is correct for the current gate but easy to misread as "byte-identical" or "only 1/255".
  - The audit found no flat fill above Δ 2 in any non-text scene, and all Δ > 2 pixels sit within one pixel of a colour transition. The only flat-fill misses are the Day 4 diagnostic text probes, already D-001.
- **Proposed decision:**
  1. Keep the existing 0.05% AA-aware gate unchanged.
  2. Every diff report must publish, per scene: max channel Δ, mean channel Δ over differing pixels, count of pixels with Δ > 2 outside anti-aliased edges, and count of flat fills with Δ > 2.
  3. For non-text scenes, a non-zero flat-fill count above Δ 2 is a failure; a non-zero Δ > 2 outside AA edges count is a failure. Text scenes remain under ADR-010/D-001.
  4. Do not replace the AA-aware gate without a separate approved ADR. The raw metrics are guardrails, not a retroactive failure of past scenes.
- **Why:** A threshold-dependent count cannot distinguish "small flat rounding" from "a real edge shift". Publishing both makes the claim auditable without silently tightening or loosening the gate.
- **Alternatives rejected:**
  - **Lower pixelmatch threshold to 0.01.** It would count more AA edge pixels and change the gate without a product decision.
  - **Gate on max channel Δ alone.** A single AA edge can exceed 100; it would fail every text scene.
  - **Keep only the AA-aware count.** It hides Δ 9–18 edge differences and invites the "≤1/255" misreading.
- **Consequences:**
  - Reports grow by four columns; the backfill script recomputes stored runs.
  - Future scenes cannot pass by staying below pixelmatch's perceptual threshold if they have a real flat-fill shift.
  - Approval is required before any CI gate uses the new counts.
- **Evidence:**
  - `tools/pixel/lib.mjs` (`meanChannelDeltaOverDiffPixels`, `highDeltaOutsideAaPixels`, `flatFillHighDeltaPixels`).
  - `tools/pixel/report.mjs`; `tools/pixel/backfill-metrics.mjs`.
  - `docs/evidence/day9/README.md#threshold-independent-metrics-added-2026-11-28`.
  - `docs/KNOWN_DEVIATIONS.md` D-001 audit paragraph.
