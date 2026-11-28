import {
  COMPOSE_LINE_HEIGHT_MULTIPLIER_MIN_SCALE,
  COMPOSE_NON_LINEAR_MIN_SCALE,
  composeFontScale,
  composeFontScaleRatio,
  composeLineHeight,
  isNonLinearFontScalingActive,
} from '../fontScale';

describe('composeFontScale', () => {
  it('is linear below 1.03', () => {
    expect(COMPOSE_NON_LINEAR_MIN_SCALE).toBe(1.03);
    expect(isNonLinearFontScalingActive(1.0)).toBe(false);
    expect(isNonLinearFontScalingActive(1.029)).toBe(false);
    expect(composeFontScale(16, 1.0)).toBe(16);
    expect(composeFontScale(16, 1.02)).toBeCloseTo(16.32, 6);
    expect(composeFontScale(57, 1.0)).toBe(57);
  });

  it('uses the Compose 1.3 table exactly', () => {
    expect(isNonLinearFontScalingActive(1.3)).toBe(true);
    expect(composeFontScale(8, 1.3)).toBe(10.4);
    expect(composeFontScale(10, 1.3)).toBe(13);
    expect(composeFontScale(12, 1.3)).toBe(15.6);
    expect(composeFontScale(14, 1.3)).toBe(18.8);
    expect(composeFontScale(16, 1.3)).toBeCloseTo(20.2, 6);
    expect(composeFontScale(18, 1.3)).toBe(21.6);
    expect(composeFontScale(20, 1.3)).toBe(23.6);
    expect(composeFontScale(24, 1.3)).toBe(26.4);
    expect(composeFontScale(30, 1.3)).toBe(30);
    expect(composeFontScale(57, 1.3)).toBe(57);
    expect(composeFontScale(100, 1.3)).toBe(100);
  });

  it('matches the other Compose tables', () => {
    expect(composeFontScale(16, 1.15)).toBeCloseTo(18.1, 6);
    expect(composeFontScale(16, 1.5)).toBeCloseTo(23, 6);
    expect(composeFontScale(16, 1.8)).toBeCloseTo(26, 6);
    expect(composeFontScale(16, 2)).toBeCloseTo(28, 6);
    expect(composeFontScale(8, 2)).toBe(16);
    expect(composeFontScale(100, 2)).toBe(100);
  });

  it('interpolates between 1.0 and 1.15 and between tables', () => {
    // Compose uses int(fontScale * 100); 1.03 is between identity and 1.15.
    const at103 = composeFontScale(16, 1.03);
    expect(at103).toBeGreaterThan(16);
    expect(at103).toBeLessThan(composeFontScale(16, 1.15));
    const at125 = composeFontScale(16, 1.25);
    expect(at125).toBeGreaterThan(composeFontScale(16, 1.15));
    expect(at125).toBeLessThan(composeFontScale(16, 1.3));
  });

  it('uses the table keyed by the truncated scale', () => {
    expect(composeFontScale(16, 1.3001)).toBe(composeFontScale(16, 1.3));
    expect(composeFontScale(16, 1.2999)).not.toBe(composeFontScale(16, 1.3));
  });

  it('falls back to linear scaling above 2.0', () => {
    expect(composeFontScale(16, 2.5)).toBe(40);
    expect(composeFontScale(57, 3)).toBe(171);
  });

  it('handles zero and negative values like the table lookup', () => {
    expect(composeFontScale(0, 1.3)).toBe(0);
    expect(composeFontScale(-16, 1.3)).toBeCloseTo(-20.2, 6);
  });

  it('reports the effective ratio', () => {
    expect(composeFontScaleRatio(16, 1.0)).toBe(1);
    expect(composeFontScaleRatio(16, 1.3)).toBeCloseTo(20.2 / 16, 6);
    expect(composeFontScaleRatio(0, 1.3)).toBe(1);
  });

  it('rejects non-finite input', () => {
    expect(() => composeFontScale(Number.NaN, 1.3)).toThrow(TypeError);
    expect(() => composeFontScale(16, Number.POSITIVE_INFINITY)).toThrow(TypeError);
  });
});

describe('composeLineHeight', () => {
  it('scales linearly below 1.03', () => {
    expect(composeLineHeight(24, 16, 1)).toBe(24);
    expect(composeLineHeight(24, 16, 1.02)).toBeCloseTo(24.48, 6);
  });

  it('preserves the token multiplier above 1.05', () => {
    // Compose's resolveLineHeightInPx: 24/16 * 20.2 = 30.3.
    expect(COMPOSE_LINE_HEIGHT_MULTIPLIER_MIN_SCALE).toBe(1.05);
    expect(composeLineHeight(24, 16, 1.3)).toBeCloseTo(30.3, 6);
    // displayLarge's 57 sp is unchanged by the 1.3 table.
    expect(composeLineHeight(67.032, 57, 1.3)).toBeCloseTo(67.032, 6);
    // headlineSmall: 32/24 * 26.4 = 35.2.
    expect(composeLineHeight(32, 24, 1.3)).toBeCloseTo(35.2, 6);
  });

  it('uses the global converter between 1.03 and 1.05', () => {
    const converted = composeFontScale(24, 1.04);
    expect(composeLineHeight(24, 16, 1.04)).toBeCloseTo(converted, 6);
  });

  it('falls back to a linear line height for a zero font size', () => {
    expect(composeLineHeight(24, 0, 1.3)).toBeCloseTo(31.2, 6);
  });

  it('rejects non-finite input', () => {
    expect(() => composeLineHeight(Number.NaN, 16, 1.3)).toThrow(TypeError);
    expect(() => composeLineHeight(24, Number.NaN, 1.3)).toThrow(TypeError);
    expect(() => composeLineHeight(24, 16, Number.NaN)).toThrow(TypeError);
  });
});
