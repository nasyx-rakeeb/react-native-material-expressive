# react-native-material-expressive

Material 3 Expressive components for React Native. Fidelity is measured against **Jetpack Compose Material3 1.5.0**, not claimed from screenshots and not copied from another port.

> **Status: pre-alpha (Day 1 scaffolding).** No components are implemented yet. The API is not stable and nothing is published. The first release will be `1.0.0`; there is no MVP release.

## Why this exists

React Native Paper v6 is the compatibility baseline. On top of that, this library targets the full Material 3 Expressive surface: shape-morphing buttons and chips, connected button groups, split buttons, FAB menus, wavy progress, loading indicators, floating toolbars, expressive sliders, carousels, segmented lists, grouped menus, scroll fields, and the supporting foundations (MaterialShapes, motion schemes, dynamic color, typography).

The difference is verification: every Compose-backed component is rendered on Android next to a Compose Material3 1.5.0 reference and pixel-diffed. Surfaces with no Compose implementation (SideSheet, Banner, Avatar, DataTable, Accordion) are **spec-verified** against m3.material.io measurements and are never described as Compose-verified.

## Requirements

- Node.js >= 22.14
- pnpm 12.23.0 (`corepack enable && corepack prepare pnpm@12.23.0 --activate`)
- React Native >= 0.81; latest tested: 0.88.1 via Expo SDK 58
- React 19.3
- New Architecture (required by Reanimated 4)
- Android and iOS are first-class; web is best-effort

## Monorepo

```
packages/react-native-material-expressive   the library
apps/gallery                                Expo gallery + scene renderer
apps/reference-compose                      Compose 1.5.0 reference app (Day 3)
tools/extract-tokens                        Compose sources -> specs -> TS (Day 2)
tools/diff                                  screenshot capture + comparison (Day 3)
docs                                        playbook, progress, ADRs, specs
```

## Development

```sh
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Gallery (after the app is running; see `apps/gallery/README.md`):

```sh
pnpm --filter @react-native-material-expressive/gallery start
```

## Documentation

- [Playbook](docs/PLAYBOOK.md)
- [Progress log](docs/progress/PROGRESS.md)
- [Component matrix](docs/COMPONENT_MATRIX.md)
- [Decisions](docs/DECISIONS.md)
- [Known deviations](docs/KNOWN_DEVIATIONS.md)
- [Unverified](docs/UNVERIFIED.md)
- [Competitor matrix](docs/COMPETITOR_MATRIX.md)

## License

MIT for this project. Derived AndroidX files remain Apache-2.0 with their original headers; see [NOTICE](NOTICE). Roboto Flex is OFL-1.1. Material Symbols is Apache-2.0.

Not affiliated with or endorsed by Google. Material Design and Android are trademarks of Google LLC.
