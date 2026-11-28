# Day 10 — Xiaomi install check

- **Device:** 2201116SI, Android 13 / API 33, 1080×2400, 440 dpi, MIUI.
- **APK:** release `apps/gallery/android/app/build/outputs/apk/release/app-release.apk`
  (203,624,632 B), installed 2026-11-28 12:57:21.
- **Install method:** `adb push` to `/data/local/tmp` then `pm install` was
  blocked by MIUI with `INSTALL_FAILED_USER_RESTRICTED: Install canceled by
  user`. The APK was copied to `/sdcard/Download/m3egallery.apk` and installed
  from the phone's file manager. No build change was needed.

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
