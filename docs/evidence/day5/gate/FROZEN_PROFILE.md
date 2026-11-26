# Day 3 frozen capture profile

Every pixel result in `docs/evidence/day3/` was captured on this profile. The
pipeline aborts if any check drifts; `results.json` stores the observed value
for every check on every boot.

## Device and system image

| Input | Value |
|---|---|
| AVD | `M3E_API31` (Pixel 2 device profile) |
| AVD config | `~/.android/avd/M3E_API31.avd/config.ini` |
| System image | `system-images;android-31;google_apis;x86_64` |
| Android | API 31 |
| Model | Pixel 2 (`hw.device.name=pixel_2`) |
| Display | 1080×1920 px, 420 dpi, 2.625× density scale |
| Display cutout | none |
| RAM / cores | 2 GB / 4 vCPU |
| Google Play | not installed (`PlayStore.enabled=no`) |
| Emulator | 37.2.13.0 (build 16740729) |
| Host | Intel x86_64 macOS 26.7 |

The Pixel 2 AVD is used instead of a Pixel 5 because the Pixel 5 cutout shifted
the app window to `y = 145 px` and triggered `ImmersiveModeConfirmation` during
the first probe. The scene window must start at `0,0` for a fixed crop; the
Pixel 2 profile gives that without a cutout mask in `screencap`.

## GPU

| Input | Value |
|---|---|
| Emulator flag | `-gpu swiftshader_indirect` |
| Renderer | ANGLE / Vulkan 1.3.0 / SwiftShader Device (Subzero) |
| SurfaceFlinger `GLES:` line | recorded in `results.json` and `report.html` |

Software rendering is deliberate: it removes host-GPU driver variance from the
determinism measurement. It is not a performance benchmark.

## Boot and window policy

The emulator is stopped and restarted for every recorded run:

```bash
adb emu kill
emulator -avd M3E_API31 \
  -no-window -gpu swiftshader_indirect -no-snapshot \
  -no-boot-anim -no-audio -port 5554
```

`-no-snapshot` forces a cold boot. The same userdata partition is reused, then
`tools/pixel/freeze-profile.sh` writes the settings below. Apps are reinstalled
from the built APKs after each boot.

Both harnesses run edge-to-edge and hide the status bar. The scene starts at
screen `(0,0)`; the navigation bar remains at the bottom, outside the 840×525 px
scene crop. The capture step verifies the scene corners, so a shifted window or
implemented immersive-mode confirmation is a hard failure, not a silent crop.

## Settings frozen by `freeze-profile.sh`

| Setting | Value | Command |
|---|---|---|
| Font scale | `1.0` | `settings put system font_scale 1.0` |
| Window animation scale | `0` | `settings put global window_animation_scale 0` |
| Transition animation scale | `0` | `settings put global transition_animation_scale 0` |
| Animator duration scale | `0` | `settings put global animator_duration_scale 0` |
| Accelerometer rotation | off | `settings put system accelerometer_rotation 0` |
| User rotation | `0` | `settings put system user_rotation 0` |
| Night mode | no | `cmd uimode night no` |
| Immersive confirmation | confirmed | `settings put secure immersive_mode_confirmations confirmed` |
| Heads-up notifications | off | `settings put global heads_up_notifications_enabled 0` |
| Screen timeout | max | `settings put system screen_off_timeout 2147483647` |
| Stay awake while plugged in | on | `settings put global stay_on_while_plugged_in 3` |
| Lock screen | disabled | `locksettings set-disabled true` |
| Wi-Fi / mobile data | off | `svc wifi disable`, `svc data disable` |

Locale is `en-US`. These values are re-read by `verifyProfile()` before every
scene on every boot; expected values live in `tools/pixel/profile.json`.

## Fonts

Both harnesses bundle the same Roboto Flex variable font:

| Item | Value |
|---|---|
| Source path | `apps/reference-compose/app/src/main/assets/fonts/RobotoFlex.ttf` |
| Size | 1,787,292 bytes |
| SHA-256 | `9b523f7d82593df0107173849ebb8c817471a1df4b4fb2c3cbf40cfd810c8281` |

The pipeline hashes the source file and `assets/fonts/RobotoFlex.ttf` inside both
APKs and fails if they differ. Runtime probes must report a successful `wdth`
axis change in both apps; an orange readiness band or a missing/false probe is a
hard failure.

## Scenes

Scene manifests are the source of truth for both harnesses. `tools/scenes/build.mjs`
validates them and generates `tools/scenes/index.json` plus
`apps/gallery/src/scenes.generated.ts`. Every scene is 320×200 dp (840×525 px at
2.625×).

| Scene | SHA-256 of manifest |
|---|---|
| `solid` | `39cbf6072b416854ad59a15e13f1742469c72593460d567856a76244ce4bac69` |
| `rect` | `0fa4d1c3706ae5f5a8087da2c0b38c2a8d657a752a3a8c6aeea03bc3d7a04991` |
| `text` | `d3e5006d16050bfb0755ed94591c1eb5957b204cd80e6adf91b5782ecf6d1de4` |
| `shadow` | `98c9bccf700e3ea6f2a646639f2253e8d4fbb00dc7872baa41b53c35bb0b435e` |
| `trivial` | `3b4cbec14782b2c3fd5c520bf69b3a20b80e2ebacad5be6ae6c035094f936fc7` |

## What is intentionally not frozen

- Wall-clock time, host load, and emulator startup duration. They affect runtime,
  not the rendered pixels, and the determinism tables show whether they did.
- App process state between repeats. Repeats use an explicit rerender; cold
  boots are measured separately.
- Anything outside the 840×525 px scene crop, including the navigation bar.
