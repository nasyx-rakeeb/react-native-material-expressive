# M3E Gallery

Expo dev app for `react-native-material-expressive`. It is the component catalog, theme playground, and (from Day 3) the RN scene renderer used by the diff pipeline.

> Day 1 status: boot check only. No library components are implemented yet.

## Run

From the repo root:

```sh
pnpm install
pnpm --filter @react-native-material-expressive/gallery start
```

Then press `a` for Android or `i` for iOS. Expo Go is enough for Day 1 because the app has no custom native modules yet. The dev client arrives when the dynamic-color native module is added (Day 4).

For an already-running emulator/simulator:

```sh
pnpm --filter @react-native-material-expressive/gallery android
pnpm --filter @react-native-material-expressive/gallery ios
```

## Pinned runtime

- Expo SDK 58.0.26
- React Native 0.88.1
- React 19.3.0
- Reanimated 4.7.1 + Worklets 0.13.0 (Expo SDK 58 pair)
- New Architecture, Hermes

Do not upgrade Reanimated/Worklets independently of Expo. The compatibility table is maintained in ADR-003 and `docs/research/DAY0_SOURCES.md`.
