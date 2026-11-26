# Day 7 — path-renderer frame times (emulator-only)

> **Emulator-only / SwiftShader. Not a production performance claim.**
> The only available Android target is `emulator-5554`: API 31, 1080×1920, 420 dpi
> (2.625×), software GPU (SwiftShader), 60 Hz, animations off, font scale 1.0.
> Physical-device confirmation is tracked by `U-29`.

## Method

- Release gallery APK, Hermes, New Architecture, both renderers installed.
- Each spike mode runs for 18 s after a cold start. `useFrameCallback` runs on the UI
  thread and logs `timeSincePreviousFrame` every 120 frames as
  `M3E_SPIKE_UI <mode>/<renderer> frames=… avg=… max=…`.
- The last log line per run is recorded below. `avg` is the cumulative mean, `max` the
  largest single frame delta.
- Launch command (the whole remote command is quoted so `&` survives):

  ```sh
  adb shell "am start -S -a android.intent.action.VIEW \
    -d 'm3egallery://?spike=concurrent&renderer=svg' com.nasyxrakeeb.m3egallery"
  ```

## Results

| Spike mode | Renderer | Frames | Avg (ms) | Max (ms) |
|---|---|---:|---:|---:|
| `cycle` — 35-shape morph cycle | SVG | 840 | 16.69 | 33.33 |
| `cycle` — 35-shape morph cycle | Skia | 960 | 16.72 | 66.67 |
| `concurrent` — 10 morphs | SVG | 960 | 16.67 | 16.67 |
| `concurrent` — 10 morphs | Skia | 960 | 16.67 | 16.67 |
| `clip` — gradient clipped to morphing path | SVG | 960 | 16.67 | 16.67 |
| `clip` — gradient clipped to morphing path | Skia | 960 | 16.68 | 33.33 |

All runs sit at the 60 Hz vsync ceiling (16.67 ms). A second full run of the same modes
on the same emulator varied by **≤0.07 ms** in average; the maxima moved between
16.67 ms and 83.33 ms, which is scheduling/GC noise, not sustained frame cost. **These
numbers cannot separate SVG from Skia and are not used to decide ADR-002.** The renderer
decision rests on binary size, build friction, install friction and RN-child clipping;
see ADR-002.

`clipchildren` is a correctness spike, not a frame benchmark: SVG clips real RN views,
Skia cannot. Screenshots and the result are in `docs/evidence/day7/clipping/`.

## Physical-device follow-up (`U-29`)

On a connected phone (USB debugging enabled), run each mode and record the last
`M3E_SPIKE_UI` line:

```sh
SERIAL=<device-serial>
APK=apps/gallery/android/app/build/outputs/apk/release/app-release.apk

adb -s "$SERIAL" install -r "$APK"
for renderer in svg skia; do
  for mode in cycle concurrent clip; do
    adb -s "$SERIAL" logcat -c
    adb -s "$SERIAL" shell "am start -S -a android.intent.action.VIEW \
      -d 'm3egallery://?spike=$mode&renderer=$renderer' com.nasyxrakeeb.m3egallery"
    sleep 20
    adb -s "$SERIAL" logcat -d -s ReactNativeJS:V | grep "M3E_SPIKE_UI $mode/$renderer" | tail -1
  done
done
```

For a frame-timeline cross-check:

```sh
adb -s "$SERIAL" shell dumpsys gfxinfo com.nasyxrakeeb.m3egallery framestats
```

Record the device model, SoC, refresh rate and Android version with the numbers. The
emulator results above must not be mixed into the physical-device table.
