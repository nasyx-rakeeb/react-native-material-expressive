import { useState } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle } from 'react-native-reanimated';

import { useTimedValue } from '../motion';
import { rippleFrameAt, rippleGeometry, RIPPLE } from './rippleGeometry';
import { STATE_LAYER_OPACITY } from './stateLayerTokens';

const FAST_OUT_SLOW_IN = Easing.bezier(0.4, 0, 0.2, 1);

export interface RippleProps {
  /** True while the press is held; false fades the ripple out. */
  active: boolean;
  width: number;
  height: number;
  /** Press position relative to the component. Defaults to the centre. */
  origin?: { readonly x: number; readonly y: number } | null;
  /** Bounded ripples clip to the component and gain 10 dp. */
  bounded?: boolean;
  /** Usually the container's content colour. */
  color: string;
  borderRadius?: number;
  /**
   * Static frame 0–1 of the 225 ms radius/centre animation, for deterministic
   * previews and diff scenes. When omitted the ripple animates.
   */
  progress?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Material3 press ripple.
 *
 * Alpha fades in over 75 ms linear, radius grows over 225 ms with
 * FastOutSlowIn, the origin moves to the centre over 225 ms linear, and the
 * release fade-out is 150 ms linear. The press colour is the content colour at
 * 0.10 alpha (`StateTokens.PressedStateLayerOpacity`). Motion kind:
 * **spatial** for radius/centre, **effects** for alpha.
 *
 * Source: `material3-ripple/.../RippleAnimation.kt:83-115,180-182`.
 */
export function Ripple({
  active,
  width,
  height,
  origin,
  bounded = true,
  color,
  borderRadius = 0,
  progress,
  style,
  testID,
}: RippleProps) {
  const geometry = rippleGeometry(width, height, origin?.x, origin?.y, bounded);
  const [press, setPress] = useState({ active: false, count: 0 });
  if (press.active !== active) {
    setPress({ active, count: press.count + (active ? 1 : 0) });
  }
  const pressId = press.count;

  const alpha = useTimedValue(active ? 1 : 0, {
    kind: 'effects',
    durationMs: active ? RIPPLE.fadeInMs : RIPPLE.fadeOutMs,
    easing: Easing.linear,
    initialValue: 0,
  });
  const radiusProgress = useTimedValue(1, {
    kind: 'spatial',
    durationMs: RIPPLE.radiusMs,
    easing: FAST_OUT_SLOW_IN,
    initialValue: 0,
    from: pressId > 0 ? 0 : undefined,
    trigger: pressId > 0 ? pressId : undefined,
  });
  const centerX = useTimedValue(geometry.centerX, {
    kind: 'spatial',
    durationMs: RIPPLE.radiusMs,
    easing: Easing.linear,
    initialValue: geometry.centerX,
    from: pressId > 0 ? geometry.originX : undefined,
    trigger: pressId > 0 ? pressId : undefined,
  });
  const centerY = useTimedValue(geometry.centerY, {
    kind: 'spatial',
    durationMs: RIPPLE.radiusMs,
    easing: Easing.linear,
    initialValue: geometry.centerY,
    from: pressId > 0 ? geometry.originY : undefined,
    trigger: pressId > 0 ? pressId : undefined,
  });

  const animatedStyle = useAnimatedStyle(() => {
    if (progress !== undefined) {
      const frame = rippleFrameAt(progress, geometry);
      return {
        width: frame.radius * 2,
        height: frame.radius * 2,
        borderRadius: frame.radius,
        left: frame.centerX - frame.radius,
        top: frame.centerY - frame.radius,
        opacity: frame.alpha * STATE_LAYER_OPACITY.pressed,
        transform: [{ scale: 1 }],
      };
    }
    const end = Math.max(1, geometry.endRadius);
    const start = geometry.startRadius;
    const scale = start / end + (1 - start / end) * radiusProgress.value;
    return {
      width: end * 2,
      height: end * 2,
      borderRadius: end,
      left: centerX.value - end,
      top: centerY.value - end,
      opacity: alpha.value * STATE_LAYER_OPACITY.pressed,
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        bounded ? { overflow: 'hidden', borderRadius } : null,
        style,
      ]}
      testID={testID}
    >
      <Animated.View style={[{ position: 'absolute', backgroundColor: color }, animatedStyle]} />
    </Animated.View>
  );
}
