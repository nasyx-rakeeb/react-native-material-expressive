# Day 7 — `ForeignObject` behaviour probe

This directory records what `react-native-svg`'s `foreignObject` actually does
when `ShapeContainer` clips a live React Native subtree. It is verification
chrome, not a public API. The probe screen is
`apps/gallery/src/shapes/ClipProbeScreen.tsx`; the route is
`m3egallery://?screen=clipprobe`.

## Environment

- `emulator-5554`: Android 12 (API 31), 1080×1920, 420 dpi (2.625×), 60 Hz,
  SwiftShader software GPU.
- Release APK, Hermes, New Architecture, React Native 0.88.1.
- `react-native-svg` 15.16.0. The latest release at probe time is 15.16.1
  (2026-11-05), which adds RN 0.89 / SwiftPM support; 15.16.0 (2026-10-15) is the
  Expo SDK 58 pin used by the gallery.
- Shape: `Clover4Leaf`, 300 dp. Child: a 300 dp RN view containing two
  `Pressable` zones, an animated dot, and a nested `ScrollView` with eight rows.

## Method

The probe was launched with the release APK, then each interaction was driven
with `adb`:

```sh
adb -s emulator-5554 install -r \
  apps/gallery/android/app/build/outputs/apk/release/app-release.apk
adb -s emulator-5554 shell "am start -S -a android.intent.action.VIEW \
  -d 'm3egallery://?screen=clipprobe' com.nasyxrakeeb.m3egallery"
adb -s emulator-5554 shell input tap 537 849   # inside-zone centre
adb -s emulator-5554 shell input tap 180 492   # clipped-away corner of outside zone
adb -s emulator-5554 shell input swipe 500 1120 500 940 300
adb -s emulator-5554 logcat -d -s ReactNativeJS:V | grep clipprobe
```

`uiautomator dump` cannot reach idle while the dot is animating
(`ERROR: could not get idle state`). The probe therefore has a **Pause motion**
button outside the SVG; tapping it stops the dot and makes the accessibility
tree dumpable.

## Results

| Check | Result | Evidence |
|---|---|---|
| Visual clipping to the path | **PASS** | `01-clip-running.png`, `02-clip-running-later.png`, `03-clip-paused.png`: the grey child background and its contents are cut to the clover; the top-left corner of the “outside” zone is hidden. |
| Animated children | **PASS** | The red dot’s centroid moved from **x = 601.7 px** to **x = 631.1 px** (y = 678.0 px) between the two screenshots, 1 s apart. |
| Touch hit-testing inside the clipped shape | **FAIL** | Taps on the inside zone (537, 849) and the clipped-away corner of the outside zone (180, 492) produced no `[M3E] clipprobe_tap` line. The **Pause motion** button outside the SVG did toggle to “Resume motion”, so input dispatch itself works. |
| Accessibility focus / screen reader | **FAIL** | `accessibility-tree.xml`: `clipprobe-child` is `[146,458][146,458]` (0×0); the zones are `[167,479][146,458]` and `[461,773][146,458]` (negative width/height). Nodes are exposed as `clickable=true` and `focusable=true`, but their focus rectangles are unusable. TalkBack is not installed on this emulator image, so a live screen-reader pass was not possible. |
| Scrolling content | **FAIL** | The swipe produced no `[M3E] clipprobe_scroll` line. |
| RN 0.88.1 / New Architecture | **PARTIAL** | Renders and animates on Fabric, but the touch and accessibility failures above are present. This matches open upstream issue #1389 (`ForeignObject onPress() event not firing`, open since 2020-05-26) and the broader #1906 (`ForeignObject working wrong`, open since 2022-11-04). |

## Root cause

`react-native-svg` implements `ForeignObjectView` as a `GroupView`. Its
`drawGroup` manually draws non-virtual children with `child.draw(canvas)`, but
`VirtualView.onLayout` never lays out those non-virtual children. The RN wrapper
therefore keeps a zero Android layout size. `ViewGroup.dispatchTouchEvent`
skips a 0×0 child, and the accessibility bounds collapse to the parent origin.
The visual result is correct because the child is drawn directly onto the SVG
canvas; the native view hierarchy used for input and accessibility is not.

Upstream source inspected in `apps/gallery/node_modules/react-native-svg`:

- `android/src/main/java/com/horcrux/svg/ForeignObjectView.java` — `drawGroup`
  manually draws non-virtual children.
- `android/src/main/java/com/horcrux/svg/VirtualView.java` — `onLayout` sets
  the SVG client rect but does not lay out child views.
- `common/cpp/react/renderer/components/rnsvg/RNSVGShadowNodes.h` — the
  `RNSVGForeignObjectShadowNode` is `YogaLayoutableShadowNode` (PR #2833, merged
  2025-11-26), but that does not make the mounted RN subtree touchable.

## Fallback options

1. **`borderRadius` clipping for simple shapes.** A normal RN view with
   `borderRadius` keeps touch and accessibility working, but only covers rounded
   rectangles/circles; it cannot follow an arbitrary Material shape or a morph.
2. **Mask approach for arbitrary shapes.** Render the child as a normal RN view
   (touch works) and mask it with a native masked-view host or a native
   `Canvas.clipPath` view. This needs a spike to verify Fabric support, touch,
   accessibility, animation and the mask edge quality.
3. **Skia only for `ShapeContainer`.** Rejected: Skia clips only Skia-drawn
   content, not RN children (ADR-002).

**Recommendation:** keep `ShapeContainer` visual-only for 1.0.0 until option 2
is verified. Do not put interactive content inside it. This is tracked as
`U-32` in `docs/UNVERIFIED.md`; it does not reopen the Day 7 renderer decision,
which rests on binary size, build/install friction and visual RN-child clipping.

## Reproduce

```sh
# Build and install the release APK, then:
adb -s emulator-5554 shell "am start -S -a android.intent.action.VIEW \
  -d 'm3egallery://?screen=clipprobe' com.nasyxrakeeb.m3egallery"
adb -s emulator-5554 shell input tap 310 1336   # pause the dot
adb -s emulator-5554 shell uiautomator dump --compressed /sdcard/clipprobe.xml
adb -s emulator-5554 pull /sdcard/clipprobe.xml .
```

The `accessibility-tree.xml` in this directory is the dump used above.
