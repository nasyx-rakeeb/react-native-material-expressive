# Day 10 — Icon, Overlay/Portal, window size classes, RTL (foundation gate)

Day 10 adds the four foundations the PLAYBOOK scheduled for the gate: the
Material Symbols `Icon`, the shared `OverlayProvider`/`OverlayHost` stack with a
declarative portal, pure window-size-class helpers, and RTL layout utilities.
All four are implemented, unit/RNTL tested and exercised in the gallery on
`emulator-5554`; the icon scene is pixel-diffed against Compose Material3 1.5.0.
`Text` and `M3Provider` were **not** in the approved Day 10 scope and remain
NOT DONE (see the gate report and `U-36`).

- **Status:** work complete; Day 10 gate report posted, awaiting approval.
- **Decisions:** ADR-021 (icon font subset + path icons), ADR-022 (single overlay
  stack), ADR-023 (pure window-size classes), ADR-024 (RTL helper boundary).
- **Gate:** the existing PLAYBOOK §7 gate is unchanged (`pixelmatch` threshold
  0.1, `includeAA: false`, 0.05% AA-aware, core five scenes). ADR-020 is
  **proposed only**. The icon scene is an additional tracked category with no
  new pass/fail threshold.

## What shipped

| Area | Files |
|---|---|
| Material Symbols font | `assets/fonts/MaterialSymbolsOutlined.ttf` (90 glyphs, 116,368 B), `assets/icons/LICENSE`, `assets/icons/NOTICE` |
| Icon | `src/icon/MaterialSymbol.tsx`, `variationSettings.ts`, `paths.ts`, `Icon.tsx`, generated `materialSymbols.ts` |
| Overlay / Portal | `src/overlay/OverlayProvider.tsx`, `OverlayHost.tsx`, `FocusTrap.tsx`, `platform.ts`, `types.ts` |
| Window size classes | `src/layout/windowSizeClass.ts`, `useWindowSizeClass.ts` |
| RTL | `src/layout/rtl.ts`, `useLayoutDirection.ts`, `index.ts` |
| Gallery | `apps/gallery/src/foundation/FoundationGallery.tsx`, `screen=foundation` route |
| Scene | `tools/scenes/icon-symbols.json`, `icon` category in `tools/scenes/build.mjs` |
| Compose reference | `apps/reference-compose/.../MainActivity.kt` icon layer + font asset |
| Tests | 7 suites / **48 tests** under `src/icon/__tests__`, `src/layout/__tests__`, `src/overlay/__tests__` |

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

## Gallery

`FoundationGallery.tsx` is reachable at `screen=foundation`. It renders:

- the four variable axes (FILL 0/1; wght 100/400/700; GRAD -50/0/200; opsz
  20/24/48) plus five default-instance glyphs;
- the 12 path icons with names;
- the live window size readout;
- the RTL preview toggle;
- the overlay stack with dialog, sheet, declarative portal and stacked demos;
- logcat markers `overlay_open`, `overlay_stack`, `overlay_dismiss` for
  automated checks.

`gallery/foundation-top.png` shows the icon and path-icon sections;
`gallery/foundation-launch.log` shows the launch markers.

## Tests and gates (final run, 2026-11-28)

- `format:check` **PASS**
- `lint` **PASS** (3/3 packages + tools + motion-kind)
- `typecheck` **PASS** (4/4)
- `test` **PASS** — 27 suites / **201 tests**; Day 10 adds 7 suites / 48 tests
- `scenes:check` **PASS** — 43 scenes (core 5 / text 32 / interaction 5 / icon 1)
- Icon diff **PASS** — exact 0, AA-aware 0, max Δ 0, deterministic across 3 boots
- Core five-scene gate **unchanged** and still passing from Day 9

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

Window-size recompute:

```bash
adb shell wm density 240   # 720×1280 dp → medium / expanded
adb shell wm density reset # 411×731 dp → compact / medium
```

## Limitations

- **Text is not shipped.** `Text` and `M3Provider` were outside the approved
  Day 10 scope; both foundation rows remain NOT DONE. `Text` blocks Day 11
  labels (`U-36`). ADR-010 §4's non-linear `FontScaleConverter` is still
  unimplemented.
- **iOS** for Icon/overlay/window/RTL is unverified; the boxes stay open for
  Days 41–42 (`U-34`).
- **Accessibility** is unit-level. No TalkBack traversal, hardware-keyboard Tab
  trap or RTL device audit was possible on this AVD (`U-33`, `U-35`).
- **Escape** is covered by the pure key handler and RNTL, not by a physical
  keyboard on Android.
- **Insets** are exercised by unit tests; the AVD has no cutout, so a real
  notch/gesture-inset difference was not captured.
- The `icon` diff category is tracked, **not** gated. Only the five `core`
  scenes are the PLAYBOOK §7 gate; ADR-020 remains proposed.
- One capture per stack per boot; cross-boot determinism is sampled at three
  boots, not continuous CI (Day 46 hardening).
- `wm size` letterboxes this portrait-locked activity; the second window row
  uses a density override rather than a true multi-window resize.
