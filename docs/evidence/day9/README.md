# Day 9 — interaction primitives, state layers, ripple, focus ring, elevation

Day 9 delivers the interaction layer that every component consumes from Day 11
onward. It is a primitive day: no Material component ships, but the state
machine, state layers, ripple, inset focus ring, elevation/tonal surfaces, the
48 dp target helper and the haptics adapter are implemented, tested and
diffed against Compose Material3 1.5.0.

- **Status:** work complete; Day 9 Day-Close Report posted, awaiting approval.
- **Decisions:** ADR-016 amendment (no full-motion first frame), ADR-018
  (headless interaction primitives + `hitSlop`), ADR-019 (iOS elevation is an
  approximation).
- **Authority:** `androidx.compose.material3:material3:1.5.0` and
  `material3-ripple:1.5.0` sources in `docs/research/raw/src/`. Every value is
  cited in `docs/specs/interaction/behavior.md`; nothing is remembered.

## What shipped

| Area | Files |
|---|---|
| State machine | `src/interaction/Interactive.tsx`, `interactionState.ts` |
| State layers | `src/interaction/StateLayer.tsx`, `stateLayerTokens.ts` |
| Ripple | `src/interaction/Ripple.tsx`, `rippleGeometry.ts` |
| Inset focus ring | `src/interaction/FocusRing.tsx` |
| Elevation / tonal | `src/elevation/elevation.ts`, `Surface.tsx` |
| 48 dp target | `src/interaction/touchTarget.ts` |
| Haptics | `src/interaction/haptics.ts` |
| Motion readiness | `src/motion/useReduceMotion.ts`, `reduceMotionStore.ts`, `useSpring.ts` |
| Motion-kind gate | `docs/specs/interaction/behavior.md`, `tools/motion-kind/check.mjs` |
| Spec | `docs/specs/interaction/behavior.md` |
| Tests | `src/interaction/__tests__/`, `src/elevation/__tests__/`, `src/motion/__tests__/` |

## Android diff gate

Five 320×200 dp scenes, rendered by the Compose reference app and by the RN
gallery harness, captured at 1080×1920 / API 31 / 420 dpi / SwiftShader
(`emulator-5554`). Two captures per stack; determinism was 0 exact and 0
AA-aware pixels for every scene.

| Scene | What it covers | Exact px | AA-aware px | Max Δ |
|---|---|---:|---:|---:|
| `interaction-states` | default, hover, focus, pressed (settled ripple), dragged, disabled | 97,787 (22.1739%) | **0 (0.0000%)** | 9 |
| `state-layer-colors` | hover/focus/pressed/dragged over four container colours | 187,908 (42.6095%) | **0 (0.0000%)** | 9 |
| `focus-rings` | inset ring at 8/16/24 dp radii | 2,254 (0.5111%) | **0 (0.0000%)** | 18 |
| `elevation-levels` | levels 0/1/3/6/8/12 on `surface` | 22,350 (5.0680%) | **0 (0.0000%)** | 1 |
| `ripple-frames` | 25/50/75/100% of the 225 ms radius/centre animation | 79,557 (18.0401%) | **0 (0.0000%)** | 11 |

**Gate:** the PLAYBOOK §7 AA-aware 0.05% threshold. All five interaction
scenes are at **0.0000%**. The report's `aaGate` field is `null` because that
field only evaluates `core` scenes; the interaction scenes are held to the
same threshold manually.

Pairs (left Compose, right RN):

- `diff/pairs/interaction-states-compose-vs-rn.png`
- `diff/pairs/state-layer-colors-compose-vs-rn.png`
- `diff/pairs/focus-rings-compose-vs-rn.png`
- `diff/pairs/elevation-levels-compose-vs-rn.png`
- `diff/pairs/ripple-frames-compose-vs-rn.png`

Machine-readable: `diff/results.json`; HTML report: `diff/report.html`.

### Why exact-zero is not met

Exact-zero is not the gate for these scenes, and the residual is understood:

1. **8-bit alpha compositing.** RN applies `opacity` to a view layer; Compose
   draws a `Color.copy(alpha)` into the canvas. The same 0.08/0.10/0.16 value
   rounds differently by 1/255 across large fills. This is why
   `state-layer-colors` has 42.6% exact-different pixels but 0 AA-aware.
2. **Clip and ripple-edge anti-aliasing.** The pressed tile's ripple is clipped
   by the rounded rectangle; Compose and RN anti-alias the clip edge
   differently (max Δ 9–18 at those edge pixels). Pixelmatch classifies them as
   anti-aliasing; the AA-aware count is 0.
3. **Tonal level 12.** Compose/Skia produces `233,224,243`; the library's
   `toHexColor` rounds the same composite to `234,224,243` (1/255 red). The
   elevation scene records max Δ 1.
4. **Harness pixel snapping.** Compose rounds layout bounds to integer pixels
   (36 dp × 2.625 = 94.5 px becomes 95 px). Yoga rounds the same fractional
   size down. The RN scene harness snaps its static layer bounds to the device
   pixel grid so both stacks draw the same rectangle. This is a harness-only
   adjustment for fractional-dp scene geometry; the library still takes dp.
   Without it, every fractional layer lost a 1 px bottom edge and
   `state-layer-colors` measured 0.2% AA-aware.

## Compose values

Full table with file/line citations: `docs/specs/interaction/behavior.md`.

