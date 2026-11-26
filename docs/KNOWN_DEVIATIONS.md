# Known Deviations

Intentional or unavoidable differences from the Compose Material3 1.5.0 reference. **Empty is the goal.** An entry requires evidence (screenshot/diff report path), a reason, and an owner decision reference. Thresholds are never loosened here; a global threshold change requires an approved ADR (Core Rule 8).

**Last updated:** 2026-11-26 (Day 5)

| # | Component | Scene | Expected (Compose) | Ours | Evidence | Reason | Owner decision | Status |
|---|---|---|---|---|---|---|---|---|
| D-001 | Text rasterization (all text) | `text`, `trivial`; diagnostic `paragraph`, `labels`, 30 `type-*` scenes | Compose `TextMotion.Static` + fractional sp/dp | 4 AA-aware px / 1,745 exact px on `text`; 30-role diagnostic: 9/30 faithful scenes inside the 0.05% gate, worst 2,745 AA px / 0.6224%; 30/30 inside the gate on a matched integer rendering grid, 26 byte-identical | `docs/evidence/day4/text-scaling/`, `docs/evidence/day5/typography/` | RN hardcodes subpixel+linear text and integer physical-pixel font sizes/placement; Compose defaults do not | Nasyx: keep existing gate, document (U-23); Day 5 interpretation flagged (U-25) | Accepted — inherent |
| D-002 | Colour generator (seed-generated schemes, all variants/contrast levels) | N/A (unit/golden) | Compose 1.5.0 API-31 mapping / tokens for the same tonal palette | MCU 0.4.0 `2021` mapping; e.g. tonal-spot `#6750A4` light `onPrimaryContainer` is `#4D3D75` (ours) vs `#201047` (Compose API-31 mapping) | `docs/evidence/day4/color/README.md`, `mcu-goldens.json`, `compose-dump.json`, `java-oracle-summary.json` | MCU 0.4.0 implements the revised 2021 on-container tone mapping (tone 30 light); Compose 1.5 and material-java 1.11 use the earlier tone-10 mapping. Compose has no seed-to-scheme API, so there is no Compose reference for generated variants. At standard contrast, 321/5,184 role values (6.19%) differ in the Java cross-check; all default tokens and the native API-31 dynamic path are exact. | ADR-009: generated schemes are MCU-spec-verified, not Compose-verified | Accepted — documented limitation |

The colour system and text harness now exist; component rows will add their own deviations as components land. The **spec-verified** surfaces in `COMPONENT_MATRIX.md` (SideSheet, Banner, Avatar, DataTable, Accordion) have no Compose reference; they are verified against measured m3 spec assertions and a self-regression baseline under ADR-005, and are not deviations by themselves. Any measured miss against their spec file becomes a deviation here.

D-001 is a cross-stack measurement deviation, not a component defect. It is recorded because the literal “cross-stack exact zero” test is not met under faithful Compose defaults. No threshold was changed: the PLAYBOOK §7 gate still uses 0.05% AA-aware pixels, and the Day 3 gate scene remains at 4 px / 0.0009%.

Day 5 extends D-001 to the full 30-role type scale. The faithful run puts **9/30** one-line type scenes inside the 0.05% AA-aware budget (worst: `displayLarge`, 2,745 px / 0.6224%). A second diagnostic run that normalizes the rendering grid (Compose `TextMotion.Animated`, integer physical font sizes, floored offsets) puts **30/30** inside the budget, with **26/30 byte-identical**; the four remaining scenes have a 1 px baseline offset (max 105 AA px / 0.0238%). The matched run is evidence that sizes, weights, widths, tracking, and line heights are correct; it is not a shipping mode. The standard five-scene gate is unchanged and remains green. The faithful-vs-matched interpretation is flagged as `U-25`; no threshold or scene was tuned.

D-002 is a scope boundary, not a regression: the default Compose schemes and the Android API-31 dynamic path are exact, while the opt-in seed generator follows MCU 0.4.0. It must not be described as Compose parity. The API-34+ dynamic role path remains a separate open verification item (`U-24`).

## Policy

1. Attempt a real fix first; three genuine attempts before logging a deviation.
2. Every deviation gets a diff report under `docs/diff-reports/<date>/` and a side-by-side crop.
3. Re-test on every baseline bump (Compose 1.6, CMP 1.13 stable).
4. A deviation that affects a public API needs an ADR, not just a row here.
