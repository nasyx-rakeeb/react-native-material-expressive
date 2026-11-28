# Current status

- Current day: Day 10 (foundation gate; approved by Nasyx, 2026-11-28)
- Status: AWAITING USER APPROVAL (Day 10 gate report posted)
- Last closed day: Day 9 (approved by Nasyx, 2026-11-28; tag `day-9-closed` at `e9f73ca`)
- Last commit hash: 167b9aa

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

## U-29 follow-ups (ADR-002 stays for now; blockers before Day 30)

1. Re-run the six captures at 120 Hz on Nasyx's Xiaomi when the phone is next plugged in. **Remind Nasyx at the Day 10 gate.**
2. Profile SVG time in cycle + concurrent modes (path string generation, native parse, UI-thread commit). Try reduced decimal precision, fewer cubic segments where visually identical, caching, and a translate-based wave animation instead of per-frame path regeneration. Report numbers.
3. Verify whether 29.78 MB per ABI is the real compressed/stripped APK-size delta or the uncompressed library size. Compare with Skia's documented size impact; amend ADR-002 if misleading.
4. By Day 30, write an ADR amendment: SVG is enough for loading indicator + wavy progress (with 60/120 Hz numbers), or those components use Skia (optional peer + documented fallback), or a hybrid. `PathCanvas` must remain the only file importing a renderer.

## Day 10 gate reminder

- Show Nasyx the gallery + diff report commands.
- Ask Nasyx to plug in the Xiaomi for the 120 Hz U-29 re-run.

## Day 10 result (2026-11-28, commit be68ad9)

- Icon diff: exact 0 / AA-aware 0 / max Δ 0 across 3 cold boots; font bytes
  verified in source, gallery, Compose APK and RN APK.
- All gates pass: format, lint, typecheck, 27 suites / 201 tests, 43 scenes.
- Emulator evidence: overlay stack/back ordering, keyboard avoidance, RTL
  preview, window classes 411×731 compact/medium and 720×1280 medium/expanded.
- Xiaomi: installed from `/sdcard/Download/m3egallery.apk` (203,624,632 B;
  MIUI blocked `pm install` with `INSTALL_FAILED_USER_RESTRICTED`). Verified
  cold launch, API 33 variable-font support, all four axes + path icons, overlay
  stack depth 2, and the Day 9 `interaction-states` scene.
- Remaining: post the Day 10 gate report and stop. Do not start Day 11.
