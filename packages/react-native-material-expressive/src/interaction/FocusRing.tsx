import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { useSpring } from '../motion';
import { useM3Theme } from '../theme';

/** Compose `RippleDefaults.InsetFocusRingThemeConfiguration`, in dp. */
export const FOCUS_RING = Object.freeze({
  outerStrokeInset: 0,
  outerStrokeWidth: 2,
  innerStrokeInset: 1,
  innerStrokeWidth: 3,
});

export interface FocusRingProps {
  /** Whether the ring is shown. */
  visible: boolean;
  /** Outer corner radius of the focused shape, in dp. */
  radius: number;
  /**
   * Static interpolation 0–1 for deterministic previews and diff scenes.
   * When omitted the ring animates with the Compose focus/unfocus specs.
   */
  progress?: number;
  /** Defaults to `colorScheme.secondary` (Compose default). */
  outerColor?: string;
  /** Defaults to `colorScheme.onSecondary` (Compose default). */
  innerColor?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * The Material3 inset focus ring.
 *
 * Dimensions and colours come from `material3` `Ripple.kt:349-357` and
 * `Ripple.kt:784-801`: outer 0 dp inset / 2 dp stroke in `secondary`, inner
 * 1 dp inset / 3 dp stroke in `onSecondary`, inner drawn first. The ring grows
 * with the fast spatial spring and shrinks with the fast effects spring
 * (`Ripple.kt:852-853`). Motion kind: **spatial** on focus, **effects** on
 * unfocus.
 */
export function FocusRing({
  visible,
  radius,
  progress,
  outerColor,
  innerColor,
  style,
  testID,
}: FocusRingProps) {
  const theme = useM3Theme();
  const outer = outerColor ?? theme.colorScheme.secondary;
  const inner = innerColor ?? theme.colorScheme.onSecondary;
  const animatedProgress = useSpring(visible ? 1 : 0, {
    kind: visible ? 'spatial' : 'effects',
    speed: 'fast',
    initialValue: 0,
  });

  const innerStyle = useAnimatedStyle(() => {
    const p = progress ?? animatedProgress.value;
    const inset = FOCUS_RING.innerStrokeInset * p;
    return {
      left: inset,
      top: inset,
      right: inset,
      bottom: inset,
      borderWidth: FOCUS_RING.innerStrokeWidth * p,
      borderRadius: Math.max(0, radius - inset),
      borderColor: inner,
    };
  });
  const outerStyle = useAnimatedStyle(() => {
    const p = progress ?? animatedProgress.value;
    const inset = FOCUS_RING.outerStrokeInset * p;
    return {
      left: inset,
      top: inset,
      right: inset,
      bottom: inset,
      borderWidth: FOCUS_RING.outerStrokeWidth * p,
      borderRadius: Math.max(0, radius - inset),
      borderColor: outer,
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]} testID={testID}>
      <Animated.View style={[styles.ring, innerStyle]} />
      <Animated.View style={[styles.ring, outerStyle]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
  },
});