- **State layers:** hover 0.08, focus 0.10, pressed 0.10, dragged 0.16
  (`StateTokens.kt:21-25`); 15 ms linear default/hover, 45 ms focus-in and
  drag-start, 150 ms drag-out (`Ripple.kt:474-494`).
- **Ripple:** start radius `0.3 × max(w,h)`; bounded end radius
  `hypot(w,h)/2 + 10 dp`; fade-in 75 ms linear; radius 225 ms FastOutSlowIn;
  centre 225 ms linear; fade-out 150 ms linear; press alpha 0.10
  (`RippleAnimation.kt:83-115,157-174`).
- **Focus ring:** outer 0 dp inset / 2 dp `secondary`; inner 1 dp inset / 3 dp
  `onSecondary`; inner drawn first; focus-in fast spatial, focus-out fast
  effects (`Ripple.kt:349-357,784-801,852-853`).
- **Elevation:** 0/1/3/6/8/12 dp (`ElevationTokens.kt:23-41`); tonal alpha
  `((4.5·ln(elevation+1))+2)/100` applied only when the container is `surface`
  (`ColorScheme.kt:1157-1160,1566-1572`).
- **Touch target:** 48 dp (`InteractiveComponentSize.kt:266-269`).

## 48 dp target proof

`Interactive` applies `hitSlop` from `resolveHitSlop`; it never changes the
visual width/height. `src/interaction/__tests__/touchTarget.render.test.tsx`
renders a 24×24 visual, fires a 24×24 layout, and asserts:

- hit slop becomes `{12,12,12,12}` → 24 + 12 + 12 = **48 dp** on both axes;
- the rendered style is still exactly `width: 24, height: 24`.

The pure-function suite also covers oversized visuals (no negative slop),
caller extra slop, and a custom minimum. This is a platform difference:
Compose reserves 48 dp in layout; RN expands only the touch region (ADR-018).

## Haptics

`M3Haptics` is an injectable adapter (`impact`, `selection`, `notification`)
with `NOOP_HAPTICS` as the default. The library imports no haptics native
module; apps opt in with `setHapticsAdapter`. Unit tests cover the no-op
default, adapter replacement, dispatch, and reset. There is no Compose
equivalent to diff; this is documented as an intentional platform adapter.

## Reduce motion: no full-motion first frame

`useReduceMotion()` now starts at `{ enabled: true, ready: false }`; the native
answer arrives asynchronously. `useSpring`/`useTimedValue` hold the first
animation while `ready === false`, then start from the initial value if motion
is allowed. An explicit override is ready immediately. This closes the
one-frame full-motion flash in ADR-016; the amendment is in `DECISIONS.md`.

Tests: `src/motion/__tests__/reduceMotion.test.ts` (pending, native true/false,
override, held-first-animation).

## Motion-kind enforcement

Every animated property is declared `spatial` or `effects` in
`docs/specs/interaction/behavior.md`. `tools/motion-kind/check.mjs` scans the
component sources and fails when:

- a `useSpring`/`useTimedValue` call omits a literal kind;
- a raw `withTiming`/`withSpring` appears outside the motion layer;
- a component animates without a spec row, or its spec kind does not match the
  hook kind;
- a spec row has no animated source file.

It runs in `pnpm lint` and in
`src/motion/__tests__/motionKind.test.ts`; `--self-test` proves the analyzer
fails an unkinded animation (6 cases). Current: 3 components, 6 properties
(spatial 3, effects 3).

## iOS elevation

Separate evidence: `ios/README.md` and
`ios/elevation-levels-android-vs-ios.png`. The iOS shadow is an
**approximation**, never a pixel match: the tonal colour matches 5/6 levels
exactly (level 12 differs by 1/255), while the shadow is broader and softer.
Android remains the elevation gate; iOS is inspection only (ADR-004, ADR-019).

## What was not diffed

- **Live hover** on a touch emulator: the hover state is rendered statically in
  `interaction-states` and `state-layer-colors`; no pointer device was
  attached. Runtime hover is unit-tested through the state machine.
- **Keyboard focus traversal / TalkBack:** the ring is diffed statically; the
  a11y pass is Day 40.
- **Drag and long-press gestures:** the reducer is unit-tested; no transient
  gesture pixels were captured. A drag is visually the 0.16 state layer.
- **Haptics:** no hardware haptics in the emulator; adapter unit tests only.
- **Reduce motion:** unit tests and the Day 8 gallery; no pixel diff (no
  Compose equivalent).
- **Cross-boot determinism:** one boot, two captures per stack. Both captures
  were identical (0 exact, 0 AA-aware). Cross-boot determinism is part of the
  Day 46 CI hardening, not this gate.

## Reproduce

```bash
# Build both harnesses (forces the RN release JS bundle) and install.
ANDROID_SERIAL=emulator-5554 bash tools/pixel/build-harnesses.sh

# Five interaction scenes, two captures per stack.
ANDROID_SERIAL=emulator-5554 \
  M3E_SKIP_BOOT=1 M3E_BOOTS=1 M3E_REPEATS=1 M3E_SCENE_REPEATS=2 \
  M3E_SCENES=interaction-states,state-layer-colors,focus-rings,elevation-levels,ripple-frames \
  M3E_OUT=docs/evidence/day9/diff node tools/pixel/run.mjs

# Motion-kind gate and its self-test.
node tools/motion-kind/check.mjs
node tools/motion-kind/check.mjs --self-test

# 48 dp render proof.
pnpm --filter react-native-material-expressive test -- \
  --runTestsByPath src/interaction/__tests__/touchTarget.render.test.tsx
```
