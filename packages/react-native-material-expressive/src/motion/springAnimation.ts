import { defineAnimation, type AnimationObject } from 'react-native-reanimated';
import { springDurationMillis, springMotionAtMillis, type SpringConfig } from './spring';

interface ComposeSpringAnimation extends AnimationObject {
  current: number;
  toValue: number;
  startValue: number;
  startTime: number;
  durationMs: number;
  velocity: number;
  config: SpringConfig;
}

/**
 * Compose-exact spring animation for Reanimated shared values.
 *
 * Compose evaluates the closed-form spring at integer millisecond timestamps and
 * ends at the duration estimated by `estimateAnimationDurationMillis`. Reanimated
 * `withSpring` uses an energy threshold instead, which keeps moving for roughly
 * twice as long and deviates by up to 1.5% on the fastest effects spring. This
 * animation follows the Compose path so component motion matches Material3.
 */
export function withComposeSpring(
  toValue: number,
  config: SpringConfig,
  callback?: (finished?: boolean) => void,
): number {
  'worklet';
  // Reanimated types its own `withSpring` as returning the target value even
  // though the runtime object is an animation; mirror that for shared-value
  // assignment.
  return defineAnimation<ComposeSpringAnimation>(toValue, () => {
    'worklet';
    const animation: ComposeSpringAnimation = {
      current: toValue,
      toValue,
      startValue: toValue,
      startTime: 0,
      durationMs: 0,
      velocity: 0,
      config,
      callback,
      onStart: (nextAnimation, current, now, previousAnimation) => {
        'worklet';
        const value = Number(current);
        const previousVelocity =
          previousAnimation && typeof previousAnimation.velocity === 'number'
            ? previousAnimation.velocity
            : 0;
        nextAnimation.startValue = value;
        nextAnimation.startTime = now;
        nextAnimation.velocity = previousVelocity;
        nextAnimation.durationMs = springDurationMillis(
          nextAnimation.config,
          value,
          nextAnimation.toValue,
          previousVelocity,
        );
        if (nextAnimation.durationMs === 0) {
          nextAnimation.current = nextAnimation.toValue;
        }
      },
      onFrame: (nextAnimation, now) => {
        'worklet';
        if (nextAnimation.durationMs === 0) {
          nextAnimation.current = nextAnimation.toValue;
          nextAnimation.velocity = 0;
          return true;
        }
        const elapsed = now - nextAnimation.startTime;
        if (elapsed >= nextAnimation.durationMs) {
          nextAnimation.current = nextAnimation.toValue;
          nextAnimation.velocity = 0;
          return true;
        }
        const motion = springMotionAtMillis(
          nextAnimation.config,
          nextAnimation.startValue,
          nextAnimation.toValue,
          nextAnimation.velocity,
          elapsed,
        );
        nextAnimation.current = motion.value;
        nextAnimation.velocity = motion.velocity;
        return false;
      },
    };
    return animation;
  }) as unknown as number;
}
