# Day 10 — Xiaomi install check

- **Device:** 2201116SI, Android 13 / API 33, 1080×2400, 440 dpi, MIUI.
- **APK (extended build):** release
  `apps/gallery/android/app/build/outputs/apk/release/app-release.apk`
  (203,638,852 B, SHA-256
  `fefd29f7b2076465dfb78ac5bdb4ee842daa7b7cbf1c7a8778c31fd63699f2dc`),
  installed 2026-11-28 15:00 with `adb install -r` (MIUI accepted it this time;
  the earlier 203,624,632 B build needed the file-manager workaround).
- **Install method:** the first install was blocked by MIUI with
  `INSTALL_FAILED_USER_RESTRICTED`, so the APK was copied to
  `/sdcard/Download/m3egallery.apk` and installed from the phone. The extended
  build installed directly with `adb install -r`.

## Verified on the device

| Check | Evidence |
|---|---|
| App launches cold, foundation route | `foundation.log` — `overlay_stack empty` |
| API 33 variable-font capability | `foundation.png` — "supported, API 33" |
| All four axes render (FILL, wght, GRAD, opsz) | `foundation.png` |
| 12 internal path icons render | `foundation.png` |
| Overlay stack depth 2 with dialog + sheet | `overlay-stack.png`, `overlay-stack.log` |
| Day 9 scene ships in the same APK | `day9-interaction-states.png`, `day9-interaction-states.log` — `scene_ready scene=interaction-states` |

## Limitation

MIUI denies `adb shell input` (`INJECT_EVENTS` permission), so back ordering,
scrolling, keyboard avoidance and the RTL toggle could not be exercised on this
phone. Those paths are covered by RNTL and the emulator run in
`docs/evidence/day10/gallery/`. The install check only claims launch, rendering
and overlay stacking on the Xiaomi.

At the extended-build install the phone was asleep (`mWakefulness=Asleep`) and
MIUI denied both `input keyevent KEYCODE_WAKEUP` and the `FLAG_TURN_SCREEN_ON`
launch flag, so a new screenshot could not be taken. `dumpsys window` still
showed `mFocusedApp=com.nasyxrakeeb.m3egallery/.MainActivity` with no crash in
logcat. The extended Provider/Text sections are captured on the emulator in
`docs/evidence/day10/gallery/`; the Xiaomi install is verified by the successful
`adb install -r` and the focused activity.
