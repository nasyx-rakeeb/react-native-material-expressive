import { useEffect, useMemo } from 'react';
import { Easing, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import { resolveMotionTiming } from './motionTiming';
import type { MotionKind, MotionScheme, MotionSchemeName, MotionSpeed } from './MotionScheme';
import { withComposeSpring } from './springAnimation';
import { useMotionScheme } from './useMotionScheme';
import { useReduceMotion } from './useReduceMotion';

export interface UseSpringOptions {
  /** `spatial` for bounds/shape, `effects` for colour/alpha. Defaults to spatial. */
  kind?: MotionKind;
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
 */
export function useSpring(target: number, options: UseSpringOptions = {}): SharedValue<number> {
  const {
    kind = 'spatial',
    speed = 'default',
    scheme,
    reduceMotion,
    initialValue = target,
  } = options;
  const motionScheme = useMotionScheme(scheme);
  const reduce = useReduceMotion(reduceMotion);
  const config = motionScheme.spec(kind, speed);
  const timing = useMemo(() => resolveMotionTiming(kind, reduce, config), [config, kind, reduce]);
  const value = useSharedValue(initialValue);

  useEffect(() => {
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
