import { state as stateTokens } from '../../tokens/generated/global';
import {
  STATE_LAYER_OPACITY,
  stateLayerAnimation,
  stateLayerColor,
  stateLayerOpacity,
} from '../stateLayerTokens';

describe('state layer tokens', () => {
  it('matches Compose StateTokens exactly', () => {
    // material3/tokens/StateTokens.kt:21-25
    expect(STATE_LAYER_OPACITY).toEqual({
      dragged: 0.16,
      focus: 0.1,
      hover: 0.08,
      pressed: 0.1,
      default: 0,
      disabled: 0,
    });
    expect(STATE_LAYER_OPACITY.dragged).toBe(stateTokens.dragged);
    expect(STATE_LAYER_OPACITY.focus).toBe(stateTokens.focus);
    expect(STATE_LAYER_OPACITY.hover).toBe(stateTokens.hover);
    expect(STATE_LAYER_OPACITY.pressed).toBe(stateTokens.pressed);
  });

  it('uses the Compose tween durations for every transition', () => {
    // material3-ripple/ripple/Ripple.kt:474-494
    expect(stateLayerAnimation('default', 'hover')).toEqual({ durationMs: 15, easing: 'linear' });
    expect(stateLayerAnimation('hover', 'default')).toEqual({ durationMs: 15, easing: 'linear' });
    expect(stateLayerAnimation('default', 'focus')).toEqual({ durationMs: 45, easing: 'linear' });
    expect(stateLayerAnimation('focus', 'default')).toEqual({ durationMs: 15, easing: 'linear' });
    expect(stateLayerAnimation('default', 'dragged')).toEqual({ durationMs: 45, easing: 'linear' });
    expect(stateLayerAnimation('dragged', 'default')).toEqual({
      durationMs: 150,
      easing: 'linear',
    });
    expect(stateLayerAnimation('dragged', 'focus')).toEqual({ durationMs: 150, easing: 'linear' });
    expect(stateLayerAnimation('hover', 'dragged')).toEqual({ durationMs: 45, easing: 'linear' });
  });

  it('exposes opacity by state and zero for idle/disabled', () => {
    expect(stateLayerOpacity('hover')).toBe(0.08);
    expect(stateLayerOpacity('focus')).toBe(0.1);
    expect(stateLayerOpacity('pressed')).toBe(0.1);
    expect(stateLayerOpacity('dragged')).toBe(0.16);
    expect(stateLayerOpacity('default')).toBe(0);
    expect(stateLayerOpacity('disabled')).toBe(0);
  });

  it('uses the content colour unchanged', () => {
    expect(stateLayerColor('#21005D')).toBe('#21005D');
  });
});
