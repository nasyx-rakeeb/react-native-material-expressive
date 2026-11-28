# Day 10 — Provider, Text, Icon, Overlay/Portal, window size classes, RTL (foundation gate)

Day 10 adds the foundations the PLAYBOOK scheduled for the gate: `M3Provider`
(theme + reduce-motion + window size class + layout direction), `Text` (30
roles, content colour, Compose non-linear font scaling), the Material Symbols
`Icon`, the shared `OverlayProvider`/`OverlayHost` stack with a declarative
portal, pure window-size-class helpers, and RTL layout utilities. All are
implemented, unit/RNTL tested and exercised in the gallery on `emulator-5554`.
The icon scene is pixel-diffed against Compose Material3 1.5.0 with all four
variable axes; `Text` is measured across 30 roles at four density/font-scale
profiles with the Compose `FontScaleConverter` active.

- **Status:** **CLOSED (approved by Nasyx, 2026-11-28).** The foundation is
  **22/22 Android-DONE and 0/22 Release-DONE**. Typography and `Text` use the
  approved ADR-010 `[x] T` evidence; colour schemes, dynamic colour and shape
  tokens use accepted value-golden `[x] V` evidence. Their per-role gallery
  pages are in the Day 47 plan (`BACKLOG.md`).
- **Decisions:** ADR-009 (colour verification boundary), ADR-010 (text
  category and thresholds), ADR-020 (reporting only), ADR-021 (icon font subset
  + path icons), ADR-022 (single overlay stack), ADR-023 (pure window-size
  classes), ADR-024 (RTL helper boundary).
- **Gate:** the existing PLAYBOOK §7 gate is unchanged (`pixelmatch` threshold
  0.1, `includeAA: false`, 0.05% AA-aware, core five scenes). ADR-020 is
  **accepted as reporting only** and does not change the gate. The icon scene is
  an additional tracked category with no new pass/fail threshold. Text uses the
  ADR-010 approved ink/glyph budgets; those budgets do not change the PLAYBOOK
  five-scene gate.

## What shipped

| Area | Files |
|---|---|
| Provider | `src/theme/M3Provider.tsx`, `src/layout/context.tsx`, `src/motion/ReduceMotionContext.tsx` |
| Text | `src/typography/Text.tsx`, `ContentColor.tsx`, `fontScale.ts`, `useFontScale.ts` |
| Material Symbols font | `assets/fonts/MaterialSymbolsOutlined.ttf` (90 glyphs, 116,368 B), `assets/icons/LICENSE`, `assets/icons/NOTICE` |
| Icon | `src/icon/MaterialSymbol.tsx`, `variationSettings.ts`, `paths.ts`, `Icon.tsx`, generated `materialSymbols.ts` |
| Overlay / Portal | `src/overlay/OverlayProvider.tsx`, `OverlayHost.tsx`, `FocusTrap.tsx`, `platform.ts`, `types.ts` |
| Window size classes | `src/layout/windowSizeClass.ts`, `useWindowSizeClass.ts` |
| RTL | `src/layout/rtl.ts`, `useLayoutDirection.ts`, `index.ts` |
| Gallery | `apps/gallery/src/foundation/FoundationGallery.tsx` (provider + all-role text sections), `screen=foundation` route |
| Scene | `tools/scenes/icon-symbols.json`, `icon` category in `tools/scenes/build.mjs`; 30 `type-*` scenes |
| Compose reference | `apps/reference-compose/.../MainActivity.kt` icon layer + font asset; text scenes at four profiles |
| Tests | 11 suites / **93 tests** under `src/typography/__tests__`, `src/theme/__tests__`, `src/icon/__tests__`, `src/layout/__tests__`, `src/overlay/__tests__` |

## Icon

### Font asset and licence

The upstream `MaterialSymbolsOutlined[FILL,GRAD,opsz,wght].ttf` is
**10,744,832 B**. Shipping it whole would add ~10.7 MB to every app. The
bundled asset is a **90-glyph subset with all four variable axes preserved**:

| Property | Value |
|---|---|
| File | `packages/react-native-material-expressive/assets/fonts/MaterialSymbolsOutlined.ttf` |
| Size | **116,368 B** (1.08% of the full font) |
| SHA-256 | `3b29bd1ca84d209f68cc7ae4127e00d07ba9b8199edcd37ed5e2511e87836c03` |
| Axes | `FILL` 0–1, `wght` 100–700, `GRAD` -50–200, `opsz` 20–48 |
| Glyphs | 90 codepoints, generated into `src/icon/materialSymbols.ts` |
| Licence | Apache License 2.0 (`assets/icons/LICENSE`, 11,357 B) |
| Attribution | `assets/icons/NOTICE` (761 B) |

