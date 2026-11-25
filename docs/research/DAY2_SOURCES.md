# Day 2 sources and extraction log

**Date:** 2026-11-25. Every JAR below was downloaded from Google Maven on this machine on that date; `fetch-sources.sh` re-verifies each SHA-256 before extraction, and CI runs the same check. Large binaries stay in the git-ignored `tools/extract-tokens/vendor/`; the committed specs and this log are the traceable artifacts.

---

## 1. Pinned artifacts

| Group | Artifact | Version | SHA-256 | Size (bytes) |
|---|---|---|---:|---:|
| `androidx.compose.material3` | `material3` | 1.5.0 | `d389bb542a1637dc202e715b279a178be1b0d51886234fe2810a92427c07b2a6` | 849,385 |
| `androidx.compose.material3` | `material3-ripple` | 1.5.0 | `1f57e1b16ca4558977d3b4b94beefc8693dd1cb49634cf90dc8aa5ef74704efd` | 23,258 |
| `androidx.compose.material3` | `material3-window-size-class` | 1.5.0 | `2bca45d9e3ec62e52e53a7a580838ab89a46fa1ae0750311a5604ffa00e4c521` | 11,223 |
| `androidx.compose.material3` | `material3-adaptive-navigation-suite` | 1.5.0 | `fdbc86bff0c7f9f4ca8fdf9097515297af39200f65a82129d269f4a4fe11de64` | 18,421 |
| `androidx.compose.material3.adaptive` | `adaptive` | 1.3.0 | `557c3abf86a3b2659aafbb0db8441295aae6a1f90e701033a218003ba545541c` | 15,719 |
| `androidx.compose.material3.adaptive` | `adaptive-layout` | 1.3.0 | `bd87db4bdbf51d7df02872b0c7e95ae82a3b7c61b7f2e021c407d30a899c22ca` | 100,383 |
| `androidx.compose.material3.adaptive` | `adaptive-navigation` | 1.3.0 | `c64c0ddec14fed5daae373c535c8e81e1f0ef1922aa258b624828448de18346d` | 11,638 |
| `androidx.graphics` | `graphics-shapes` | 1.1.0 | `50586aa6c7b3a542a51b2abaf659f7a6c33d8c5d637d8f1a57aaf518dcb74f3d` | 63,807 |

URL pattern: `https://dl.google.com/dl/android/maven2/<group path>/<artifact>/<version>/<artifact>-<version>-sources.jar`.

`material3:1.5.0` is the only artifact in this set containing `*Tokens.kt` (120 files under `commonMain/androidx/compose/material3/tokens`). The other seven are vendored and hash-pinned because Day 2 scope names them and later work needs them: ripple/focus ring, window size classes, adaptive scaffolds/navigation, and the `graphics-shapes` polygon engine behind `MaterialShapes`.

## 2. Toolchain

| Tool | Version | Note |
|---|---|---|
| Node | 24.22.3 | Repo engine floor `>=22.14.0` |
| pnpm | 12.23.0 | Corepack-pinned |
| `tsx` | 4.23.15 | Runs the TypeScript extractor without a build step |
| TypeScript | 6.0.3 | Strict, `noUncheckedIndexedAccess` |
| Prettier | 3.10.1 | Formats generated JSON/TS with the repo config |

The extractor is a private workspace package: `tools/extract-tokens`. Commands:

```sh
pnpm --filter @react-native-material-expressive/extract-tokens fetch     # download + hash check
pnpm --filter @react-native-material-expressive/extract-tokens extract   # fetch + write specs/TS
pnpm --filter @react-native-material-expressive/extract-tokens check     # drift check (CI)
pnpm --filter @react-native-material-expressive/extract-tokens test      # parser/resolver unit tests
pnpm --filter @react-native-material-expressive/extract-tokens spotcheck # seeded 20-value plan
```

## 3. Extraction results

From `material3:1.5.0-sources.jar`:

| Measure | Count |
|---|---:|
| Token files (`*Tokens.kt`) | 120 |
| Token declarations | 2,671 |
| Resolved declarations | 2,641 |
| Composite `TypographyTokens` declarations | 30 |
| Component spec files (`docs/specs/*.json`, excluding manifest/global) | 104 |
| Typography roles (baseline + emphasized) | 30 |
| Color roles | 48 light / 48 dark |
| Shape tokens / corner-size tokens | 15 / 9 |
| Elevation levels | 6 |
| Motion durations / cubic beziers | 16 / 10 |
| Standard / expressive springs | 6 / 6 |
| State layer opacities | 4 |

