# Current status

- Current day: Day 10 (foundation gate; extended 2026-11-28 with `M3Provider` + `Text`)
- Status: AWAITING USER APPROVAL (Day 10 extended scope complete; close report posted. 17/22 foundation rows Android-DONE; Typography and Text are `[~] T` pending the ADR-010 threshold decision; three token-only rows need a scope decision)
- Last closed day: Day 9 (approved by Nasyx, 2026-11-28; tag `day-9-closed` at `e9f73ca`)
- Last commit hash: 258bd5d (Day 10 extended scope; no Day 10 tag until approval)

## Day 10 required scope (from Nasyx, 2026-11-28)

- Overlay/Portal: stacking, back/Escape close only the topmost overlay, focus trap
  and restore, keyboard avoidance, insets. Tests; state which behaviours were only
  verified on the emulator.
- Icon: Material Symbols via `fontVariationSettings` (FILL, wght, GRAD, opsz) with
  capability detection; internal icons as path data. Verify bundled license text and
  report size impact; subset the font if needed.
- Window size classes and RTL utilities with tests.
- Install the gallery with Day 9 + Day 10 scenes on the Xiaomi at the end; give
  exact commands.
- Gate report must include: every foundation row in `COMPONENT_MATRIX.md` with
  evidence and DONE/not; 10-line plain-language summaries of ADR-009 and ADR-010
  with a recommendation; re-baselined calendar by phase with schedule risks; the
  U-29 follow-ups; exact gallery/diff commands. Then stop; do not start Day 11.

## Pre-Day-10 threshold audit (2026-11-28)

- `pixelmatch` gate: `threshold: 0.1`, `includeAA: false`. Threshold 0.1 is a YIQ
  squared-colour distance, not a channel delta (≈26/255 neutral grey).
- Day 9 scenes: flat fills differ by ≤1/255; max Δ 9/18 is anti-aliased clip/ripple/
  ring edges, below pixelmatch's threshold. No RN fix needed.
- Every stored report now publishes max Δ, mean Δ over differing pixels, Δ > 2 outside
  AA edges, and flat fills > 2. Only the Day 4 diagnostic text probes have flat fills
  > 2 (D-001, inherent glyph-advance difference). ADR-020 is proposed, not applied.

## U-29 follow-ups (ADR-002 stays for now; items 2–3 block Day 20)

1. Re-run the six captures at 120 Hz on Nasyx's Xiaomi. **Day 10: closed.** The active display mode is `mActiveModeId=1` at `fps=120.00001`; six captures are in `docs/evidence/day10/device/` and summarised in `docs/evidence/day7/frame-times.md`.
2. **Blocker before Day 20:** profile SVG time in cycle + concurrent modes (path string generation, native parse, UI-thread commit). Try reduced decimal precision, fewer cubic segments where visually identical, caching, and a translate-based wave animation instead of per-frame path regeneration. Report numbers.
3. **Blocker before Day 20:** verify whether 29.78 MB per ABI is the real compressed/stripped APK-size delta or the uncompressed library size. Compare with Skia's documented size impact; amend ADR-002 if misleading.
4. By Day 30, write an ADR amendment: SVG is enough for loading indicator + wavy progress (with 60/120 Hz numbers), or those components use Skia (optional peer + documented fallback), or a hybrid. `PathCanvas` must remain the only file importing a renderer.

## Icon subset CLI (blocker before Day 45)

The package ships a fixed 90-glyph subset. Before Day 45 (API review & bundle), add a CLI
that subsets the upstream variable font from the app-used `MaterialSymbol` names and keeps
all four axes; until then, warn in development when a requested name is not in the bundled
registry (`U-14`). Tracked in `BACKLOG.md`.

## Day 10 result (2026-11-28)

### Original scope (commit `be68ad9`)

- Icon diff: exact 0 / AA-aware 0 / max Δ 0 across 3 cold boots; font bytes
  verified in source, gallery, Compose APK and RN APK.
- Emulator evidence: overlay stack/back ordering, keyboard avoidance, RTL
  preview, window classes 411×731 compact/medium and 720×1280 medium/expanded.
- Xiaomi: installed from `/sdcard/Download/m3egallery.apk` (203,624,632 B;
  MIUI blocked `pm install` with `INSTALL_FAILED_USER_RESTRICTED`). Verified
  cold launch, API 33 variable-font support, all four axes + path icons, overlay
  stack depth 2, and the Day 9 `interaction-states` scene.

### Extended scope (2026-11-28)

- `M3Provider`: theme + reduce-motion + window size class + layout direction,
  with `useM3Theme`, `useM3ReduceMotion`, `useWindowSize`/`useWindowSizeClass`,
  `useM3LayoutDirection`, `useM3ContentColor`.
- `Text`: 30 roles, emphasized opt-in, content-colour inheritance, RTL align,
  sp overrides, and the Compose 1.12.0 non-linear `FontScaleConverter`
  (`composeFontScale` + `composeLineHeight`).
- Gallery: provider demo and all-role text grid; `SceneHarness` renders `type-*`
  scenes through the library `Text`. Screenshots: `provider-default.png`,
  `provider.png` (reduceMotion on / rtl), `text-roles.png`,
  `text-roles-emphasized.png`.
- Converter measurements: 30 roles × 4 profiles (420/1.0, 420/1.3, 320/1.0,
  320/1.3) in `docs/evidence/day10/typography/`; **119/120** pass the faithful
  budget. One miss: `type-label-medium-emphasized` at 320/1.3, 453.7 per 1,000
  ink vs 450 (per-glyph 2.845 ≤ 3.0).
- Xiaomi: final APK (203,638,944 B, SHA-256 `7697f925…c9e7a42`) installed
  with `adb install -r` at 16:09; the phone was asleep and MIUI denied wake
  injection, so no new phone screenshot. Emulator screenshots cover the new
  sections.
- Core five-scene gate: **PASS**. `text`/`trivial` are 4 AA px (0.0009%, max
  Δ 162); `solid`/`rect`/`shadow` are exact 0. The first harness build routed
  non-role text through the library `Text` and regressed to 3,810 AA px
  (0.8639%); non-role scenes now use raw RN `Text`, and the re-run matches
  Day 3. Evidence: `docs/evidence/day10/core-gate/`.
- Gates: format, lint, typecheck pass; **31 suites / 237 tests**; 43 scenes.
- Remaining: Nasyx's decisions on (a) the ADR-010 threshold (keep 450 + D-001,
  or accept 500) and (b) the three token-only foundation rows (accept
  value-golden evidence or schedule per-role scene diffs). Day 10 is not closed
  and Day 11 must not start.
