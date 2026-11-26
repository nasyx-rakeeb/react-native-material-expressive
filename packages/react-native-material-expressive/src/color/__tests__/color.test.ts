import {
  M3_COLOR_ROLES,
  clearColorSchemeCache,
  createColorScheme,
  expressiveDarkColorScheme,
  expressiveLightColorScheme,
  standardDarkColorScheme,
  standardLightColorScheme,
  type M3SchemeVariant,
} from '..';

const VARIANTS: M3SchemeVariant[] = [
  'monochrome',
  'neutral',
  'tonalSpot',
  'vibrant',
  'expressive',
  'fidelity',
  'content',
  'rainbow',
  'fruitSalad',
];

const HEX = /^#[0-9A-F]{6}$/;

beforeEach(() => {
  clearColorSchemeCache();
});

describe('role set', () => {
  it('exposes the 48 Compose Material3 color roles', () => {
    expect(M3_COLOR_ROLES).toHaveLength(48);
    expect(new Set(M3_COLOR_ROLES).size).toBe(48);
  });

  it.each([
    ['standardLightColorScheme', standardLightColorScheme],
    ['standardDarkColorScheme', standardDarkColorScheme],
    ['expressiveLightColorScheme', expressiveLightColorScheme],
    ['expressiveDarkColorScheme', () => expressiveDarkColorScheme()],
  ])('%s has every role and a valid hex value', (_name, scheme) => {
    const colors = scheme();
    expect(Object.keys(colors).sort()).toEqual([...M3_COLOR_ROLES].sort());
    for (const role of M3_COLOR_ROLES) {
      expect(colors[role]).toMatch(HEX);
    }
  });
});

describe('default schemes', () => {
  it('keeps the extracted Compose light baseline', () => {
    const scheme = standardLightColorScheme();
    expect(scheme).toMatchObject({
      primary: '#6750A4',
      onPrimaryContainer: '#21005D',
      surfaceContainer: '#F3EDF7',
      outlineVariant: '#CAC4D0',
    });
  });

  it('applies exactly the four Compose expressive container overrides', () => {
    const standard = standardLightColorScheme();
    const expressive = expressiveLightColorScheme();
    const changed = M3_COLOR_ROLES.filter((role) => standard[role] !== expressive[role]);
    expect(changed.sort()).toEqual([
      'onErrorContainer',
      'onPrimaryContainer',
      'onSecondaryContainer',
      'onTertiaryContainer',
    ]);
    expect(expressive.onPrimaryContainer).toBe('#4F378B');
    expect(expressive.onSecondaryContainer).toBe('#4A4458');
    expect(expressive.onTertiaryContainer).toBe('#633B48');
    expect(expressive.onErrorContainer).toBe('#8C1D18');
  });

  it('keeps the extracted Compose dark baseline', () => {
    const scheme = standardDarkColorScheme();
    expect(scheme).toMatchObject({
      primary: '#D0BCFF',
      background: '#141218',
      surfaceContainer: '#211F26',
      onPrimary: '#381E72',
    });
  });

  it('does not reuse the standard dark scheme for generated expressive dark', () => {
    const expressive = expressiveDarkColorScheme('#6750A4');
    expect(expressive.primary).not.toBe(standardDarkColorScheme().primary);
  });
});

describe('createColorScheme', () => {
  it('returns a frozen 48-role scheme', () => {
    const scheme = createColorScheme({ seed: '#6750A4' });
    expect(Object.isFrozen(scheme)).toBe(true);
    expect(Object.keys(scheme)).toHaveLength(48);
    for (const role of M3_COLOR_ROLES) {
      expect(scheme[role]).toMatch(HEX);
    }
  });

  it('is deterministic and cached by value equality', () => {
    const first = createColorScheme({ seed: '#336699', isDark: true, contrastLevel: 0.5 });
    const second = createColorScheme({ seed: '#336699', isDark: true, contrastLevel: 0.5 });
    expect(second).toBe(first);
    expect(second).toEqual(first);
  });

  it.each(VARIANTS)('supports the %s variant in light and dark', (variant) => {
    const light = createColorScheme({ seed: '#006A6A', variant, isDark: false });
    const dark = createColorScheme({ seed: '#006A6A', variant, isDark: true });
    expect(light.primary).toMatch(HEX);
    expect(dark.primary).toMatch(HEX);
    expect(light.primary).not.toBe(dark.primary);
  });

  it('changes the scheme with the seed', () => {
    const a = createColorScheme({ seed: '#6750A4' });
    const b = createColorScheme({ seed: '#006A6A' });
    expect(a.primary).not.toBe(b.primary);
    expect(a.tertiary).not.toBe(b.tertiary);
  });

  it('honours the contrast level', () => {
    const low = createColorScheme({ seed: '#6750A4', contrastLevel: -1 });
    const standard = createColorScheme({ seed: '#6750A4', contrastLevel: 0 });
    const high = createColorScheme({ seed: '#6750A4', contrastLevel: 1 });
    expect(high).not.toEqual(standard);
    expect(low).not.toEqual(standard);
    expect(high.onSurface).not.toBe(low.onSurface);
  });

  it('supports every variant for a six-seed matrix', () => {
    const seeds = ['#6750A4', '#006A6A', '#B3261E', '#386A20', '#7D5260', '#FFB300'];
    for (const seed of seeds) {
      for (const variant of VARIANTS) {
        for (const isDark of [false, true]) {
          const scheme = createColorScheme({ seed, variant, isDark });
          expect(Object.keys(scheme)).toHaveLength(48);
          expect(scheme.primary).toMatch(HEX);
          expect(scheme.surfaceContainerHigh).toMatch(HEX);
        }
      }
    }
  });

  it('accepts an integer ARGB seed', () => {
    const fromHex = createColorScheme({ seed: '#6750A4' });
    const fromArgb = createColorScheme({ seed: 0xff6750a4 });
    expect(fromArgb).toEqual(fromHex);
    expect(createColorScheme({ seed: 0x6750a4 })).toEqual(fromHex);
  });

  it.each([
    ['a short hex', { seed: '#fff' }],
    ['a non-hex string', { seed: 'not-a-color' }],
    ['a negative integer', { seed: -1 }],
    ['a too-large integer', { seed: 0x1_0000_0000 }],
    ['a fractional integer', { seed: 1.5 }],
    ['an out-of-range contrast', { seed: '#6750A4', contrastLevel: 1.5 }],
    ['a NaN contrast', { seed: '#6750A4', contrastLevel: Number.NaN }],
    ['an unknown variant', { seed: '#6750A4', variant: 'unknown' as M3SchemeVariant }],
  ])('rejects %s', (_name, options) => {
    expect(() => createColorScheme(options as never)).toThrow(RangeError);
  });
});
