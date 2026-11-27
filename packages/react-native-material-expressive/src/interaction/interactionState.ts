/**
 * The interaction state machine shared by every pressable primitive.
 *
 * It mirrors the interaction set Compose Material3 exposes through
 * `InteractionSource`: hover, focus, press, drag and long-press, plus the
 * enabled/disabled gate. Visual components consume the derived state name;
 * they never infer state from raw pointer events themselves.
 */

export type InteractionStateName =
  'default' | 'hover' | 'focus' | 'pressed' | 'dragged' | 'disabled';

export interface InteractionState {
  readonly enabled: boolean;
  readonly hovered: boolean;
  readonly focused: boolean;
  readonly pressed: boolean;
  readonly dragged: boolean;
  readonly longPressed: boolean;
}

export const INITIAL_INTERACTION_STATE: InteractionState = Object.freeze({
  enabled: true,
  hovered: false,
  focused: false,
  pressed: false,
  dragged: false,
  longPressed: false,
});

export type InteractionEvent =
  | { readonly type: 'enable' }
  | { readonly type: 'disable' }
  | { readonly type: 'hover'; readonly hovered: boolean }
  | { readonly type: 'focus'; readonly focused: boolean }
  | { readonly type: 'press'; readonly pressed: boolean }
  | { readonly type: 'drag'; readonly dragged: boolean }
  | { readonly type: 'longPress' }
  | { readonly type: 'reset' };

function clearTransient(state: InteractionState): InteractionState {
  return {
    enabled: state.enabled,
    hovered: false,
    focused: false,
    pressed: false,
    dragged: false,
    longPressed: false,
  };
}

export function interactionReducer(
  state: InteractionState,
  event: InteractionEvent,
): InteractionState {
  switch (event.type) {
    case 'enable':
      return state.enabled ? state : { ...state, enabled: true };
    case 'disable':
      return state.enabled ? clearTransient({ ...state, enabled: false }) : state;
    case 'hover':
      if (!state.enabled || state.hovered === event.hovered) return state;
      return { ...state, hovered: event.hovered };
    case 'focus':
      if (!state.enabled || state.focused === event.focused) return state;
      return { ...state, focused: event.focused };
    case 'press':
      if (!state.enabled) return state;
      if (state.pressed === event.pressed) return state;
      return {
        ...state,
        pressed: event.pressed,
        longPressed: event.pressed ? state.longPressed : false,
      };
    case 'drag':
      if (!state.enabled || state.dragged === event.dragged) return state;
      return { ...state, dragged: event.dragged };
    case 'longPress':
      if (!state.enabled || !state.pressed || state.longPressed) return state;
      return { ...state, longPressed: true };
    case 'reset':
      return state.hovered || state.focused || state.pressed || state.dragged || state.longPressed
        ? clearTransient(state)
        : state;
    default:
      return state;
  }
}

/**
 * The visual state, in Material's precedence order. Long-press shares the
 * pressed visual; it is exposed separately for haptics and callbacks.
 */
export function interactionStateName(state: InteractionState): InteractionStateName {
  if (!state.enabled) return 'disabled';
  if (state.dragged) return 'dragged';
  if (state.pressed) return 'pressed';
  if (state.focused) return 'focus';
  if (state.hovered) return 'hover';
  return 'default';
}