The licence and NOTICE are copied into the gallery asset pipeline and into both
APKs. The diff run verifies the font bytes in **all four places** — source,
gallery assets, Compose APK and RN APK — and reports the same SHA-256 for each
(`results.json` → `fonts.material-symbols`). The font is not loaded from a CDN
and no network font fetch exists.

### Component behaviour

- `MaterialSymbol` accepts `fill`, `weight`, `grade`, `opticalSize`, clamps each
  to the upstream `fvar` range and emits one `fontVariationSettings` string.
- Capability detection (`getVariableFontSupport`) reports whether the running
  platform applies the axes. On unsupported Android (< 26) the prop is omitted
  and the component renders the font default instead of silently claiming the
  axes; `applied: false` is exposed to callers.
- `Icon` renders the 12 internal glyphs from SVG path data (no font asset):
  `check`, `close`, `menu`, `search`, `arrow_back`, `arrow_forward`,
  `chevron_right`, `expand_more`, `add`, `remove`, `more_vert`, `star`.
  Directional glyphs mirror in RTL only when `mirror` is set; logos and
  checkmarks never mirror.
- Icons are fixed-size and **do not scale with font scale**
  (`allowFontScaling={false}`), matching Compose `Icon`.
- Paint alignment: Material Symbols has upm 960, hhea ascent 1056 / descent
  -96 (1.1em/0.1em). Compose centres that 1.2em line box in a 1em
  `lineHeight`, putting the baseline at 1.0em. RN puts it at
  `lineHeight - descent` (0.9em), so the component shifts paint down by
  `roundToNearestPixel(size × 0.1)` and clips to the `size × size` box. This is
  the fix that closed the last 188 AA-aware pixels (see below).

### Android diff

One 320×200 dp scene (`icon-symbols`, 840×525 px at 420 dpi) renders 16 glyphs
covering every axis and the default instance. Both harnesses use the same font
bytes. Three cold boots, one capture per stack per boot:

| Boot | Exact px | AA-aware px | Max Δ | Compose determinism | RN determinism |
|---|---:|---:|---:|---|---|
| 1 | 0 (0.0000%) | 0 (0.0000%) | 0 | 0 exact / 0 AA | 0 exact / 0 AA |
| 2 | 0 (0.0000%) | 0 (0.0000%) | 0 | 0 exact / 0 AA | 0 exact / 0 AA |
| 3 | 0 (0.0000%) | 0 (0.0000%) | 0 | 0 exact / 0 AA | 0 exact / 0 AA |

- Cross-stack: **exact zero, AA-aware zero, max channel Δ 0**.
- Cross-boot (boot 1 vs 2, boot 1 vs 3): **0 exact, 0 AA** for both stacks.
- Content bbox is identical: `102,47 641×445`.
- The report's `gate` is `null` for the `icon` category by design: only the five
  `core` scenes are the PLAYBOOK §7 gate. No threshold was changed or added.

The pre-fix run had 188 AA-aware px (0.0426%) isolated to the bottom edges of
`settings` at wght 500/700 and `info` at GRAD 100/200. Compose clips the glyph
at the 32 dp line box; RN overflowed by 2–4 px. Adding `numberOfLines={1}` and
the clipping wrapper removed the residual completely.

## Core five-scene gate

The `SceneHarness` change initially routed every text layer through the library
`Text`. For the core `text` and `trivial` scenes (no `type-*` role), that
supplied `bodyLarge`'s 24 sp token line height where the old raw RN path used
Roboto Flex's natural line box. The ink box moved up 5 px and the gate read
**3,810 AA-aware px (0.8639%)**, a harness regression, not a component or font
change. Non-role scenes now use raw RN `Text` again and only the `type-*`
scenes use the library `Text`. Re-run on the final APK:

| Scene | Exact px | AA-aware px | Max Δ |
|---|---:|---:|---:|
| `solid` | 0 | 0 (0.0000%) | 0 |
| `rect` | 0 | 0 (0.0000%) | 0 |
| `text` | 1,745 (0.3957%) | **4 (0.0009%)** | 162 |
| `shadow` | 0 | 0 (0.0000%) | 0 |
| `trivial` | 1,745 (0.3957%) | **4 (0.0009%)** | 162 |

