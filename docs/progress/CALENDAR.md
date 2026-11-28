# Calendar — best-case and realistic projections (2026-11-28)

A "day" is a unit of scope, not a clock (PLAYBOOK §0.6). The **best-case** column
is the pure one-day-per-scope projection with no holiday, weekend or availability
buffer. The **realistic** column assumes every Phase B and Phase C component
takes **1.5× its planned days**; Phase D and E keep their planned durations but
start after the realistic Phase C end. Phase A is closed, so both columns match.

| Phase | Days | Scope | Best-case start | Best-case end | Realistic start | Realistic end |
|---|---|---|---:|---:|---:|---:|
| A — Foundations | 1–10 | tokens, color, typography, shapes, motion, interaction, provider/Text/Icon/overlay/layout | 2026-11-25 | **2026-11-28** | 2026-11-25 | **2026-11-28** |
| B — Actions, selection, input | 11–24 | Button → TimePicker; Phase B gate at Day 24 | 2026-11-29 | 2026-12-12 | 2026-11-29 | 2026-12-19 |
| C — Containment, navigation, feedback | 25–37 | Card → Scaffolds; Phase C gate at Day 37 | 2026-12-13 | 2026-12-25 | 2026-12-20 | 2027-01-08 |
| D — Parity, integration, platforms, docs | 38–50 | Paper parity, a11y, iOS, web, perf, API, CI, docs, dogfooding | 2026-12-26 | 2027-01-07 | 2027-01-09 | 2027-01-21 |
| E — Hardening & release | 51–60 | bug bashes, diff backlog, security, RC, launch, `1.0.0` | 2027-01-08 | 2027-01-17 | 2027-01-22 | 2027-01-31 |

## How the realistic column is computed

- Phase B is 14 planned days (Days 11–24). At 1.5× it is **21 days**, inclusive:
  2026-11-29 through 2026-12-19.
- Phase C is 13 planned days (Days 25–37). At 1.5× it is **19.5 days**, rounded
  up to **20 days**, inclusive: 2026-12-20 through 2027-01-08.
- Phase D (13 days) and Phase E (10 days) keep their planned durations and shift
  to start after the realistic Phase C end.

## Schedule risks (no buffer added)

1. **Day 10 overran its one-day slot.** The original scope plus the extended
   `M3Provider`/`Text` scope and the four-profile converter measurement took
   longer than one calendar day. Phase B starts on 2026-11-29 in both columns;
   its end is 2026-12-12 best-case or 2026-12-19 realistic.
2. **Day 20 blockers.** The SVG time profile and Skia size verification are not
   done. They must close before Day 20 (Slider motion/gestures). If they slip,
   both columns slip by the same amount; no buffer is reserved.
3. **Text thresholds are no longer a cross-cutting risk.** ADR-010 was approved
   on 2026-11-28. The single 320/1.3 miss is recorded in `D-001`; the matrix is
   re-run whenever text code or fonts change.
4. **iOS/a11y are Phase D.** No row can be Release-DONE before Days 40–42. The
   Phase B/C gates only require Android-DONE, so this is expected; Release Gate
   #2 remains the long pole. Phase D is 2026-12-26–2027-01-07 best-case or
   2027-01-09–2027-01-21 realistic.
5. **Physical-device coverage.** The Xiaomi cannot inject input events (MIUI
   `INJECT_EVENTS`), so gesture/back/keyboard checks are emulator-only until a
   second device or a rooted test path is available.
