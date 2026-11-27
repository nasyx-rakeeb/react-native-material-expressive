import { useEffect, useMemo } from 'react';
import {
  Easing,
  useSharedValue,
  withTiming,
  type EasingFunction,
  type EasingFunctionFactory,
  type SharedValue,
} from 'react-native-reanimated';
import { REDUCED_EFFECTS_FADE_MS, resolveMotionTimingForState } from './motionTiming';
import type { MotionKind, MotionScheme, MotionSchemeName, MotionSpeed } from './MotionScheme';
import { withComposeSpring } from './springAnimation';
import { useMotionScheme } from './useMotionScheme';
import { useReduceMotionState } from './useReduceMotion';

export interface UseSpringOptions {
  /** `spatial` for bounds/shape, `effects` for colour/alpha. Required. */
  kind: MotionKind;
  /** `default`, `fast`, or `slow`. Defaults to default. */
  speed?: MotionSpeed;
  /** Override the theme motion scheme. */
  scheme?: MotionSchemeName | MotionScheme;
  /** Override the platform reduce-motion setting. */
  reduceMotion?: boolean;
  /** Starting value; defaults to the first target. */
  initialValue?: number;
}

/**
 * Animate a shared value to `target` with a Compose-exact Material spring.
 *
 * The value updates whenever `target`, the scheme, the kind/speed, or the
 * reduce-motion setting changes. Spatial springs become instant and effects
 * springs become a 100 ms linear fade under reduce motion.
 *
 * Until the platform answers the reduce-motion query the value is held at
 * `initialValue`; the first animation starts when the setting is known.
 */
export function useSpring(target: number, options: UseSpringOptions): SharedValue<number> {
  const { kind, speed = 'default', scheme, reduceMotion, initialValue = target } = options;
  const motionScheme = useMotionScheme(scheme);
  const reduce = useReduceMotionState(reduceMotion);
  const config = motionScheme.spec(kind, speed);
  const timing = useMemo(
    () => resolveMotionTimingForState(kind, reduce, config),
    [config, kind, reduce],
  );
  const value = useSharedValue(initialValue);

  useEffect(() => {
    if (timing.type === 'hold') {
      return;
    }
    if (timing.type === 'instant') {
      value.value = target;
      return;
    }
    if (timing.type === 'fade') {
      value.value = withTiming(target, {
        duration: timing.durationMs,
        easing: Easing.linear,
      });
      return;
    }
    value.value = withComposeSpring(target, timing.config);
  }, [target, timing, value]);

  return value;
}

/** Spatial spring hook (`default` speed unless overridden). */
export function useSpatialSpring(
  target: number,
  options: Omit<UseSpringOptions, 'kind'> = {},
): SharedValue<number> {
  return useSpring(target, { ...options, kind: 'spatial' });
}

/** Effects spring hook (`default` speed unless overridden). */
export function useEffectsSpring(
  target: number,
  options: Omit<UseSpringOptions, 'kind'> = {},
): SharedValue<number> {
  return useSpring(target, { ...options, kind: 'effects' });
}

export interface UseTimedValueOptions {
  /** `spatial` for bounds/shape, `effects` for colour/alpha. Required. */
  kind: MotionKind;
  /** Compose tween duration in milliseconds. */
  durationMs: number;
  /** Compose easing. Defaults to linear. */
  easing?: EasingFunction | EasingFunctionFactory;
  /** Override the platform reduce-motion setting. */
  reduceMotion?: boolean;
  /** Starting value; defaults to the first target. */
  initialValue?: number;
  /** When `trigger` changes, snap to `from` before animating to `target`. */
  from?: number;
  /** Change this value to restart from `from`. */
  trigger?: unknown;
}

/**
 * Animate a shared value with a Compose tween, honouring reduce motion.
 *
 * Use this for the interaction tweens that Compose specifies explicitly
 * (state-layer opacity, ripple radius/alpha). Springs use `useSpring`; both
 * hooks require a declared motion kind so a spatial animation cannot hide
 * under the effects path.
 */
export function useTimedValue(target: number, options: UseTimedValueOptions): SharedValue<number> {
  const {
    kind,
    durationMs,
    easing = Easing.linear,
    reduceMotion,
    initialValue = target,
    from,
    trigger,
  } = options;
  const reduce = useReduceMotionState(reduceMotion);
  const value = useSharedValue(initialValue);

  useEffect(() => {
    if (!reduce.ready) {
      return;
    }
    if (from !== undefined && trigger !== undefined) {
      value.value = from;
    }
    if (reduce.enabled) {
      if (kind === 'spatial') {
        value.value = target;
        return;
      }
      value.value = withTiming(target, {
        duration: REDUCED_EFFECTS_FADE_MS,
        easing: Easing.linear,
      });
      return;
    }
    value.value = withTiming(target, { duration: durationMs, easing });
  }, [target, kind, durationMs, easing, from, trigger, reduce, value]);

  return value;
}
