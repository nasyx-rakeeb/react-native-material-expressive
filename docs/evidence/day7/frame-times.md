# Day 7 — path-renderer frame times

Two datasets:

- **Emulator / SwiftShader** — `emulator-5554`, API 31, 1080×1920, 420 dpi
  (2.625×), software GPU, 60 Hz. Useful for the same-device A/B, **not** a
  production performance claim.
- **Physical device / `U-29`** — Xiaomi 2201116SI, SM6375, 1080×2400, 440 dpi
  (2.750×), 60 Hz active mode, release arm64 APK. This is the production-relevant
  dataset. Results in [Physical device](#physical-device-u-29).

## Method

- Emulator artifact: `app-release-universal.apk`, **203,440,223 bytes**,
  SHA-256 `612c6921c6444fbd8fae58b1acd8b548b64896a05ebd6a6e593d7b34653d9a28`.
  Release build, Hermes, New Architecture, both renderers installed.
- Phone artifact: `app-release.apk`, **58,369,090 bytes**, SHA-256
  `7436712f45663084bd77558b10ff775052eecbd5107f6a51fe83ddcc26a82e2f`,
  `arm64-v8a` only, built with `-PreactNativeArchitectures=arm64-v8a`. The
  hand-off is `docs/evidence/day7/u29-device-steps.md`.
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

## Physical device (`U-29`)

**Device:** Xiaomi 2201116SI (Redmi Note 11), SoC **SM6375** (`holi`),
Android **13 / API 33**, arm64-v8a, 1080×2400, **440 dpi (2.750×)**, active
display mode **60.000004 Hz** (`mActiveModeId=2`; the panel also supports
120 Hz). Rooted (Magisk); installed with the arm64 release APK through
`su -c 'pm install -r …'`. Run over Wi-Fi adb; the transport does not affect
frame times. Window on the card: 393×873 dp.

**Artifact:** `app-release.apk`, 58,369,090 bytes, SHA-256
`7436712f45663084bd77558b10ff775052eecbd5107f6a51fe83ddcc26a82e2f`.

Each mode ran 20 s after a cold start; the last `M3E_SPIKE_UI` line is recorded.
The 60 Hz frame budget is 16.67 ms.

| Spike mode | Renderer | Frames | Avg (ms) | Max (ms) | Avg over budget |
|---|---|---:|---:|---:|---:|
| `cycle` — 35-shape morph cycle | SVG | 1080 | **17.22** | 33.54 | +3.3% |
| `cycle` — 35-shape morph cycle | Skia | 1140 | **16.72** | 33.55 | +0.3% |
| `concurrent` — 10 morphs | SVG | 1020 | **18.20** | 50.05 | +9.2% |
| `concurrent` — 10 morphs | Skia | 1140 | **16.71** | 16.96 | +0.2% |
| `clip` — gradient clipped to morphing path | SVG | 1080 | **17.42** | 33.53 | +4.5% |
| `clip` — gradient clipped to morphing path | Skia | 1140 | **16.71** | 17.07 | +0.2% |

**Reading**

- Skia holds the 60 Hz ceiling in all three modes (16.71 ms average; maxima
  16.96/17.07 ms for concurrent/clip).
- SVG is 0.5–1.5 ms above the ceiling on average and drops frames. The worst
  case is 10 concurrent morphs: 18.20 ms average, 50.05 ms maximum, 1020 frames
  in 20 s (~51 fps). `cycle` and `clip` show occasional 33.5 ms frames.
- This is a real mid-range device result, not SwiftShader noise. It **does not
  change ADR-002**: SVG still wins on binary size (0.77 MB vs 29.78 MB per
  arm64 ABI), build/install friction and RN-child clipping. It does mean the
  1.0 frame-time claim must be scoped: **SVG holds 60 fps for a single morph
  and the clipped-gradient scene, but not for ten concurrent morphs on this
  device.** Skia is the smoother option if a screen needs many simultaneous
  path animations.
- The panel was in 60 Hz mode for this 2026-11-27 pass. The 120 Hz re-run is
  below; do not mix the two tables.
- Card capture: `docs/evidence/day7/frame-times-device.png` (clip/Skia,
  59.9 FPS, avg 16.71 ms, max 17.07 ms).

## Physical device — 120 Hz re-run (2026-11-28, Day 10 U-29)

**Device:** same Xiaomi 2201116SI, SM6375, Android 13 / API 33, arm64-v8a,
1080×2400, 440 dpi (2.750×). `dumpsys display` reports
**`mActiveModeId=1`, `fps=120.00001`**; mode 2 is 60.000004 Hz. The panel was
already in its 120 Hz mode, so no settings change was needed.

**Artifact:** the installed Day 10 universal release APK,
**203,624,632 bytes**, SHA-256
`8be59299c1a2cb2e4fa0a8dc241242811f4f0a564f998e76f80936cdc32d59bc`
(pulled from `/data/app/.../base.apk`). This is **not** the Day 7 arm64-only
artifact; the renderer code and spike screen are the same, but do not compare
sizes across the two runs.

Each mode ran 20 s after a cold start; the last `M3E_SPIKE_UI` line is recorded.
The 120 Hz frame budget is 8.33 ms.

| Spike mode | Renderer | Frames | Avg (ms) | Max (ms) | FPS | Avg over 8.33 ms |
|---|---|---:|---:|---:|---:|---:|
| `cycle` — 35-shape morph cycle | SVG | 2160 | **8.47** | 16.78 | 108 | +1.7% |
| `concurrent` — 10 morphs | SVG | 1080 | **16.79** | 41.90 | 54 | +101.6% |
| `clip` — gradient clipped to morphing path | SVG | 2160 | **8.71** | 25.08 | 108 | +4.6% |
| `cycle` — 35-shape morph cycle | Skia | 2220 | **8.35** | 8.67 | 111 | +0.2% |
| `concurrent` — 10 morphs | Skia | 2220 | **8.36** | 25.05 | 111 | +0.4% |
| `clip` — gradient clipped to morphing path | Skia | 2220 | **8.35** | 8.57 | 111 | +0.2% |

**Reading**

- At 120 Hz the two renderers separate cleanly. Skia holds ~111 fps in all three
  modes (2220 frames / 20 s) with averages within 0.03 ms of the 8.33 ms budget.
- SVG holds ~108 fps for a single morph and the clipped gradient, but **10
  concurrent morphs stay at ~54 fps** (1080 frames / 20 s, 16.79 ms average,
  41.90 ms max). This is the same ~51–54 fps ceiling measured at 60 Hz, so the
  concurrent case is CPU/path-work bound, not vsync bound.
- This **does not change ADR-002** on its own: SVG still wins on binary size,
  build/install friction and RN-child clipping. It does mean the 120 fps claim
  must be scoped: **SVG is enough for one morph and the clipped gradient at
  120 Hz, not for ten concurrent morphs.** The Day 20 SVG profiling follow-up
  (path-string cost, caching, translate-based wave) must show whether the
  concurrent case can be recovered; otherwise a screen with many simultaneous
  path animations needs Skia (optional peer) or fewer concurrent paths.
- The active mode was verified with `dumpsys display`, not inferred from the
  panel spec. Raw output: `docs/evidence/day10/device/u29-120hz.log`.

## Reproduce on the phone

The phone is the rooted Xiaomi 2201116SI; MIUI rejects plain `adb install`, so
install the arm64 APK from a root shell. Full steps, device commands and the
fill-in table: `docs/evidence/day7/u29-device-steps.md`. Short version:

```sh
SERIAL=<device-serial>
APK=apps/gallery/android/app/build/outputs/apk/release/app-release.apk

adb -s "$SERIAL" push "$APK" /data/local/tmp/m3e-u29.apk
adb -s "$SERIAL" shell "su -c 'pm install -r /data/local/tmp/m3e-u29.apk'"
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

`SERIAL=<serial> tools/device/u29-capture.sh` does the install and all six runs
in one pass.

The card shows FPS, average/max frame time, frame count, window size in dp,
physical pixels, density and Android API. If the phone blocks the install,
approve the “Install via USB” prompt (Xiaomi/Redmi devices also need “Install
via USB” in Developer options). The card is the source of truth if release
`console.log` output is stripped by a future build.

For a frame-timeline cross-check:

```sh
adb -s "$SERIAL" shell dumpsys gfxinfo com.nasyxrakeeb.m3egallery framestats
```

The emulator and physical-device tables are separate datasets; do not mix them.
The physical-device run above is the `U-29` result.
