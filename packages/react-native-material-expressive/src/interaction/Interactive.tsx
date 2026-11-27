import { useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import {
  Pressable,
  type AccessibilityRole,
  type AccessibilityState,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {
  INITIAL_INTERACTION_STATE,
  interactionReducer,
  interactionStateName,
  type InteractionState,
  type InteractionStateName,
} from './interactionState';
import { resolveHitSlop, type Insets } from './touchTarget';

export interface InteractiveRenderState extends InteractionState {
  /** Derived visual state in Material precedence order. */
  readonly state: InteractionStateName;
}

export type InteractiveChildren = ReactNode | ((state: InteractiveRenderState) => ReactNode);

export interface InteractiveProps {
  children: InteractiveChildren;
  disabled?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  onStateChange?: (state: InteractiveRenderState) => void;
  /** Extra hit slop; the 48 dp minimum is applied automatically. */
  hitSlop?: number | Partial<Insets>;
  /** Defaults to `MINIMUM_TOUCH_TARGET_DP` (48). */
  minTouchTarget?: number;
  /** Movement in dp before a held press becomes a drag. Defaults to 4. */
  dragThreshold?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: AccessibilityState;
  accessible?: boolean;
  testID?: string;
  onLayout?: (event: LayoutChangeEvent) => void;
}

function renderState(state: InteractionState): InteractiveRenderState {
  return { ...state, state: interactionStateName(state) };
}

/**
 * The interaction primitive: a Pressable with the Material state machine.
 *
 * It tracks enabled/disabled, hover, focus, press, drag and long-press, and
 * exposes the derived state to a render-prop child. It never draws a state
 * layer or ripple itself; consumers compose `StateLayer`, `Ripple` and
 * `FocusRing` so each visual keeps a declared motion kind.
 *
 * The 48 dp minimum is applied with `hitSlop`, not layout, so a 24 dp visual
 * stays 24 dp. `onPressMove` is used for drag detection; it observes movement
 * without taking over the responder, so scrolling parents still work.
 */
export function Interactive({
  children,
  disabled = false,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  onStateChange,
  hitSlop,
  minTouchTarget,
  dragThreshold = 4,
  style,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  accessible = true,
  testID,
  onLayout,
}: InteractiveProps) {
  const [state, dispatch] = useReducer(
    interactionReducer,
    disabled ? { ...INITIAL_INTERACTION_STATE, enabled: false } : INITIAL_INTERACTION_STATE,
  );
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const pressOrigin = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);

  useEffect(() => {
    dispatch({ type: disabled ? 'disable' : 'enable' });
  }, [disabled]);

  const derived = useMemo(() => renderState(state), [state]);

  useEffect(() => {
    onStateChange?.(derived);
  }, [derived, onStateChange]);

  const resolvedHitSlop = useMemo(
    () => resolveHitSlop(layout.width, layout.height, minTouchTarget, hitSlop),
    [layout.width, layout.height, minTouchTarget, hitSlop],
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
    onLayout?.(event);
  };

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ ...accessibilityState, disabled }}
      accessible={accessible}
      disabled={disabled}
      focusable={!disabled}
      hitSlop={resolvedHitSlop}
      onFocus={() => dispatch({ type: 'focus', focused: true })}
      onBlur={() => dispatch({ type: 'focus', focused: false })}
      onHoverIn={() => dispatch({ type: 'hover', hovered: true })}
      onHoverOut={() => dispatch({ type: 'hover', hovered: false })}
      onLayout={handleLayout}
      onLongPress={() => {
        dispatch({ type: 'longPress' });
        onLongPress?.();
      }}
      onPress={() => onPress?.()}
      onPressIn={(event) => {
        const { locationX, locationY } = event.nativeEvent;
        pressOrigin.current = { x: locationX, y: locationY };
        dragged.current = false;
        dispatch({ type: 'press', pressed: true });
        onPressIn?.();
      }}
      onPressMove={(event) => {
        const origin = pressOrigin.current;
        if (!origin || dragged.current) return;
        const { locationX, locationY } = event.nativeEvent;
        if (Math.hypot(locationX - origin.x, locationY - origin.y) >= dragThreshold) {
          dragged.current = true;
          dispatch({ type: 'drag', dragged: true });
        }
      }}
      onPressOut={() => {
        pressOrigin.current = null;
        dragged.current = false;
        dispatch({ type: 'press', pressed: false });
        dispatch({ type: 'drag', dragged: false });
        onPressOut?.();
      }}
      style={style}
      testID={testID}
    >
      {typeof children === 'function' ? () => children(derived) : children}
    </Pressable>
  );
}