Every non-composite declaration resolves to a typed value (`dp`, `sp`, `number`, `color`, `color-role`, `shape`, `shape-role`, `typography-role`, `motion-role`, `font-family`, `font-weight`, `cubic-bezier`, `corner-size`, `enum`); there are **0 raw** records. The 30 `TypographyTokens` entries are composite `TextStyle.copy(...)` expressions and are expanded in `docs/specs/typography.json` into all 30 roles with per-field source lines.

### File layout

```text
docs/specs/
  index.json                 # manifest: sources, counts, per-file mapping
  tokens.json                # palette, light/dark roles, shape, elevation,
                             # type scale, typeface, motion, state, key tokens
  typography.json            # 30 resolved roles + per-field sources
  <component>.json           # 104 files, one per component token object
  README.md
```

Each record is:

```jsonc
{
  "token": "FilledButton.ContainerHeight",
  "value": 40,
  "unit": "dp",
  "expression": "40.0.dp",
  "source": "commonMain/androidx/compose/material3/tokens/FilledButtonTokens.kt:31",
  "sourceVersion": "material3:1.5.0",
  "sourceSha256": "d389bb54…b2a6"
}
```

`expression` preserves the Kotlin right-hand side (useful when a token references another token); `value` is the resolved value. Every record carries its own source version and JAR hash, satisfying U-13's requirement that the extractor record the source version per record.

### Parser and guardrails

- `kotlinParser.ts` parses the machine-generated subset used by these files: `object`/`class`, `val`/`inline val`/`const val`, getter form (`val X: T` + `get() = …`), and multi-line constructor calls. Abstract declarations are skipped.
- `main.ts` re-reads each declaration's source line and asserts it contains `val <Name>` before any spec is written. This catches continuation-line/line-number drift.
- `EXPECTED` pins 120 files / 2,671 declarations / 104 component objects / 30 typography roles / 48 color roles for `material3:1.5.0`. A Compose bump must update those numbers deliberately.
- Output ordering is deterministic (files and tokens sorted; prettier-formatted). `check` rebuilds in memory and compares exact bytes, reporting missing, changed, and stale files.

### Generated TypeScript

`packages/react-native-material-expressive/src/tokens/generated/`:

| Module | Exports |
|---|---|
| `global.ts` | `specVersion`, `colorLight`, `colorDark`, `palette`, `shapes`, `cornerSizes`, `elevation`, `typography`, `motion`, `state`, plus key-derived types |
| `components.ts` | `componentTokens` (104 objects) and `ComponentTokenValue` |
| `key-tokens.ts` | `colorSchemeKeyTokens`, `shapeKeyTokens`, `typographyKeyTokens`, `motionSchemeKeyTokens` |
| `index.ts` | re-exports |

All modules carry the Apache-2.0 banner and the sources-JAR SHA-256. `src/tokens/index.ts` re-exports them for internal use; the public 1.0 API will wrap them in the theme provider rather than exposing the raw maps.

## 4. Spot-check against m3.material.io

- Sampler: `tools/extract-tokens/src/spotcheck.ts`, seed `m3e-day2-2026-11-25`, stratified across typography, light/dark color, shape, elevation, motion, and state.
- Plan: `docs/evidence/day2/spotcheck-plan.json` (20 picks, with Compose source lines).
- Result: **20/20 matched**. Table, URLs, and method: `docs/evidence/day2/SPOTCHECK.md`.
- Rendered page text is retained in `docs/evidence/day2/m3/` (captured with headless Chrome 158 over CDP).
- One methodological caveat: legacy easing is rendered as a cubic-bezier swatch without printed numbers; that row was verified against the page's embedded resolved token JSON. Recorded in the spot-check.

## 5. Limits

- Only the Compose token files are parsed. Compose implementation behavior (layout formulas, state transitions, spring routing, a11y semantics) is **not** in these JSON records; it is captured per component in sibling `*.behavior.md` files as each component's build day starts. The Day 2 exit gate does not require those files, and no component's `spec` cell is ticked by token extraction alone.
- The extractor does not treat m3.material.io as truth. It cross-checks; Compose wins on conflict (Core Rule 1). The one Day 2 divergence found (emphasized easing fallback) is `U-20` in `docs/UNVERIFIED.md`.
- The specs describe `material3:1.5.0`. `1.6.0-alpha01` is not adopted; a future diff must be reviewed through an ADR (U-13).