The 0.05% budget is 220.5 px; the maximum is 4 px. This is the same result as
Day 3. The exact-different pixels are the known text rasterization residual
(D-001), not a new layout difference: the content bbox is `68,75 395×59` on
both stacks. The `RESULT: cross-stack exact zero is NOT met` line is expected;
the PLAYBOOK gate is AA-aware, not exact zero.

## Overlay / Portal

One `OverlayProvider` owns the stack. `OverlayHost` renders every entry into a
single host; `Portal` is the declarative registration API. The provider never
renders two independent native modal windows, so ordering is deterministic.

| Behaviour | Unit/RNTL | Emulator |
|---|---|---|
| LIFO stack, topmost is the only interactive layer | yes (16 tests) | `overlay=stack` shows depth 2 |
| Back closes **only** the topmost layer | yes | back #1 → `overlay-1`; back #2 → empty |
| Escape closes only the topmost (web/TV) | yes (pure key handler) | not testable on Android emulator |
| Non-dismissible layer consumes back without closing | yes | not exercised manually |
| Scrim belongs to its layer and closes that layer | yes | dialog scrim visible |
| Focus capture on open / restore on close | yes (accessibility props) | no TalkBack image (`U-33`) |
| App subtree inert while a modal is open | yes (`importantForAccessibility`) | inspected, no screen reader |
| Insets are app-provided and merged per layer | yes | notch-less AVD; no inset delta |
| Keyboard avoidance (`padding` Android / `padding` iOS) | yes (behaviour resolver) | dialog stays above the IME |
| Live add/remove of entries without remounting the host | yes | portal demo opens/closes |

Evidence in `gallery/`:

- `overlay-stack.png` + `overlay-stack.log` — depth 2, `overlay-1,overlay-2`.
- `overlay-back-one.png` + `overlay-back-one.log` — first back leaves
  `overlay-1`.
