import { useState } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle } from 'react-native-reanimated';

import { useTimedValue } from '../motion';
import type { InteractionStateName } from './interactionState';
import { stateLayerAnimation, stateLayerOpacity } from './stateLayerTokens';

export interface StateLayerProps {
  /** Forced visual state. Live components pass the state-machine result. */
  state: InteractionStateName;
  /** Usually the container's content colour (`onSurface`, `onPrimary`, …). */
  color: string;
  /** Match the container's corner radius so the overlay is clipped visually. */
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * The Material3 state layer: a content-coloured overlay at the token opacity.
 *
 * Compose animates the layer alpha with 15/45/150 ms linear tweens
 * (`material3-ripple` `Ripple.kt:474-494`); the press visual is the ripple,
 * so `pressed` is included here only for surfaces that opt out of a ripple.
 * Motion kind: **effects**.
 */
export function StateLayer({ state, color, borderRadius = 0, style, testID }: StateLayerProps) {
  const [transition, setTransition] = useState(() => ({
    from: state,
    animation: stateLayerAnimation(state, state),
  }));
  let animation = transition.animation;
  if (transition.from !== state) {
    animation = stateLayerAnimation(transition.from, state);
    setTransition({ from: state, animation });
  }

  const opacity = useTimedValue(stateLayerOpacity(state), {
    kind: 'effects',
    durationMs: animation.durationMs,
    easing: Easing.linear,
  });
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: color, borderRadius },
        animatedStyle,
        style,
      ]}
      testID={testID}
    />
  );
}
