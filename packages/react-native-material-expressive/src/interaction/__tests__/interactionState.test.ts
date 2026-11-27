import {
  INITIAL_INTERACTION_STATE,
  interactionReducer,
  interactionStateName,
  type InteractionState,
} from '../interactionState';

function state(overrides: Partial<InteractionState> = {}): InteractionState {
  return { ...INITIAL_INTERACTION_STATE, ...overrides };
}

describe('interaction state machine', () => {
  it('starts enabled and idle', () => {
    expect(INITIAL_INTERACTION_STATE).toEqual({
      enabled: true,
      hovered: false,
      focused: false,
      pressed: false,
      dragged: false,
      longPressed: false,
    });
    expect(interactionStateName(INITIAL_INTERACTION_STATE)).toBe('default');
  });

  it('tracks hover, focus, press and drag', () => {
    let current = interactionReducer(INITIAL_INTERACTION_STATE, { type: 'hover', hovered: true });
    expect(current.hovered).toBe(true);
    expect(interactionStateName(current)).toBe('hover');

    current = interactionReducer(current, { type: 'focus', focused: true });
    expect(interactionStateName(current)).toBe('focus');

    current = interactionReducer(current, { type: 'press', pressed: true });
    expect(interactionStateName(current)).toBe('pressed');

    current = interactionReducer(current, { type: 'drag', dragged: true });
    expect(interactionStateName(current)).toBe('dragged');

    current = interactionReducer(current, { type: 'press', pressed: false });
    current = interactionReducer(current, { type: 'drag', dragged: false });
    expect(interactionStateName(current)).toBe('focus');
  });

  it('uses Material precedence: dragged > pressed > focus > hover', () => {
    const all = state({ hovered: true, focused: true, pressed: true, dragged: true });
    expect(interactionStateName(all)).toBe('dragged');
    expect(interactionStateName({ ...all, dragged: false })).toBe('pressed');
    expect(interactionStateName({ ...all, dragged: false, pressed: false })).toBe('focus');
    expect(interactionStateName({ ...all, dragged: false, pressed: false, focused: false })).toBe(
      'hover',
    );
  });

  it('long-press only fires while pressed and is cleared on release', () => {
    let current = interactionReducer(INITIAL_INTERACTION_STATE, { type: 'longPress' });
    expect(current.longPressed).toBe(false);

    current = interactionReducer(current, { type: 'press', pressed: true });
    current = interactionReducer(current, { type: 'longPress' });
    expect(current.longPressed).toBe(true);
    expect(interactionStateName(current)).toBe('pressed');

    current = interactionReducer(current, { type: 'press', pressed: false });
    expect(current.longPressed).toBe(false);
  });

  it('disabling clears transient state and ignores input', () => {
    const active = state({ hovered: true, focused: true, pressed: true, dragged: true });
    const disabled = interactionReducer(active, { type: 'disable' });
    expect(disabled).toEqual(state({ enabled: false }));
    expect(interactionStateName(disabled)).toBe('disabled');

    expect(interactionReducer(disabled, { type: 'hover', hovered: true })).toBe(disabled);
    expect(interactionReducer(disabled, { type: 'focus', focused: true })).toBe(disabled);
    expect(interactionReducer(disabled, { type: 'press', pressed: true })).toBe(disabled);
    expect(interactionReducer(disabled, { type: 'drag', dragged: true })).toBe(disabled);
    expect(interactionReducer(disabled, { type: 'longPress' })).toBe(disabled);
  });

  it('re-enabling starts from a clean idle state', () => {
    const disabled = state({ enabled: false });
    const enabled = interactionReducer(disabled, { type: 'enable' });
    expect(enabled).toEqual(INITIAL_INTERACTION_STATE);
  });

  it('returns the same object for no-op transitions', () => {
    expect(interactionReducer(INITIAL_INTERACTION_STATE, { type: 'hover', hovered: false })).toBe(
      INITIAL_INTERACTION_STATE,
    );
    expect(interactionReducer(INITIAL_INTERACTION_STATE, { type: 'reset' })).toBe(
      INITIAL_INTERACTION_STATE,
    );
  });
});
