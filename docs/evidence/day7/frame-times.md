# Day 7 — path-renderer frame times (emulator-only)

> **Emulator-only / SwiftShader. Not a production performance claim.**
> The Android target is `emulator-5554`: API 31, 1080×1920, 420 dpi (2.625×),
> software GPU (SwiftShader), 60 Hz, window/transition/animator scales 0, font
> scale 1.0. Physical-device confirmation is tracked by `U-29`.

## Method

- Final U-29 spike APK:
  `apps/gallery/android/app/build/outputs/apk/release/app-release.apk`,
  **203,440,223 bytes**, SHA-256
  `612c6921c6444fbd8fae58b1acd8b548b64896a05ebd6a6e593d7b34653d9a28`.
  Release build, Hermes, New Architecture, both renderers installed.
- Each spike mode runs for 20 s after a cold start. `useFrameCallback` runs on the
  UI thread and logs every 60 frames (1 Hz) as
  `M3E_SPIKE_UI <mode>/<renderer> frames=… avg=… max=…`.
- The same numbers are shown on the on-screen card. The card is a separate
  component; its 1 Hz state update does not re-render the spike tree.
  `docs/evidence/day7/frame-times-card.png` is the final readout.
- The last log line per run is recorded below. `avg` is the cumulative mean,
  `max` the largest single frame delta. The final pass ran with the host 1-min
  load average between 3.3 and 5.0; the build and all gates had finished.
- Launch command (the whole remote command is quoted so `&` survives):

  ```sh
  adb shell "am start -S -a android.intent.action.VIEW \
    -d 'm3egallery://?spike=concurrent&renderer=svg' com.nasyxrakeeb.m3egallery"
  ```

## Results

| Spike mode | Renderer | Frames | Avg (ms) | Max (ms) |
|---|---|---:|---:|---:|
| `cycle` — 35-shape morph cycle | SVG | 1020 | 16.76 | 33.33 |
| `cycle` — 35-shape morph cycle | Skia | 1080 | 16.68 | 33.33 |
| `concurrent` — 10 morphs | SVG | 1080 | 16.73 | 83.33 |
| `concurrent` — 10 morphs | Skia | 1020 | 16.85 | 66.67 |
| `clip` — gradient clipped to morphing path | SVG | 1080 | 16.67 | 16.67 |
| `clip` — gradient clipped to morphing path | Skia | 1080 | 16.70 | 33.33 |

All runs sit at the 60 Hz vsync ceiling (16.67 ms). Across the six final-build
runs the averages stayed within **0.18 ms** of each other; maxima move between
16.67 ms and 83.33 ms and are scheduling/GC noise, not sustained frame cost.
**These numbers cannot separate SVG from Skia and are not used to decide
ADR-002.** The renderer decision rests on binary size, build friction, install
friction and RN-child clipping; see ADR-002.

An earlier pass on 2026-11-27 ran while the host load average was 10–15 and
measured 28–73 ms; it is excluded. SwiftShader executes on the host CPU, so host
load changes the numbers. Do not compare runs across host-load conditions.

`clipchildren` is a correctness spike, not a frame benchmark: SVG clips real RN
views, Skia cannot. Screenshots and the result are in
`docs/evidence/day7/clipping/`.

## Physical-device follow-up (`U-29`)

On a connected phone (USB debugging enabled), install the final APK and read the
on-screen card after ≥18 s per mode:

```sh
SERIAL=<device-serial>
APK=apps/gallery/android/app/build/outputs/apk/release/app-release.apk

adb -s "$SERIAL" install -r "$APK"
for renderer in svg skia; do
  for mode in cycle concurrent clip; do
    adb -s "$SERIAL" shell "am start -S -a android.intent.action.VIEW \
      -d 'm3egallery://?spike=$mode&renderer=$renderer' com.nasyxrakeeb.m3egallery"
    sleep 20
    # Read the card on the phone, or:
    adb -s "$SERIAL" logcat -d -s ReactNativeJS:V \
      | grep "M3E_SPIKE_UI $mode/$renderer" | tail -1
  done
done
```

The card shows FPS, average/max frame time, frame count, window size in dp,
physical pixels, density and Android API. Record the **device model, SoC and
refresh rate** with the numbers. If the phone blocks the install, approve the
“Install via USB” prompt (Xiaomi/Redmi devices also need “Install via USB” in
Developer options). The card is the source of truth if release `console.log`
output is stripped by a future build.

For a frame-timeline cross-check:

```sh
adb -s "$SERIAL" shell dumpsys gfxinfo com.nasyxrakeeb.m3egallery framestats
```

The emulator results above must not be mixed into the physical-device table.
