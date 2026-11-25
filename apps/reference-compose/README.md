# Compose reference harness

Reference-only Android app used to render the Day 3 scene manifests with Jetpack
Compose Material3 **1.5.0**. It is the truth side of the pixel comparison; the
React Native harness is `apps/gallery` and both read the same
`tools/scenes/*.json` files.

This app is not published and is not part of the library. ADR-004 applies to the
iOS reference harness, not this Android one.

## Pins

| Item                            | Version      |
| ------------------------------- | ------------ |
| Compose Material3               | 1.5.0        |
| Compose UI                      | 1.12.0       |
| Activity Compose                | 1.13.0       |
| AGP                             | 9.1.0        |
| Gradle                          | 9.3.1        |
| Kotlin Compose plugin           | 2.2.10       |
| compileSdk / minSdk / targetSdk | 37 / 31 / 36 |

`material3:1.5.0` requires `minCompileSdk = 37` and AGP >= 9.1.0. The minimum
SDK is 31 because this harness is only run on the frozen API 31 emulator.

## Build and install

```bash
cd apps/reference-compose
JAVA_HOME=$(/usr/libexec/java_home -v 17) ./gradlew :app:assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

The scene folder is wired as an Android assets source directory
(`sourceSets["main"].assets.srcDir("../../../tools/scenes")`), so rebuilding is
not needed after a scene JSON edit. `tools/pixel/build-harnesses.sh` rebuilds it
together with the RN harness.

## Run a scene

```bash
adb shell am force-stop com.nasyxrakeeb.m3ereference
adb shell am start -n com.nasyxrakeeb.m3ereference/.MainActivity --es scene trivial

# Re-render the current scene in the same process (used for determinism runs).
adb shell am broadcast -a com.nasyxrakeeb.m3ereference.RERENDER
```

The activity hides the system bars, keeps the screen on, and renders the scene
at screen `(0,0)`. A 320×24 dp readiness band at `y = 220 dp` is red while the
frame is not ready, orange if the variable-font probe fails, and green when the
frame is ready. The pixel pipeline only accepts green.

Log markers (tag `M3E`):

- `M3E_FONT_HASH fonts/RobotoFlex.ttf <sha256>`
- `M3E_FONT_PROBE wdth25=356 wdth100=402 ok=true`
- `M3E_READY scene=trivial render=N`
- `M3E_TEXT_LAYOUT text=M3 Expressive width=402 height=73 lines=1`
- `M3E_SCENE_ERROR scene=<id>` if the asset cannot be loaded

## Font license

`app/src/main/assets/fonts/RobotoFlex.ttf` is Roboto Flex, licensed under the
SIL Open Font License 1.1. The license text is in
`app/src/main/assets/fonts/OFL.txt` and is copied into the APK.
