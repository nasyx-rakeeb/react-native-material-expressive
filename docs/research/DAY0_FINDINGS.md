# Day 0 findings — orientation & competitive gate

**Date:** 2026-11-25. No product code written.

## What changed since the plan was written

React Native Paper has moved from the brief’s snapshot to `6.0.0-alpha.4` (2026-11-23) and now actually ships Button/IconButton shape morphs, FAB Menu, a 48dp Switch with icon/spring, TextInput state colors/RTL fixes, and `useReduceMotion()`, but its own roadmap issue #5150 confirms it is still in Phase 2 with **no target date** and explicitly defers Toolbar (#5043), ConnectedButtonGroup (#5074), and Slider to **6.1**, while NavigationBar (#5006) remains unmerged and progress indicators stay flat; its signature-set coverage is therefore **17.9% (2.5/14)**, not the >60% stop condition. On the Google side, Compose Material3 **1.5.0 is confirmed stable** (2026-11-18) and 1.6.0-alpha01 already exists; the 1.5.0 sources add several public components the brief omits (`ScrollField`, `SecureTextField`/`OutlinedSecureTextField`, `PullToRefreshBox`, `ShortNavigationBar`, `WideNavigationRail`, `FlexibleBottomAppBar`/`BottomAppBarState`, `AppBarWithSearch`, `TimeScroll`, `SegmentedListItem`, `DropdownMenuGroup`, `SwipeToDismissBox`, `VerticalSlider`), and they reveal two plan-level inaccuracies: 1.5.0 has **only an expressive light scheme** (no dark expressive scheme) and `MaterialExpressiveTheme` still defaults to the standard `Typography()` with a TODO, so “expressive color schemes” and default emphasized typography are not what Compose actually ships. Compose Multiplatform is the one genuinely new opportunity: stable `material3:1.9.0` lacks eight signature components, but **1.13.0-rc01 contains all of them and is 95.9% byte-identical to AndroidX 1.5.0 across 245 shared files**, so an iOS reference app is viable as a reference-only harness (ADR-004) rather than a pixel gate. Finally, the “no RN M3E library exists” claim is now false in the literal sense: `@expressive-ui/native@0.3.0` (2026-11-24) exposes most signature component names in 6.5k LOC, but it is 0.x, uses RN `Animated` rather than Reanimated, has no MaterialShapes/Morph engine, no repository field, and no published fidelity evidence; the fidelity moat is still unclaimed.

## Verified facts (with evidence)

1. **Compose 1.5.0 is stable and pinned.** Artifacts/sha256 in `docs/research/DAY0_SOURCES.md`; 271 Kotlin files, 194 public functions, 120 token files, 35 `MaterialShapes`. Inventory: `docs/research/COMPOSE_M3_1.5.0_INVENTORY.md`.
2. **Spring tokens match the plan exactly.** Standard 700/0.9 default, 1400/0.9 fast, 300/0.9 slow; expressive 380/0.8 default, 800/0.6 fast, 200/0.8 slow; effects 1600/1.0 default, 3800/1.0 fast, 800/1.0 slow. Source: `ExpressiveMotionTokens.kt`, `StandardMotionTokens.kt`.
3. **No expressive dark scheme.** `expressiveLightColorScheme()` is the only expressive scheme in 1.5.0; its KDoc says use `darkColorScheme()` for dark. ADR-006 proposes mirroring this.
4. **Emphasized typography exists but is not the default.** 15 `*Emphasized` styles are in `TypeScaleTokens.kt`/`TypographyTokens.kt`; `MaterialExpressiveTheme` passes `Typography()` and carries a TODO. ADR-006.
5. **m3 catalog is 37 families, not §8’s list.** `scroll-fields` is new (2026-11-17) and in Compose. §8 is missing at least 15 public APIs. Full delta table in `COMPONENT_MATRIX.md`.
6. **Segmented buttons are deprecated in Expressive.** m3 says use connected button groups; Compose still ships segmented for compatibility. ADR-007.
7. **Docked toolbar has no `DockedToolbar` composable.** `FlexibleBottomAppBar` uses `DockedToolbarTokens`; the public mapping must not invent a conflicting API.
8. **No Compose reference for SideSheet/Banner/Avatar/DataTable/Accordion.** ADR-005 proposes an explicit `NCR` exception; this touches Release Gate #1 and needs Nasyx’s sign-off.
9. **Paper gate passed.** 2.5/14 signature score; even counting partials as full gives 4/14 = 28.6%.
10. **Reanimated/Expo matrix is concrete.** Expo SDK 58 pins RN 0.88.0-rc.3 + Reanimated 4.7.0 + Worklets 0.13.0; latest standalone 4.8.0/0.14.0 supports RN 0.87–0.89. Skia is now unscoped `react-native-skia@3.13.0` (2026-11-25).
11. **CMP iOS is feasible only on the RC line.** CMP 1.13.0-rc01 has all signature components and 95.9% shared-source identity; stable 1.9.0 lacks eight. 10 shared files differ and must be inspect/baseline, not diffed. ADR-004.
12. **Fonts/licenses verified, size risk real.** Material Symbols 10.7 MB Apache-2.0; Roboto Flex 1.79 MB OFL-1.1. Subsetting is mandatory (U-14).
13. **`@expressive-ui/native` is a real new competitor.** Track it; do not dismiss it. No evidence of fidelity verification.

