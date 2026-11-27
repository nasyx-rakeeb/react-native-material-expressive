# Day 7 — renderer cost: binary size and build friction

**Device/build:** release gallery APK, RN 0.88.1, New Architecture, Hermes, built on
2026-11-26. APK SHA-256 `03057091286a7ee68993aa99dd16c21f02edfb3de389e9fc31d500d91ed9c5ca`,
**203,432,215 bytes** with both renderers installed. This is the renderer-evidence artifact (the build used for the Day 7 renderer decision) and the count paired with the hash above. An earlier build in the same session was **203,431,419 bytes** (1,796 B smaller); U-30 originally quoted that earlier artifact and has been corrected. The later U-29 spike artifact adds the on-screen FPS card and the clip probe: **203,440,223 bytes**, SHA-256 `612c6921c6444fbd8fae58b1acd8b548b64896a05ebd6a6e593d7b34653d9a28`; the 8,008 B delta is verification chrome, not renderer code.

## Per-ABI native libraries

Measured with `unzip -l <apk>`; sizes are uncompressed `.so` bytes.

| ABI | `libreact_codegen_rnsvg.so` (SVG) | `librnskia.so` (Skia) | `libwebgpu_dawn.so` (Skia) | Skia total |
|---|---:|---:|---:|---:|
| `arm64-v8a` | 771,984 | 13,961,504 | 15,818,592 | **29,780,096** |
| `armeabi-v7a` | 564,476 | 9,707,696 | 11,465,680 | 21,173,376 |
| `x86` | 1,011,012 | 15,101,004 | 18,024,792 | 33,125,796 |
| `x86_64` | 863,704 | 14,288,144 | 17,101,032 | 31,389,176 |
| **all four** | **3,211,176** | — | — | **115,468,444** |

- A shipping app packages one ABI. On `arm64-v8a`, SVG costs **0.77 MB** and Skia costs
  **29.78 MB**.
- Skia links `libwebgpu_dawn` even though the Day 7 spike never uses WebGPU.
- An earlier gallery APK built before the Skia spike dependency was added was
  **80,181,276 bytes** (recorded in the Day 7 session). It is not reproducible from the
  current tree without removing the spike dependency, so the per-library measurement
  above is the primary evidence.

## Build friction

- First release build with Skia compiled from source: **14m 25s**.
- Subsequent JS-only release rebuilds: **59s–2m 35s** (Skia native artifacts cached).
- SVG's native artifact is prebuilt; adding it did not trigger a from-source native build.
- Both renderers built, installed and ran on `emulator-5554` (API 31), release/Hermes,
  New Architecture.

## Install friction

- `react-native-svg` is already present in most Expo/RN apps and is a single peer
  (ADR-003).
- Skia adds a large native dependency plus Dawn and a heavier native build. The
  `react-native-skia` package is **not** a library dependency after ADR-002.

## Reproduce

```sh
cd apps/gallery/android
./gradlew :app:assembleRelease --console=plain
unzip -l app/build/outputs/apk/release/app-release.apk \
  | grep -E 'librnskia|libwebgpu_dawn|libreact_codegen_rnsvg'
shasum -a 256 app/build/outputs/apk/release/app-release.apk
```

Frame-time data is separate and emulator-only: `docs/evidence/day7/frame-times.md`.
