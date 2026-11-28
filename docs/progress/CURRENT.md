# Current status

- Current day: Day 11 (Button 1/2 — static scene matrix)
- Status: IN PROGRESS
- Last closed day: Day 10 (approved by Nasyx, 2026-11-28; tag `day-10-closed`)
- Last commit hash: 1c49ed2 (Day 10 closure commit follows)

## Day 10 closure (2026-11-28)

- **Foundation: 22/22 Android-DONE, 0/22 Release-DONE.** Typography and `Text`
  are `[x] T`; colour schemes, dynamic colour and shape tokens are `[x] V`
  (value-golden). Per-role gallery pages for the token rows are in the Day 47
  gallery/playground plan (`BACKLOG.md`).
- **ADR-010 approved:** faithful text budget `≤450 AA per 1,000 ink px` and
  `≤3.0 per glyph per font px`. The single miss
  (`type-label-medium-emphasized`, 320/1.3: 453.7 vs 450; per-glyph 2.845) is
  recorded in `D-001`. Re-run the matrix whenever text code or fonts change.
- **ADR-009 accepted**; **ADR-020 accepted as reporting only** (no gate change).
- **Core five-scene gate PASS:** `text`/`trivial` 4 AA px (0.0009%, max Δ 162);
  `solid`/`rect`/`shadow` exact 0. Evidence: `docs/evidence/day10/core-gate/`.
- **Icon diff PASS:** exact 0 / AA 0 / max Δ 0 across 3 cold boots.
- **Tests:** 31 suites / 237 tests; Day 10 adds 11 suites / 93 tests. 43 scenes.
- **Final APK:** 203,638,944 B, SHA-256
  `7697f9257acbd8a97c39e50ba326ebc5afdbb60f02c4d3751591aff57c9e7a42`,
  installed on the Xiaomi with `adb install -r` at 16:09.
- **Calendar:** best-case and realistic columns in `docs/progress/CALENDAR.md`.
  Realistic assumes Phase B and C take 1.5× their planned days.

## Day 11 approved scope

- Extract Button behavior from Compose 1.5.0 sources: `Button.kt`,
  `ButtonDefaults`, and the XSmall/Small/Medium/Large/XLarge token files.
  Container heights, content-padding formulas, icon size/spacing per height,
  shapes per size, pressed/hovered/focused/disabled colours, toggle (selected)
  shape/colours, and elevated/filled/tonal/outlined/text colour mapping. Cite
  files; put gaps in `UNVERIFIED.md`.
- Scene matrix: 5 types × 5 sizes × round/square × content (text only, leading
  icon, trailing icon, icon+text) × states (default, pressed, focused, hovered,
  disabled, selected) × light/dark × font scale 1.0 and 1.3. Full matrix at
  font scale 1.0; reduced matrix at 1.3 and RTL.
- Use the Day 10 `Text` and `Icon` components; use the Day 9 `Interactive`,
  state layers and focus ring. Do not re-implement them.
- Diff against Compose with the core gate for non-text pixels and the text
  category for labels. Report max Δ and Δ > 2 outside AA edges (ADR-020).
- Static only. Press morph and toggle morph are Day 12; declare motion kinds
  for anything animated, but do not implement the morph.
- Public API sketch in docs: props, defaults, ref forwarding, `testID`, a11y
  props, `hitSlop` honored. Do not freeze before Day 12.
- Do **not** mark Button Android-DONE on Day 11; that is Day 12.
- End with the Day 11 close report, then stop; Day 12 needs separate approval.

## Open blockers and reminders

1. **Day 20 blocker — SVG time profile.** Break down cycle/concurrent SVG time
   (path-string generation, native parse, UI-thread commit). Try reduced
   precision, fewer cubic segments, caching, and a translate-based wave.
2. **Day 20 blocker — Skia size check.** Confirm whether 29.78 MB per ABI is
   the compressed/stripped APK delta or the uncompressed library size; amend
   ADR-002 if misleading.
3. **Day 30 ADR amendment — loading indicator / wavy progress.** Use the
   120 Hz numbers: SVG concurrent 54 fps vs Skia ~111 fps. Decide SVG, Skia
   optional peer, or hybrid; `PathCanvas` stays the only renderer import.
4. **Day 45 blocker — icon subset CLI.** Build the app-used-name subset from
   the upstream variable font, preserving all four axes (`U-14`).
5. **Day 47 — per-role token gallery pages.** Colour schemes, dynamic colour
   and shape tokens; accepted as Android-DONE on value-golden evidence, not a
   Release Gate #2 blocker.
6. **Phase D — iOS and accessibility.** No row can be Release-DONE before
   Days 40–42.

## Day 11 progress

- Started 2026-11-28. Source extraction and implementation in progress.