- `overlay-back-two.log` — second back leaves the stack empty.
- `overlay-dialog.png` — centred modal with scrim.
- `overlay-keyboard.png` + `overlay-keyboard.log` — `mInputShown=true`; the
  dialog is fully above the IME (`windowSoftInputMode="adjustResize"` plus the
  host's keyboard-avoiding padding).

Only the emulator-only rows are listed as such; everything else is asserted in
`src/overlay/__tests__/`. A live TalkBack traversal was impossible because the
AVD has no TalkBack package (`U-33`).

## Window size classes

`windowSizeClass.ts` is a pure function; `useWindowSizeClass` subscribes to
`Dimensions` and recomputes. Breakpoints are Compose 1.5.0's, inclusive lower
bounds:

- width: compact < 600 ≤ medium < 840 ≤ expanded
- height: compact < 480 ≤ medium < 900 ≤ expanded

No global listener is installed at import time; the hook subscribes only while
mounted (ADR-023). Unit tests cover every boundary and both dimensions.

Emulator evidence:

| Window | Readout | Classes |
|---|---|---|
| Default AVD (1080×1794 px @ 420 dpi) | 411 × 731 dp | width **compact** · height **medium** |
| Density override 240 dpi (same pixels, 720×1280 dp) | 720 × 1280 dp | width **medium** · height **expanded** |

`gallery/window-compact-medium.png` and
`gallery/window-medium-expanded-density.png`. The app is locked to portrait and
`wm size` letterboxes it on this AVD (the activity window keeps 1080×1794), so
the second row uses `wm density 240` to change the dp window instead; the hook
recomputed from the live `Dimensions` value and the layout reflowed.

## RTL utilities

`rtl.ts` resolves direction from `I18nManager.isRTL` (or an explicit override)
and maps logical start/end to physical edges:

- numeric `start`/`end` padding/margin/inset helpers;
- `textAlign` (`left`/`right` → `start`/`end` semantics);
- `rowDirection` (`row` / `row-reverse`);
- `writingDirection`;
- `mirrorIconTransform` (scaleX −1 only in RTL).

RN logical props (`marginStart`, `paddingEnd`, `start`, `end`) are preferred;
the helpers exist for numeric values, alignment, row direction, writing
direction and icon mirroring only (ADR-024). Unit tests cover LTR, RTL and the
process-wide override.

Emulator preview (`gallery/rtl-preview-on.png`): with the local preview on, the
arrows swap sides and mirror, the row order flips, padding becomes
`left 24, right 16` and `textAlign: right`. `I18nManager.isRTL` stays `ltr`
because the preview is local; a full process RTL restart was not performed
(`U-35`).

## Text and Typography

`Text` implements the 30 M3 roles (15 baseline + 15 emphasized, opt-in per
ADR-006), content-colour inheritance through `Surface`/`ContentColorProvider`,
RTL-aware `align="start"|"end"`, sp overrides, and three font-scale modes:
`compose` (default), `linear` and `none`.

The `compose` mode ports Compose UI 1.12.0's non-linear `FontScaleConverter`
(`src/typography/fontScale.ts`) and applies it to `fontSize`, `letterSpacing`
and `lineHeight`; `allowFontScaling` is disabled in that mode. The line-height
rule matches the measured Compose behaviour: `<1.03` linear, `1.03–1.05` the
global converter, `>1.05` preserve the `lineHeight / fontSize` multiplier.
Unit tests compare every converter table entry.

The converter is measured across 30 `type-*` scenes at four profiles:

| Profile | Total AA px | 0.05% pass | Faithful pass | Worst AA / 1,000 ink | Worst AA / glyph / font px |
|---|---:|---:|---:|---:|---:|
| 420 dpi / 1.0 | 17,798 | 9/30 | 30/30 | 410.0 | 2.63 |
| 420 dpi / 1.3 | 22,658 | 3/30 | 30/30 | 309.6 | 2.72 |
| 320 dpi / 1.0 | 3,174 | 20/30 | 30/30 | 398.6 | 1.63 |
| 320 dpi / 1.3 | 9,480 | 8/30 | 29/30 | 453.7 | 2.84 |

The 1.3 profiles fall from 214,694 / 118,751 AA px (Day 5, linear scaling) to
22,658 / 9,480 with the converter (−89.4% / −92.0%); 420/1.0 is unchanged at
17,798. **119/120** role-profile combinations pass the ADR-010 faithful budget.
The single miss is `type-label-medium-emphasized` at 320/1.3: 453.7 per 1,000
ink against the 450 cap (0.8% over) while its per-glyph value 2.845 passes the
3.0 cap. ADR-010 was approved on 2026-11-28; the miss is recorded in `D-001`
and the `Typography` and `Text` rows are `[x] T`, Android-DONE. Full per-role
table, threshold-independent metrics and reproduction commands:
`docs/evidence/day10/typography/README.md`.

## Gallery

`FoundationGallery.tsx` is reachable at `screen=foundation`. It renders:

- the four variable axes (FILL 0/1; wght 100/400/700; GRAD -50/0/200; opsz
  20/24/48) plus five default-instance glyphs;
- the 12 path icons with names;
- the live window size readout;
- the RTL preview toggle;
- the `M3Provider` demo: nested `reduceMotion` and `layoutDirection` controls
  with the values read back through the public hooks;
- the all-role `Text` grid: 15 baseline roles with an emphasized opt-in switch,
  plus content-colour inheritance from a `Surface`;
- the overlay stack with dialog, sheet, declarative portal and stacked demos;
- logcat markers `overlay_open`, `overlay_stack`, `overlay_dismiss` for
  automated checks.

`gallery/foundation-top.png` shows the header and icon sections;
`gallery/provider-default.png` and `gallery/provider.png` show the nested
provider in its default and `reduceMotion=on` / `layoutDirection=rtl` states;
`gallery/text-roles.png` and `gallery/text-roles-emphasized.png` show the
baseline and emphasized grids; `gallery/foundation-launch.log` shows the launch
markers.

### Xiaomi install check

The release APK was installed on the Xiaomi 2201116SI (Android 13 / API 33,
1080×2400, 440 dpi) and launched. The first build needed the MIUI workaround
(`INSTALL_FAILED_USER_RESTRICTED`, then a manual install from
`/sdcard/Download/m3egallery.apk`); the final build
(203,638,944 B, SHA-256 `7697f925…c9e7a42`) installed directly with
`adb install -r` at 16:09. On-device evidence:

- `xiaomi/foundation.png` — capability detection reports "supported, API 33";
  all four axes and the 12 path icons render in dark theme.
- `xiaomi/overlay-stack.png` + `.log` — dialog and bottom sheet stack to depth
  2 (`overlay-1,overlay-2`).
- `xiaomi/day9-interaction-states.png` + `.log` — a Day 9 scene ships in the
  same APK and renders (`scene_ready scene=interaction-states`).

MIUI denies `adb shell input` (`INJECT_EVENTS`), so back ordering, scrolling,
keyboard avoidance and the RTL toggle could not be exercised on the phone; they
are covered by RNTL and the emulator evidence above. At the extended-build
install the phone was asleep and MIUI denied wake injection, so no new phone
screenshot was taken; `dumpsys window` showed the gallery activity focused and
logcat had no crash. See `xiaomi/README.md`.

## Tests and gates (final run, 2026-11-28)

- `format:check` **PASS**
- `lint` **PASS** (3/3 packages + tools + motion-kind)
- `typecheck` **PASS** (4/4)
- `test` **PASS** — 31 suites / **237 tests**; Day 10 adds 11 suites / 93 tests
- `scenes:check` **PASS** — 43 scenes (core 5 / text 32 / interaction 5 / icon 1)
- Icon diff **PASS** — exact 0, AA-aware 0, max Δ 0, deterministic across 3 boots
- Core five-scene gate **PASS** — `text`/`trivial` 4 AA px (0.0009%), max Δ 162;
  `solid`/`rect`/`shadow` exact 0. Same numbers as Day 3 after the harness fix
  above.

## Reproduce

Full icon diff (three cold boots):

```bash
node tools/pixel/run.mjs \
  --scenes icon-symbols --repeats 1 --scene-repeats 1 \
  --out docs/evidence/day10/diff --label day10
```

Resume from boot 2 (the run used for this report):

```bash
node tools/pixel/run.mjs --skip-boot 1 \
  --scenes icon-symbols --repeats 1 --scene-repeats 1 \
  --out docs/evidence/day10/diff --label day10
```

Core five-scene gate (one boot, one repeat per stack):

```bash
ANDROID_SERIAL=emulator-5554 M3E_SKIP_BOOT=1 M3E_BOOTS=1 M3E_REPEATS=1 \
  M3E_SCENE_REPEATS=1 M3E_SCENES=solid,rect,text,shadow,trivial \
  M3E_OUT=docs/evidence/day10/core-gate M3E_LABEL=day10-core-gate \
  node tools/pixel/run.mjs
```

Gallery on the emulator:

```bash
cd apps/gallery/android
./gradlew :app:assembleRelease
adb install -r app/build/outputs/apk/release/app-release.apk
adb shell am force-stop com.nasyxrakeeb.m3egallery
adb shell "am start -W -a android.intent.action.VIEW \
  -d 'm3egallery://scene?screen=foundation' com.nasyxrakeeb.m3egallery"
```

Overlay variants: append `&overlay=dialog`, `&overlay=stack`, `&overlay=sheet`
or `&overlay=portal`.

Xiaomi (MIUI blocks `pm install`; install from the phone):

```bash
adb -s 10.231.239.101:5555 push \
  apps/gallery/android/app/build/outputs/apk/release/app-release.apk \
  /sdcard/Download/m3egallery.apk
# Open Files > Download on the phone and tap m3egallery.apk.
adb -s 10.231.239.101:5555 shell "am start -W -a android.intent.action.VIEW \
  -d 'm3egallery://scene?screen=foundation' com.nasyxrakeeb.m3egallery"
```

Window-size recompute:

```bash
adb shell wm density 240   # 720×1280 dp → medium / expanded
adb shell wm density reset # 411×731 dp → compact / medium
```

## Limitations

- **Text thresholds are approved; one combination is over the ink cap.**
  `Text` and `M3Provider` are implemented, tested and measured (119/120
  faithful). ADR-010 was approved on 2026-11-28, and the single
  `type-label-medium-emphasized` 320/1.3 miss is recorded in `D-001`. The
  converter is implemented and is the default `fontScaleMode`. Re-run the
  matrix whenever text code or fonts change.
- **iOS** for Icon/overlay/window/RTL is unverified; the boxes stay open for
  Days 41–42 (`U-34`).
- **Accessibility** is unit-level. No TalkBack traversal, hardware-keyboard Tab
  trap or RTL device audit was possible on this AVD (`U-33`, `U-35`).
- **Escape** is covered by the pure key handler and RNTL, not by a physical
  keyboard on Android.
- **Insets** are exercised by unit tests; the AVD has no cutout, so a real
  notch/gesture-inset difference was not captured.
- The `icon` diff category is tracked, **not** gated. Only the five `core`
  scenes are the PLAYBOOK §7 gate; ADR-020 is accepted as reporting only and
  does not add a gate.
- One capture per stack per boot; cross-boot determinism is sampled at three
  boots, not continuous CI (Day 46 hardening).
- `wm size` letterboxes this portrait-locked activity; the second window row
  uses a density override rather than a true multi-window resize.
- MIUI denies `adb shell input` on the Xiaomi, so the on-device check covers
  launch, rendering and overlay stacking only; back/scroll/keyboard/RTL remain
  emulator + RNTL evidence.
