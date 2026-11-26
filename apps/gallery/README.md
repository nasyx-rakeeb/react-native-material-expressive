# M3E Gallery

Expo dev app for `react-native-material-expressive`. It is the component catalog, theme playground, and (from Day 3) the RN scene renderer used by the diff pipeline.

> Day 1 status: boot check only. No library components are implemented yet.

## Run

From the repo root:

```sh
pnpm install
pnpm --filter @react-native-material-expressive/gallery start
```

Then press `a` for Android or `i` for iOS. Expo Go is **not** sufficient: the gallery now contains the `M3EDynamicColor` native module, so use an Expo dev build.

For an already-running emulator/simulator:

```sh
pnpm --filter @react-native-material-expressive/gallery android
pnpm --filter @react-native-material-expressive/gallery ios
```

## Dynamic-colour verification probe

The gallery can log the native Android payload at startup. It is off by default; enable it in `apps/gallery/.env.local` (git-ignored) before bundling:

```sh
printf 'EXPO_PUBLIC_M3E_DYNAMIC_PROBE=1\n' > .env.local
pnpm --filter @react-native-material-expressive/gallery exec expo run:android --variant release
rm .env.local
```

Expo CLI loads `.env.local` for the JS bundle even when Gradle launches the bundler. The two log lines are `M3E_DYNAMIC_AVAILABLE` and `M3E_DYNAMIC_PAYLOAD`. This is gallery instrumentation, not library runtime logging. The committed Day 4 evidence was captured with the probe enabled.

## Pinned runtime

- Expo SDK 58.0.26
- React Native 0.88.1
- React 19.3.0
- Reanimated 4.7.1 + Worklets 0.13.0 (Expo SDK 58 pair)
- New Architecture, Hermes

Do not upgrade Reanimated/Worklets independently of Expo. The compatibility table is maintained in ADR-003 and `docs/research/DAY0_SOURCES.md`.
