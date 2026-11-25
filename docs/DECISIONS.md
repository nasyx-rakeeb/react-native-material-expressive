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
