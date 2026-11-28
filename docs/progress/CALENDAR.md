# Re-baselined calendar (2026-11-28)

A "day" is a unit of scope, not a clock (PLAYBOOK §0.6). This table is the
projection **without a holiday buffer**: no days are reserved for holidays,
weekends, or unconfirmed availability. If a day overruns, the dates below slide
by the overrun; they are not padded in advance.

| Phase | Days | Scope | Start | End |
|---|---|---|---|---:|
| A — Foundations | 1–10 | tokens, color, typography, shapes, motion, interaction, provider/Text/Icon/overlay/layout | 2026-11-25 | **2026-11-28** (Day 10 close) |
| B — Actions, selection, input | 11–24 | Button → TimePicker; Phase B gate at Day 24 | 2026-11-29 | 2026-12-12 |
| C — Containment, navigation, feedback | 25–37 | Card → Scaffolds; Phase C gate at Day 37 | 2026-12-13 | 2026-12-25 |
| D — Parity, integration, platforms, docs | 38–50 | Paper parity, a11y, iOS, web, perf, API, CI, docs, dogfooding | 2026-12-26 | 2027-01-07 |
| E — Hardening & release | 51–60 | bug bashes, diff backlog, security, RC, launch, `1.0.0` | 2027-01-08 | 2027-01-17 |

## Schedule risks (no buffer added)

1. **Day 10 overran its one-day slot.** The original scope (four foundations)
   plus the extended `M3Provider`/`Text` scope and the four-profile converter
   measurement took longer than one calendar day. Phase B starts one day late
   relative to a pure one-day-per-day projection.
2. **Day 20 blockers.** The SVG time profile and Skia size verification are not
   done. They must close before Day 20 (Slider motion/gestures). If they slip,
   Day 20 and every later day slip by the same amount.
3. **Text thresholds.** If Nasyx does not accept the measured ADR-010 budgets,
   every Phase B component with a text label needs a different gate; that is a
   cross-cutting schedule risk, not a per-component one.
4. **iOS/a11y are Phase D.** No row can be Release-DONE before Days 40–42. The
   Phase B/C gates only require Android-DONE, so this is expected, but Release
   Gate #2 remains the long pole.
5. **Physical-device coverage.** The Xiaomi cannot inject input events (MIUI
   `INJECT_EVENTS`), so gesture/back/keyboard checks are emulator-only until a
   second device or a rooted test path is available.
