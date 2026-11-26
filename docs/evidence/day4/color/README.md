# Day 4 — Colour system evidence

**Status:** PASS under the verification boundary in **ADR-009**. Default Compose schemes and the API-31 native dynamic path are exact; seed-generated variants are **MCU 2021 spec-verified**, not Compose-verified.

**Date:** 2026-11-26
**Device:** Pixel 2 AVD `M3E_API31` — API 31, 1080×1920, 420 dpi (2.625×), SwiftShader/ANGLE, font scale 1.0, night mode off.
**References:** Compose Material3 **1.5.0**; `@material/material-color-utilities` **0.4.0** (`specVersion: '2021'`, `platform: 'phone'`); `com.google.android.material:material` **1.11.0** as an independent Java oracle only.
**App under test:** gallery release APK `com.nasyxrakeeb.m3egallery`, RN 0.88.1, native module `M3EDynamicColor`.

## Headline

| # | Claim | Result | Evidence |
|---|---|---|---|
| 1 | Compose default light / dark / expressive-light schemes match extracted tokens exactly | **144/144 role values, 0 differences** | `compose-dump.json` → `defaults`; `composeGoldens.test.ts` |
| 2 | API-31 device dynamic scheme matches the TS port of Compose’s role mapping exactly | **96/96 role values** (48 light + 48 dark), **0 differences** | `compose-dump.json` → `dynamic`; `native-dynamic-payload.json`; `composeGoldens.test.ts` |
| 3 | Compose role mapping for 6 seeds × 9 variants × light/dark | **108/108 schemes, 5,184/5,184 role values, 0 differences** | `compose-dump.json` → `mapped`; `compose-palettes.json`; `composeGoldens.test.ts` |
| 4 | MCU generator for 6 seeds × 9 variants × 4 contrast levels × light/dark | **432/432 schemes, 20,736/20,736 role values, 0 differences** | `mcu-goldens.json`; `mcuGoldens.test.ts` |
| 5 | Native dynamic colour on Android 12 (API 31) | **available, `kind="tones"`, 96/96 values exact** | `native-dynamic-payload.json` |
| 6 | Independent Java oracle (`material` 1.11.0) cross-check | **5,740/20,736 values differ (27.68%)**, expected spec-generation drift; **not a gate** | `java-oracle-summary.json` |

No threshold, scene, or fidelity baseline changed. The only tolerance used anywhere is exact equality; the “within 1 RGB unit” allowance in the Day 4 plan was not needed for any Compose comparison.

## Why there are no literal Compose seed/variant goldens

Compose Material3 1.5.0 has **no public seed-to-scheme or variant-to-scheme API**:

- Public: `lightColorScheme()`, `darkColorScheme()`, `expressiveLightColorScheme()`, `dynamicLightColorScheme(context)`, `dynamicDarkColorScheme(context)`.
- Internal: `dynamicLightColorScheme31(TonalPalette)` / `dynamicDarkColorScheme31(TonalPalette)` and the API-34 equivalents.
- `TonalPalette` is internal and constructed from **87** `Color` longs; intermediate surface tones are derived from the tone-40 colour with an internal `Cam`.
- There is no seed argument, no variant argument, and no contrast argument in the public API.

The Day 4 requirement is therefore split into three independently checkable claims:

1. **Defaults** — exact against a Compose device dump.
2. **Compose role mapping** — feed MCU tonal palettes into Compose’s own internal API-31 mapping through reflection and compare our TypeScript port. This exercises Compose’s role table and intermediate-tone derivation across the full seed × variant × light/dark matrix without pretending Compose has a seed API.
3. **Seed generation** — exact against MCU 0.4.0 goldens, the reference implementation of the Material colour spec. These schemes are **spec-verified**, never Compose-verified.

The Compose reference app (`apps/reference-compose/.../SchemeDumpActivity.kt`) performs the reflection and writes `files/scheme-dump.json`. It is a diagnostic harness only; no reflection code ships in the library.

## Method

### 1. Compose defaults

`SchemeDumpActivity` calls `lightColorScheme()`, `darkColorScheme()`, and `expressiveLightColorScheme()` and serialises all 48 roles. The TypeScript defaults come from the Day 2 token extractor (`colorLight`, `colorDark`, and the four expressive-light overrides). The test compares all three schemes role-by-role.

Expressive light differs from standard light in exactly four roles, as expected:

```
onPrimaryContainer   #4F378B
onSecondaryContainer #4A4458
onTertiaryContainer  #633B48
onErrorContainer     #8C1D18
```

### 2. Compose role mapping over 6 seeds × 9 variants

