# U-29 — physical-device frame-time run (Xiaomi 2201116SI)

**Status: completed 2026-11-27.** The run was executed on the attached phone.
Device: Xiaomi 2201116SI, SoC **SM6375** (`holi`), Android 13 / API 33,
1080×2400, 440 dpi (2.750×), **60 Hz active mode** (`mActiveModeId=2`; the panel
also supports 120 Hz). Results are in
[`docs/evidence/day7/frame-times.md`](frame-times.md#physical-device-u-29); the
card capture is [`frame-times-device.png`](frame-times-device.png).

| Mode | Renderer | Frames | Avg (ms) | Max (ms) |
|---|---|---:|---:|---:|
| `cycle` | SVG | 1080 | 17.22 | 33.54 |
| `cycle` | Skia | 1140 | 16.72 | 33.55 |
| `concurrent` | SVG | 1020 | 18.20 | 50.05 |
| `concurrent` | Skia | 1140 | 16.71 | 16.96 |
| `clip` | SVG | 1080 | 17.42 | 33.53 |
| `clip` | Skia | 1140 | 16.71 | 17.07 |

Skia holds the 60 Hz ceiling; SVG is 0.5–1.5 ms above it and drops frames in the
10-concurrent-morph case. ADR-002 is unchanged (size/build/clipping), but the
frame-time claim is scoped accordingly. The steps below remain for
reproduction; `tools/device/u29-capture.sh` now reports the active display
mode.

## Artifact

| | Universal (emulator) | **arm64 (phone)** |
|---|---|---|
| Path | `app-release-universal.apk` | `app-release.apk` |
| Size | 203,440,223 B | **58,369,090 B** |
| SHA-256 | `612c6921…3d9a28` | **`7436712f45663084bd77558b10ff775052eecbd5107f6a51fe83ddcc26a82e2f`** |
| ABIs | all four | `arm64-v8a` only |

The arm64 build is produced with:

```sh
cd apps/gallery/android
./gradlew :app:assembleRelease -PreactNativeArchitectures=arm64-v8a
```

The universal APK is kept next to it for the x86_64 emulator; do not install it
on the phone.

## Phone

- Xiaomi 2201116SI (Redmi Note 11), `holi`, Android 13 / API 33, 1080×2400,
  120 Hz panel (the active mode may be 60 Hz).
- Rooted. MIUI rejects a plain `adb install` with
  `INSTALL_FAILED_USER_RESTRICTED`; installing from a root shell bypasses that
  restriction.

## Steps

1. Connect USB, enable **Developer options → USB debugging**, and confirm:

   ```sh
   adb devices -l
   # <serial>  device  product:... model:2201116SI ...
   ```

2. Install through root. Approve the `su` prompt on the phone if it appears:

   ```sh
   SERIAL=<serial>
   APK=apps/gallery/android/app/build/outputs/apk/release/app-release.apk

   adb -s "$SERIAL" push "$APK" /data/local/tmp/m3e-u29.apk
   adb -s "$SERIAL" shell "su -c 'pm install -r /data/local/tmp/m3e-u29.apk'"
   ```

   If `su` is not found, enable root in Magisk/KernelSU first. If the signature
   differs from an older install:

   ```sh
   adb -s "$SERIAL" shell "su -c 'pm uninstall com.nasyxrakeeb.m3egallery'"
   ```

3. Run the six captures. The script installs, launches each mode for 20 s, and
   prints the last `M3E_SPIKE_UI` line:

   ```sh
   SERIAL=<serial> tools/device/u29-capture.sh
   ```

   Manual equivalent:

   ```sh
   for renderer in svg skia; do
     for mode in cycle concurrent clip; do
       adb -s "$SERIAL" logcat -c
       adb -s "$SERIAL" shell "am start -S -a android.intent.action.VIEW \
         -d 'm3egallery://?spike=$mode&renderer=$renderer' com.nasyxrakeeb.m3egallery"
       sleep 20
       adb -s "$SERIAL" logcat -d -s ReactNativeJS:V \
         | grep "M3E_SPIKE_UI $mode/$renderer" | tail -1
     done
   done
   ```

4. Read the card as the source of truth. It shows FPS, average/max frame time,
   frame count, window size in dp, physical pixels, density and Android API.
   Let each mode run **≥18 s** before reading.

5. Record the device facts:

   ```sh
   adb -s "$SERIAL" shell getprop ro.product.model   # 2201116SI
   adb -s "$SERIAL" shell getprop ro.soc.model       # fall back to ro.board.platform
   adb -s "$SERIAL" shell dumpsys display | grep -m1 -oE 'fps=[0-9.]+'
   ```

   Also note whether the panel was in 60 Hz or 120 Hz mode during the run.

## What to send back

Fill this table (the script prints the same rows) and add the model, SoC and
active refresh rate:

| Mode | Renderer | Frames | Avg (ms) | Max (ms) | FPS |
|---|---|---:|---:|---:|---:|
| `cycle` | SVG | | | | |
| `cycle` | Skia | | | | |
| `concurrent` | SVG | | | | |
| `concurrent` | Skia | | | | |
| `clip` | SVG | | | | |
| `clip` | Skia | | | | |

- Model: `2201116SI`
- SoC: `holi` (confirm with `ro.soc.model`)
- Active refresh: ___ Hz
- Card screenshot (optional but useful): `adb -s "$SERIAL" exec-out screencap -p > u29-card.png`

## Troubleshooting

- **`INSTALL_FAILED_USER_RESTRICTED`** — you used plain `adb install`. Use the
  root `pm install` command above.
- **`su: not found`** — root is not exposed to adb; enable it in Magisk/KernelSU
  (Superuser → adb shell).
- **App opens but the deep link is ignored** — launch once with
  `adb -s "$SERIAL" shell monkey -p com.nasyxrakeeb.m3egallery 1`, then re-run
  the `am start` command.
- **No `M3E_SPIKE_UI` lines** — read the card; release builds may strip
  `console.log` in a future RN upgrade. The card is authoritative.
- **Phone locks mid-run** — set the screen timeout to 10 minutes and keep the
  app in the foreground; the card only updates while the app is visible.

Do not mark `U-29` resolved until these real numbers are appended to
`docs/evidence/day7/frame-times.md` with the device model, SoC and refresh rate.
