# Day 10 — Xiaomi 120 Hz capture (U-29 follow-up 1)

**Device:** Xiaomi 2201116SI (Redmi Note 11), SoC SM6375, Android 13 / API 33,
arm64-v8a, 1080×2400, 440 dpi (2.750×).

**Display mode (verified, not inferred):**

```sh
adb -s 10.231.239.101:5555 shell dumpsys display | grep -m1 -oE 'mActiveModeId=[0-9]+'
# mActiveModeId=1
adb -s 10.231.239.101:5555 shell dumpsys display | grep -oE 'id=1,[^}]*fps=[0-9.]+' | head -1
# id=1, width=1080, height=2400, fps=120.00001
```

The panel offers mode 1 at **120.00001 Hz** and mode 2 at **60.000004 Hz**. Mode 1
was active; no refresh-rate toggle was needed.

**Artifact:** the installed Day 10 universal release APK,
**203,624,632 bytes**, SHA-256
`8be59299c1a2cb2e4fa0a8dc241242811f4f0a564f998e76f80936cdc32d59bc`.
It was pulled from `/data/app/.../base.apk` after the run.

**Command (no reinstall; the Day 10 gallery was already installed):**

```sh
SERIAL=10.231.239.101:5555 SKIP_INSTALL=1 bash tools/device/u29-capture.sh
```

`SKIP_INSTALL=1` avoids MIUI's `INSTALL_FAILED_USER_RESTRICTED` prompt. The
script cold-starts each spike mode and records the last `M3E_SPIKE_UI` line.

## Results (20 s per mode, 120 Hz budget 8.33 ms)

| Mode | Renderer | Frames | Avg (ms) | Max (ms) | FPS |
|---|---|---:|---:|---:|---:|
| `cycle` | SVG | 2160 | 8.47 | 16.78 | 108 |
| `concurrent` | SVG | 1080 | 16.79 | 41.90 | 54 |
| `clip` | SVG | 2160 | 8.71 | 25.08 | 108 |
| `cycle` | Skia | 2220 | 8.35 | 8.67 | 111 |
| `concurrent` | Skia | 2220 | 8.36 | 25.05 | 111 |
| `clip` | Skia | 2220 | 8.35 | 8.57 | 111 |

Raw log: [`u29-120hz.log`](./u29-120hz.log). The full analysis and the 60 Hz
comparison are in `docs/evidence/day7/frame-times.md` §“Physical device — 120 Hz
re-run”.

## What this closes / leaves open

- **Closes U-29 follow-up 1:** the six captures ran on the physical device with
  the active mode verified at 120 Hz.
- **Does not close U-29 follow-up 2 (SVG time profile) or 3 (Skia size).** Both
  are Day 20 blockers. The concurrent SVG result (54 fps at both 60 and 120 Hz)
  is the concrete case those follow-ups must explain or fix.
- **MIUI input limitation:** `adb shell input` is denied (`INJECT_EVENTS`), so
  this device cannot exercise back/scroll/keyboard/RTL interactions. Those
  remain emulator-only (`U-33`–`U-35`).