`tools/color/generate-goldens.mjs` writes `compose-palettes.json`: the 13 Android-exposed tones (0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100) for five tonal ranges, for each of 54 seed × variant pairs.

`SchemeDumpActivity` reads that file from assets, constructs the internal 87-tone `TonalPalette` (using Compose’s own `Cam` for the intermediate tones), calls `dynamicLightColorScheme31` / `dynamicDarkColorScheme31`, and dumps the 108 resulting schemes. The TypeScript `composeSchemeFromTonalPalette()` performs the same mapping with MCU’s `Hct`; the test compares every role.

Seeds: `#6750A4`, `#006A6A`, `#B3261E`, `#386A20`, `#7D5260`, `#4285F4`.
Variants: monochrome, neutral, tonalSpot, vibrant, expressive, fidelity, content, rainbow, fruitSalad.

**Result:** 108 schemes, 5,184 role values, **0 differences**.

### 3. MCU generator matrix

`tools/color/generate-goldens.mjs` also writes `mcu-goldens.json`: 6 seeds × 9 variants × 4 contrast levels (`-1`, `0`, `0.5`, `1`) × light/dark = **432** schemes, each with all 48 roles. The test calls `createColorScheme()` for every cell and compares every role.

**Result:** 432 schemes, 20,736 role values, **0 differences**. The cache test also confirms identical options return the same frozen object.

### 4. Native dynamic colour

The native module returns a JSON string so the payload shape stays out of codegen:

- **API 31–33:** `{ kind: 'tones', apiLevel, tones }` — 13 tones for each of the five ranges. TypeScript derives the intermediate tones with `Hct` and applies `composeSchemeFromTonalPalette()`.
- **API 34+:** `{ kind: 'roles', apiLevel, light, dark }` — 43 `system_*` role resources per mode. The five missing roles (`error`, `onError`, `errorContainer`, `onErrorContainer`, `scrim`) are filled from the Compose baseline, matching Compose’s dynamic overloads.
- **Below API 31 / non-Android / malformed payload:** `getDynamicColorSchemes()` returns `null`; the provider keeps its static Compose scheme. The bridge is optional (`TurboModuleRegistry.get`, not `getEnforcing`, at the call site).

On the API 31 release APK:

```
M3E_DYNAMIC_AVAILABLE true
M3E_DYNAMIC_PAYLOAD {"light":{...},"dark":{...},"apiLevel":31,"kind":"tones"}
```

Comparing that payload to Compose’s `dynamicLightColorScheme` / `dynamicDarkColorScheme` on the same emulator gave **0/48 light and 0/48 dark differences**.

API 34+ is source-mapped but not yet emulator-verified; see `U-24`. It is not required for the Day 4 exit (“API 31+”), but must be run before the API-34 compatibility claim.

## Spec-generation drift (important)

MCU 0.4.0’s `2021` spec is a **later revision** than the mapping in Compose 1.5.0 and material-java 1.11.0. For non-fidelity light schemes, the revised spec uses on-container tone **30**; Compose API-31 and material-java use tone **10**.

Example for tonalSpot, seed `#6750A4`, light:

| Role | MCU 0.4.0 `2021` (ours) | Compose API-31 mapping | material 1.11.0 |
|---|---|---|---|
| `onPrimaryContainer` | `#4D3D75` | `#201047` | `#201047` |
| `onErrorContainer` | `#93000A` | `#410E0B` (baseline) | `#410002` |

This is why generated schemes are **MCU-spec-verified**, not Compose-verified. The default Compose schemes and the native dynamic path use Compose tokens/resources directly and remain exact.

### Java oracle summary

`compose-dump.json.materialJava` contains 432 independent `MaterialDynamicColors` schemes from `com.google.android.material:material:1.11.0`. `tools/color/compare-goldens.mjs` compares them to MCU 0.4.0 and writes `java-oracle-summary.json`.

| Contrast | Differences / values | Share |
|---|---:|---:|
| `-1` | 432 / 5,184 | 8.33% |
| `0` (standard) | 321 / 5,184 | 6.19% |
| `0.5` | 2,107 / 5,184 | 40.65% |
| `1` | 2,880 / 5,184 | 55.56% |
| **All** | **5,740 / 20,736** | **27.68%** |

At standard contrast, the 321 differences are 249 light + 72 dark and are confined to nine roles: `onErrorContainer`, `onPrimaryContainer`, `onSecondaryContainer`, `onTertiaryContainer`, `primary`, `primaryContainer`, `secondaryContainer`, `tertiary`, `tertiaryContainer`. The remaining divergence at non-standard contrast comes from contrast-curve revisions. This is recorded as **D-002** and is not a release gate.

