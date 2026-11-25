# Known Deviations

Intentional or unavoidable differences from the Compose Material3 1.5.0 reference. **Empty is the goal.** An entry requires evidence (screenshot/diff report path), a reason, and an owner decision reference. Thresholds are never loosened here; a global threshold change requires an approved ADR (Core Rule 8).

**Last updated:** 2026-11-25 (Day 0)

| # | Component | Scene | Expected (Compose) | Ours | Evidence | Reason | Owner decision | Status |
|---|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — | — |

No implementation exists yet, so there are no deviations. The **spec-verified** surfaces in `COMPONENT_MATRIX.md` (SideSheet, Banner, Avatar, DataTable, Accordion) have no Compose reference; they are verified against measured m3 spec assertions and a self-regression baseline under ADR-005, and are not deviations by themselves. Any measured miss against their spec file becomes a deviation here.

## Policy

1. Attempt a real fix first; three genuine attempts before logging a deviation.
2. Every deviation gets a diff report under `docs/diff-reports/<date>/` and a side-by-side crop.
3. Re-test on every baseline bump (Compose 1.6, CMP 1.13 stable).
4. A deviation that affects a public API needs an ADR, not just a row here.
