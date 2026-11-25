# Backlog — side quests held out of the current day

Do not work on these until the current day's exit criteria are met. Add findings here instead of wandering (playbook §0.5).

## Scope candidates

- **XR components** (m3 foundations/xr: app bars, dialogs, nav-bar, nav-rail, toolbars). Not in §8; defer past 1.0 unless Nasyx asks.
- **ReorderList / RevealList**: token files (`ReorderListTokens.kt`, `RevealListTokens.kt`, `ExpandedListTokens.kt`) exist in 1.5.0 but no public composable found. Re-check 1.6/1.7; do not invent an API from tokens.
- **Expressive dark scheme**: generate via `material-color-utilities` only if Nasyx rejects ADR-006’s faithful default. Must be documented as non-reference.
- **Dynamic color iOS**: Android 12+ dynamic color is the target; iOS has no system dynamic color equivalent. Optional seed/photo-based theme generator is a product feature, not parity.
- **Paper codemod**: after the migration guide (Day 49), consider a jscodeshift transform for `Button`/`IconButton`/`FAB` prop renames.
- **Web pixel diffing**: web is best-effort; only compile/render/a11y checks in 1.0. Revisit after launch.
- **120fps mode**: gate at 60fps on reference mid-range; evaluate 120fps on capable devices after Day 44.
- **Haptics mapping table**: per-component haptic patterns; needs device research and an injectable adapter.
- **Material Symbols subset pipeline**: build-time subset + per-app icon extension; U-14.
- **Theme playground share links**: encode seed/variant/motion in URL for docs/gallery.
- **Paper alpha regression watch**: automate weekly npm/GitHub diff for Paper 6.0/6.1 and `@expressive-ui/native`; feed COMPETITOR_MATRIX.
- **Compose 1.6/1.7 token drift bot**: run extractor monthly, open a PR with the token diff.
- **iOS CMP stable upgrade**: move reference harness from 1.13.0-rc01 to 1.13.0 stable, re-run source-identity check.
- **SideSheet**: if Compose ships a public implementation, replace the spec-verified path with a Compose diff scene and keep the self-regression baseline.
- **Accessibility scanner automation**: Accessibility Scanner/TalkBack scripted checks in CI (Day 40).
- **Release provenance/SBOM**: automate npm provenance + CycloneDX SBOM (Day 55).

## Research notes to revisit

- Paper’s Button/IconButton morph uses CSS transition props, not Reanimated. Test native behavior on the reference emulator (U-16) before citing it as a competitor capability.
- m3 chips page has no Expressive section, but Compose Chip has `ChipShapes`. Track page updates.
- m3 segmented buttons are deprecated in favor of connected groups; keep both only for migration.
- Docked toolbar has no Compose composable; `FlexibleBottomAppBar` uses its tokens.
