# Pixel harness (`tools/pixel`)

The Day 3 reference pipeline: it boots the frozen emulator, installs the two
harnesses, captures each scene after a readiness handshake, crops the scene
window, compares pixels, and writes the evidence bundle in `docs/evidence/day3/`.

It is a measurement tool. **It does not propose or change pixel thresholds.**
The only threshold it evaluates is the existing PLAYBOOK §7 AA-aware 0.05 % gate,
and it records that evaluation for the data, not as a new policy.

## Requirements

- `adb` on `PATH` and the `M3E_API31` AVD (Pixel 2, 1080×1920, 420 dpi, API 31,
  no display cutout). The AVD profile is described in `profile.json`.
- Android SDK 37 + JDK 17 to rebuild the harnesses.
- `pngjs` and `pixelmatch` are root dev dependencies. There is no separate
  package for this tool.

## Commands

```bash
# Rebuild both harnesses, verify APK font hashes, install them.
bash tools/pixel/build-harnesses.sh

# Freeze the userdata settings on the currently running emulator.
bash tools/pixel/freeze-profile.sh

# Stop the emulator, cold boot it with -no-snapshot, then freeze it.
bash tools/pixel/cold-boot.sh

# Full Day 3 run (3 cold boots × 20 trivial repeats per app).
node tools/pixel/run.mjs

# Re-render the HTML/Markdown report from an existing results.json.
node tools/pixel/render.mjs

# Faster smoke run against the current emulator (no cold boot).
M3E_SKIP_BOOT=1 M3E_BOOTS=1 M3E_REPEATS=3 M3E_SCENE_REPEATS=1 \
  M3E_OUT=/tmp/m3e-dry node tools/pixel/run.mjs
```

The full run writes:

```text
docs/evidence/day3/
  README.md        generated Markdown summary
  report.html      side-by-side captures and diff images
  results.json     every capture hash, marker, metric, and profile check
  captures/        content-addressed PNGs (one file per distinct image)
  diffs/           pixelmatch diff images, one per scene per boot
```

Captures are content-addressed by SHA-256. Because the run is expected to be
deterministic, 20 identical repeats become one PNG on disk and 20 references in
`results.json`.

## Readiness protocol

Both harnesses draw a 320×24 dp readiness band at `y = 220 dp`:

| Colour           | Meaning                             |
| ---------------- | ----------------------------------- |
| red `#FF0000`    | scene or font state not ready       |
| orange `#FF8800` | font fallback (hard failure)        |
| green `#00FF00`  | scene rendered with the pinned font |

The capture loop polls a screenshot every 100 ms and only accepts a green band.
It also checks the four scene corners against the scene background, which fails
if the window is shifted (for example by a cutout or an immersive-mode
confirmation) or the scene is clipped. It then crops exactly the scene rectangle
(320×200 dp = 840×525 px on this profile).

Repeats do not relaunch the app. They use the harness rerender path (Compose
broadcast, RN tap) and wait for a new render counter in logcat **and** a green
band. This separates in-session determinism from launch and cold-boot effects.

## Font proof

Both apps ship the same `RobotoFlex.ttf`. The pipeline:

1. hashes the source file and both APK copies (`assets/fonts/RobotoFlex.ttf`)
   and fails unless all three SHA-256 values equal `profile.json.fontSha256`;
2. requires the Compose runtime hash marker and the RN probe marker in logcat;
3. fails on an orange band, a missing marker, or a probe that reports `ok=false`.

The RN probe compares text widths at `wdth 25` and `wdth 100`; equal widths mean
the variable axis fell back to a system font.

## Comparison outputs

For every scene and boot the report records:

- exact differing pixels and percentage (strict equality over RGB);
- pixelmatch AA-aware differing pixels (`threshold 0.1`, `includeAA: false`);
- maximum channel delta, mean absolute delta, bounding box;
- per-region counts for text and shadow regions;
- within-harness determinism (each repeat vs the first render);
- cross-boot determinism (boot N run 0 vs boot 1 run 0);
- shadow presence (non-background pixels outside the elevated rectangle).

Cross-stack exact equality is reported honestly. Text rasterization can differ
between Skia (Compose) and RN's text stack even when layout size and the font
file are identical; the AA-aware count is reported separately rather than
silently used to declare exact equality.

## Frozen inputs

`profile.json` is the machine-readable profile. It is verified at the start of
every boot (API, locale, font scale, animation scales, rotation, night mode,
immersive confirmation, window size, density, GPU driver). A mismatch aborts the
run; it never records a result under a drifted profile.