## Things in the plan I think are wrong or risky

| # | Issue | Why it matters | Proposed action |
|---|---|---|---|
| 1 | “Expressive color schemes” (plural) | 1.5.0 has only a light expressive scheme; inventing a dark one is unsourced | ADR-006: mirror Compose; optional non-reference extension only with approval |
| 2 | “Expressive typography across the entire type scale” as a default | Compose’s expressive theme still uses standard `Typography()` | Expose emphasized styles opt-in; don’t change the default |
| 3 | §8 omits 15+ public APIs | Matrix would under-scope 1.0 | Scope deltas table; all added to 1.0 |
| 4 | “Every component compared against Compose” | SideSheet and Paper-only extras have no Compose implementation | ADR-005; needs explicit gate exception |
| 5 | “Docked toolbar” as a component | No Compose API; `FlexibleBottomAppBar` is the implementation | Map to `FlexibleBottomAppBar`; verify m3 specs Day 36 |
| 6 | SegmentedButton as a first-class Expressive component | m3 deprecates it | Lead with ButtonGroup; keep segmented as legacy |
| 7 | Pixel gate ≤0.05% + zero layout-edge delta for **all** static states | Text AA, shadows, elevation, and ripple stills may never reach zero layout-edge delta; risk of false failures | Keep the threshold for now; measure Day 3 determinism; deviations after 3 attempts, never silently loosen |
| 8 | 60-day/1.0 scope for ~84 rows, 194 APIs, docs, 3 dogfood apps, 2 platforms, web | This is a multi-quarter engineering scope, not 60 calendar days; “day” is a scope unit, so slippage is certain | Keep gates honest; log slippage; never cut verification. Tell Nasyx now rather than at Day 24 |
| 9 | Paper’s “no complete library” white-space claim | `@expressive-ui/native` exists and is broad | Compete on fidelity/production readiness, not absence |
| 10 | Android-only diff gate + iOS “inspection only” | CMP RC makes iOS reference renders possible | ADR-004: extend diff pipeline to iOS as reference-only; never claim iOS pixel parity |
| 11 | Paper’s commodity parity is underestimated | 34 components + DataTable/Avatar/Portal/Banner; migration friction is real | Parity floor Day 38 is mandatory, not optional polish |
| 12 | Material Symbols full font | 10.7 MB is unacceptable in a default bundle | Subset + internal path icons; U-14 |

## Gate result

**PASS — proceed to Day 1.** Paper’s signature coverage is 17.9%, below the 60% stop condition. Day 1 is blocked on Nasyx’s answers (package name, license, repo/docs, npm access); no code will start before those arrive.
