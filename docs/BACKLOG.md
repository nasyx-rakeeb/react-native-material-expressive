# Backlog — side quests held out of the current day

Do not work on these until the current day's exit criteria are met. Add findings here instead of wandering (playbook §0.5).

## Scope candidates

- **Native mask for interactive `ShapeContainer`** (post-1.0): render children as a normal RN view so layout, touch and accessibility stay intact, then clip them with a native masked-view host or a native `Canvas.clipPath` view. Spike Fabric/New Architecture, touch, TalkBack focus, animation, mask-edge quality and iOS. 1.0 uses `borderRadius` for interactive containers and decorative-only `ShapeContainer` (ADR-017); this unblocks interactive polygon clipping and the deferred TalkBack pass.
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

## Day 20 blockers — U-29 follow-ups (Nasyx, 2026-11-27; re-baselined 2026-11-28)

ADR-002 stays for now. **Items 2 and 3 block Day 20 (Slider motion/gesture work), not Day 30.**
The Day 10 120 Hz capture run closes item 1; the ADR amendment (item 4) can follow the
Day 20 measurements.

1. **120 Hz device re-run.** Repeat the six 20 s captures on Nasyx's Xiaomi 2201116SI with the display set to 120 Hz. Report the same table (mode × renderer, frames, avg, max) plus the active mode id. **Day 10 status:** six captures executed; numbers in `docs/evidence/day10/device/`. If the active mode reports 120 Hz, this item is closed; if not, record the offered mode and keep it open.
2. **SVG time profile (blocks Day 20).** Break down where the SVG time goes in `cycle` and `concurrent` (path-string generation, native parse, UI-thread commit). Try cheap optimizations and report numbers: reduced decimal precision in the path string, fewer cubic segments where visually identical, caching, and for wave animation a translate-based approach instead of regenerating the path each frame.
3. **Skia size verification (blocks Day 20).** Confirm whether 29.78 MB per ABI is the real APK-size increase after compression and stripping, or the uncompressed library size. Compare with Skia's documented size impact. Amend ADR-002 if the figure was misleading.
4. **ADR amendment by Day 30.** Decide one of: (a) SVG is enough for the loading indicator and wavy progress, with 60 Hz and 120 Hz numbers; (b) those two components use Skia as an optional peer with a documented fallback; or (c) a hybrid. `PathCanvas` must remain the only file importing a renderer.

## Day 45 blocker — icon subset CLI

- **Material Symbols subset CLI.** Today the package ships a fixed 90-glyph subset; an app
  that uses a name outside it gets a missing-glyph tofu box at runtime. Before Day 45
  (API review & bundle), ship a small CLI that reads the app's used `MaterialSymbol` names
  (static scan or a generated manifest) and subsets the variable font from the upstream
  source, preserving all four axes. Until then, `MaterialSymbol` must warn in development
  when the requested name is not in the bundled registry. Tracked as `U-14`.

## Research notes to revisit

- Paper’s Button/IconButton morph uses CSS transition props, not Reanimated. Test native behavior on the reference emulator (U-16) before citing it as a competitor capability.
- m3 chips page has no Expressive section, but Compose Chip has `ChipShapes`. Track page updates.
- m3 segmented buttons are deprecated in favor of connected groups; keep both only for migration.
- Docked toolbar has no Compose composable; `FlexibleBottomAppBar` uses its tokens.
