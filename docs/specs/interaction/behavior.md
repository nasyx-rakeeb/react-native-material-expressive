# Interaction primitives — behavior spec

**Authority:** `androidx.compose.material3:material3:1.5.0` and
`androidx.compose.material3:material3-ripple:1.5.0`. Every number below cites a
file and line in `docs/research/raw/src/`. Nothing here is remembered or copied
from a blog or a design kit.

Scope: `Interactive`, `StateLayer`, `Ripple`, `FocusRing`, `Surface`
(elevation/tonal colour), the 48 dp touch target helper, and the haptics
adapter. These are primitives; component-level colours and shapes arrive with
each component's own spec.

## Interaction state machine

`Interactive` tracks enabled/disabled, hover, focus, press, drag and long-press.
The visual state follows Material's precedence:

| Precedence | State | Source |
|---:|---|---|
| 1 | `disabled` | `InteractiveComponentSize.kt` / component enabled semantics |
| 2 | `dragged` | `Ripple.kt:305-311` |
| 3 | `pressed` | `Ripple.kt:368-373` |
| 4 | `focus` | `Ripple.kt:296-304` |
| 5 | `hover` | `Ripple.kt:288-295` |
| 6 | `default` | — |

Long-press is tracked separately for haptics and callbacks; its visual state is
`pressed`, matching Compose's press interaction. Disabling clears every
transient state.

## State layers

| State | Opacity | Source |
|---|---:|---|
| hover | 0.08 | `material3/.../tokens/StateTokens.kt:24` |
| focus | 0.10 | `StateTokens.kt:23` |
| pressed | 0.10 | `StateTokens.kt:25` |
| dragged | 0.16 | `StateTokens.kt:22` |
| default / disabled | 0 | no layer |

The layer colour is the container's content colour (`LocalContentColor` in
Compose). The press visual is normally the ripple; `StateLayer` exposes the
pressed opacity only for surfaces that opt out of a ripple.

| Transition | Duration | Easing | Source |
|---|---:|---|---|
| default ↔ hover | 15 ms | linear | `material3-ripple/.../ripple/Ripple.kt:474-494` |
| → focus | 45 ms | linear | `Ripple.kt:477` |
| focus → default | 15 ms | linear | `Ripple.kt:487` |
| → dragged | 45 ms | linear | `Ripple.kt:478` |
| dragged → default | 150 ms | linear | `Ripple.kt:488` |

## Ripple

| Property | Value | Source |
|---|---|---|
| start radius | `0.3 × max(width, height)` | `RippleAnimation.kt:157-159` |
| end radius, bounded | `hypot(width, height) / 2 + 10 dp` | `RippleAnimation.kt:164-174` |
| end radius, unbounded | `hypot(width, height) / 2` | `RippleAnimation.kt:164-174` |
| bounded origin | press position | `Ripple.kt:300-303` |
| unbounded origin | component centre | `Ripple.kt:300-303` |
| fade-in | 75 ms linear | `RippleAnimation.kt:85-90` |
| radius | 225 ms FastOutSlowIn | `RippleAnimation.kt:91-96` |
| centre drift | 225 ms linear | `RippleAnimation.kt:97-102` |
| fade-out | 150 ms linear | `RippleAnimation.kt:106-115` |
| press alpha | 0.10 | `StateTokens.kt:25` |

A new press finishes the previous ripple (`Ripple.kt` press handling); this
primitive restarts the single ripple from the new origin.

## Inset focus ring

| Property | Value | Source |
|---|---|---|
| outer inset | 0 dp | `material3/.../Ripple.kt:349-357` |
| outer width | 2 dp | `Ripple.kt:349-357` |
| inner inset | 1 dp | `Ripple.kt:349-357` |
| inner width | 3 dp | `Ripple.kt:349-357` |
| outer colour | `colorScheme.secondary` | `Ripple.kt:784-792` |
| inner colour | `colorScheme.onSecondary` | `Ripple.kt:793-801` |
| draw order | inner, then outer | `Ripple.kt:414-427` |
| focus-in spec | `motionScheme.fastSpatial` | `Ripple.kt:332-340` |
| focus-out spec | `motionScheme.fastEffects` | `Ripple.kt:332-340` |

The ring replaces the focus state layer when the inset-ring configuration is
active: `FocusConfiguration.InsetRing` maps the focus alpha to 0
(`Ripple.kt:296-304`). The outer edge of each stroke is inset from the
component bounds by its inset; the stroke itself is drawn inside the bounds
(`Border.kt:124-150,233-280`).

## Elevation and tonal surfaces

| Level | dp | Source |
|---|---:|---|
| 0 | 0 | `material3/.../tokens/ElevationTokens.kt:24-25` |
| 1 | 1 | `ElevationTokens.kt:27-28` |
| 2 | 3 | `ElevationTokens.kt:30-31` |
| 3 | 6 | `ElevationTokens.kt:33-34` |
| 4 | 8 | `ElevationTokens.kt:36-37` |
| 5 | 12 | `ElevationTokens.kt:39-40` |

Tonal surface colour (`ColorScheme.surfaceColorAtElevation`):

```text
alpha = ((4.5 × ln(elevationDp + 1)) + 2) / 100
colour = surfaceTint at alpha composited over surface
```

Source: `ColorScheme.kt:1157-1160`. The overlay applies **only** when the
container colour equals `ColorScheme.surface`; other container roles keep their
colour (`Surface.kt` container-colour check).

Android shadows use the native `elevation` RenderNode, the same model Compose's
`Modifier.shadow` uses. iOS has no equivalent; `elevationToIosShadow` is an
approximation only. The evidence and docs call it an approximation and never a
pixel match.

## Minimum touch target

Material's minimum interactive size is **48 dp**
(`material3/.../InteractiveComponentSize.kt:266-269`). React Native's
`hitSlop` expands the touch region without changing layout, so a 24 dp visual
stays 24 dp while its target reaches 48 dp. Compose reserves layout space
instead; that is an intentional platform difference, documented in the
component docs.

## Haptics

The library never imports a haptics native module. `M3Haptics` is an injectable
adapter with `impact`, `selection` and `notification`; the default is
`NOOP_HAPTICS`. Apps opt in with `setHapticsAdapter` at startup. This keeps the
peer-dependency surface unchanged. There is no Compose equivalent to diff; the
adapter is covered by unit tests.

## Motion kinds

Every animated property declares whether it is **spatial** (bounds, position,
size, shape) or **effects** (colour, alpha, elevation, blur). Under reduced
motion, spatial animations become instant and effects animations become a
100 ms linear fade (`docs/specs/motion/behavior.md`).

The `motion-kind` check (`tools/motion-kind/check.mjs`, run by `pnpm lint` and
the package test suite) fails when a component animates without a row in this
table, when a hook call omits `kind`, or when the declared kinds do not match
the kinds passed to the hooks.

| Component | Property | Kind | Source |
|---|---|---|---|
| `StateLayer` | opacity | `effects` | `material3-ripple/.../Ripple.kt:474-494` |
| `Ripple` | radius | `spatial` | `material3-ripple/.../RippleAnimation.kt:91-96` |
| `Ripple` | centre | `spatial` | `material3-ripple/.../RippleAnimation.kt:97-102` |
| `Ripple` | alpha | `effects` | `material3-ripple/.../RippleAnimation.kt:85-90` |
| `FocusRing` | focus-in interpolation | `spatial` | `material3-ripple/.../Ripple.kt:332-340` |
| `FocusRing` | focus-out interpolation | `effects` | `material3-ripple/.../Ripple.kt:332-340` |