## Reproduction

```sh
# 1. MCU goldens + Compose palette inputs
node --import ./tools/color/register-mcu-loader.mjs tools/color/generate-goldens.mjs

# 2. Compose dump (API 31 emulator)
cd apps/reference-compose
./gradlew :app:assembleDebug
adb -s emulator-5554 install -r app/build/outputs/apk/debug/app-debug.apk
adb -s emulator-5554 shell am start -n com.nasyxrakeeb.m3ereference/.SchemeDumpActivity
adb -s emulator-5554 exec-out run-as com.nasyxrakeeb.m3ereference \
  cat files/scheme-dump.json > ../../docs/evidence/day4/color/compose-dump.json

# 3. Native dynamic payload (release gallery, probe enabled at bundle time)
# `--no-daemon` guarantees the bundler inherits the env var.
cd ../gallery/android
EXPO_PUBLIC_M3E_DYNAMIC_PROBE=1 ./gradlew --no-daemon :app:assembleRelease
adb -s emulator-5554 install -r app/build/outputs/apk/release/app-release.apk
adb -s emulator-5554 shell monkey -p com.nasyxrakeeb.m3egallery \
  -c android.intent.category.LAUNCHER 1
adb -s emulator-5554 logcat -d | grep 'M3E_DYNAMIC_PAYLOAD' | tail -1 | \
  sed 's/.*M3E_DYNAMIC_PAYLOAD //' > ../../../docs/evidence/day4/color/native-dynamic-payload.json

# 4. Comparisons and tests
node tools/color/compare-goldens.mjs
pnpm --filter react-native-material-expressive test
```

The MCU package is ESM with extensionless internal imports, which plain Node rejects. `tools/color/mcu-loader.mjs` resolves the extensions; the same package is transformed by Babel under Jest via the package’s `transformIgnorePatterns` exception for `@material`.

### Autolinking note

Gradle initially omitted `:react-native-material-expressive` even though Expo autolinking reported it with the correct `sourceDir`, `packageImportPath`, and `packageInstance`. A stale `apps/gallery/android/build/generated/autolinking/autolinking.json` was the cause; deleting that generated directory regenerated the config and the module appeared. `build/` is git-ignored, so a clean clone is unaffected. The temporary debug `println` in `settings.gradle` was removed.

## Limitations

- Compose 1.5.0 has no seed/variant API; the seed dimension is MCU-verified by design (ADR-009).
- API 34+ dynamic role resources are source-derived only (`U-24`).
- `material` 1.11.0 is an older spec generation; it is a cross-check, not a reference.
- Dynamic colour is Android-only. iOS and web use the static Compose schemes.
- The provider’s `seed` option affects the generated expressive **dark** scheme in `mode="expressive"` only. A seed-generated light scheme is available through `createColorScheme()` + `lightScheme`; this is intentional and documented in `M3ThemeOptions`.
- The gallery logs the native payload at Android startup only when `EXPO_PUBLIC_M3E_DYNAMIC_PROBE=1` is set at bundle time. This is gallery instrumentation, not library runtime logging; the committed payload was captured with the probe enabled.

## Files

| File | Purpose |
|---|---|
| `compose-palettes.json` | 54 seed × variant palettes, 13 tones each; input to the Compose reflection harness |
| `mcu-goldens.json` | 432 MCU schemes × 48 roles; generator golden |
| `compose-dump.json` | Compose defaults, device dynamic schemes, 108 mapped schemes, 432 material-java oracle schemes |
| `native-dynamic-payload.json` | API 31 release-app native payload |
| `java-oracle-summary.json` | Generated comparison summary |
| `../../../../tools/color/generate-goldens.mjs` | MCU + palette generator |
| `../../../../tools/color/compare-goldens.mjs` | Java oracle / native dynamic comparison |
| `../../../../packages/react-native-material-expressive/src/color/__tests__/composeGoldens.test.ts` | Defaults, Compose mapping, native exactness |
| `../../../../packages/react-native-material-expressive/src/color/__tests__/mcuGoldens.test.ts` | 432-scheme MCU generator gate |

## Decision

Day 4 is closed under ADR-009:

- All 9 variants, 4 contrast levels, 48 roles, light/dark are implemented and MCU-golden-tested.
- All 6 seeds × 9 variants × light/dark are exercised through Compose’s own role mapping, with 0 differences.
- Default Compose schemes and the API-31 native dynamic path are exact.
- The seed-generated schemes are explicitly **spec-verified**, not Compose-verified; the limitation is recorded as D-002 and must be reported in user-facing docs.
