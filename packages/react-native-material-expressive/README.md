# react-native-material-expressive

Material 3 Expressive components for React Native, verified against Jetpack Compose Material3 1.5.0.

> **Pre-alpha.** No components are published yet. The API is unstable. First release: `1.0.0`.

See the [repository README](https://github.com/nasyx-rakeeb/react-native-material-expressive#readme) for scope, status, and development docs.

## Install (planned 1.0.0 peers)

Not yet published. The planned peer dependencies are:

- `react >=19.0.0`
- `react-native >=0.81.0` (New Architecture)
- `react-native-reanimated >=4.0.0`
- `react-native-worklets >=0.7.0`
- `react-native-svg >=15.0.0` (the path renderer, ADR-002)

`react-native-worklets` must be installed and its Babel plugin must run, because the
shape animations execute on the UI thread. Expo's `babel-preset-expo` adds
`react-native-worklets/plugin` automatically when the package is installed; a custom
Babel setup must add it as the last plugin. Without it, animated shapes fail at runtime
with `Tried to synchronously call a Remote Function`.

## License

MIT. Derived AndroidX files remain Apache-2.0 with their original headers. Not affiliated with or endorsed by Google.
