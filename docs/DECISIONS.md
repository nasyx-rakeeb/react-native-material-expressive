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
- **Status:** **Proposed — needs Nasyx approval (release-gate exception)**
- **Problem:** §8’s parity floor includes `Banner`, `Avatar`, `DataTable`, `HelperText`, `Accordion`, and `SideSheet`. Compose Material3 1.5.0 has **no public API** for any of these (SideSheet has an m3 spec page but no Compose implementation; the others are Paper-only/M2 holdovers). §8.1 and Release Gate #1 require an Android pixel diff against Compose for every in-scope component. That is impossible for these rows.
- **Options:**
  1. **Diff against a frozen Paper v6 alpha.4 baseline.** Pros: real reference, catches API-parity visual drift. Cons: encodes Paper’s bugs as truth (Paper is explicitly not a fidelity authority); violates Core Rule 1.
  2. **Visual/a11y review only, with `reference: none` recorded in the matrix and docs.** Pros: honest; does not invent a false reference; keeps these as migration surfaces. Cons: release gate must explicitly exempt them; no pixel guarantee.
  3. **Drop them from 1.0.** Pros: gate stays pure. Cons: breaks the Paper parity promise; migration friction.
- **Recommendation:** **Option 2**, plus a frozen screenshot baseline of *our own* implementation for regression only (not called a fidelity diff). Mark these rows `NCR` in `COMPONENT_MATRIX.md` and state the limitation prominently in docs. Keep SideSheet (m3 spec) in this bucket too, because there is no Compose implementation to render.
- **Why not Option 1:** Paper’s alpha has known visual bugs (Dialog gap, hover layer, RTL supporting text). Using it as truth would make us faithfully wrong.
- **Feasibility precedent (not truth):** the MIT Flutter port `material_3_expressive` 1.2.3 implements 39 component families including `side_sheets`, `toolbars`, and `carousel`; m3-spec-only surfaces are implementable. See `docs/research/DAY0_SOURCES.md` §10. Their values are still not citable (Core Rule 1).
- **Consequences if approved:** Release Gate #1 changes from “100% of in-scope scenes” to “100% of Compose-backed scenes; all NCR surfaces reviewed + regression-baselined.” This is a threshold change and therefore needs explicit sign-off (Core Rule 8).
- **Blocked work:** Do not implement NCR components until this is approved; they are Day 38 scope, so this is not a Day 1 blocker.

---

## ADR-006 — Mirror Compose 1.5.0’s Expressive defaults; do not invent a dark Expressive scheme or emphasized default typography

- **Date:** 2026-11-25
- **Status:** **Proposed — confirm or override on Day 1**
- **Decision (recommended):**
  - `MaterialExpressiveTheme` equivalent defaults to `expressiveLightColorScheme()` + `MotionScheme.expressive()` + `Shapes()` + **standard `Typography()`**, exactly like Compose 1.5.0.
  - Dark mode uses `darkColorScheme()`, not a hand-made “expressive dark”. Compose’s own KDoc says: “For dark mode, use `darkColorScheme`.”
  - Expose the 15 **emphasized** type styles from `TypeScaleTokens`/`TypographyTokens` as opt-in tokens. Do **not** make them the default, because Compose 1.5.0’s `MaterialExpressiveTheme` still has `// TODO: replace with calls to Expressive typography default` and passes `Typography()`.
  - Offer a separate, documented `expressiveDarkColorScheme` only if Nasyx wants a product extension; it must be marked non-reference and generated by `material-color-utilities`, not presented as Compose parity.
- **Evidence:**
  - `ColorScheme.kt:1172` defines only `expressiveLightColorScheme()`. No `expressiveDarkColorScheme` exists in 1.5.0.
  - `MaterialTheme.kt:238` `MaterialExpressiveTheme`; line ~264 has the typography TODO.
  - `TypeScaleTokens.kt`/`TypographyTokens.kt` contain `*Emphasized` styles (15), but they are not wired into the default theme.
- **Alternatives rejected:** Invent an expressive dark scheme as default (unsourced, violates Core Rule 1); make emphasized typography default (would not match Compose renders).
- **Consequences:** Our dark theme may look less “Expressive” than marketing expectations. That is the faithful choice. Revisit when Compose ships a dark Expressive scheme.

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
