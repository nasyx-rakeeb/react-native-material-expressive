import { palette } from '../../tokens/generated/global';
import { M3_COLOR_ROLES } from '../types';
import {
  COMPOSE_TONES,
  composeSchemeFromTonalPalette,
  type ComposeTonalPalette,
} from '../composeDynamic';

function tones(prefix: 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'neutralVariant') {
  return Object.fromEntries(
    COMPOSE_TONES.map((tone) => [tone, (palette as Record<string, string>)[`${prefix}${tone}`]]),
  ) as ComposeTonalPalette['primary'];
}

const baseline: ComposeTonalPalette = {
  primary: tones('primary'),
  secondary: tones('secondary'),
  tertiary: tones('tertiary'),
  neutral: tones('neutral'),
  neutralVariant: tones('neutralVariant'),
};

describe('composeSchemeFromTonalPalette', () => {
  it('maps the 48 Compose roles for light and dark', () => {
    for (const isDark of [false, true]) {
      const scheme = composeSchemeFromTonalPalette(baseline, isDark);
      expect(Object.keys(scheme).sort()).toEqual([...M3_COLOR_ROLES].sort());
      for (const role of M3_COLOR_ROLES) {
        expect(scheme[role]).toMatch(/^#[0-9A-F]{6}$/);
      }
      expect(Object.isFrozen(scheme)).toBe(true);
    }
  });

  it('uses the Compose light tone assignments', () => {
    const scheme = composeSchemeFromTonalPalette(baseline, false);
    expect(scheme.primary).toBe(palette.primary40);
    expect(scheme.onPrimary).toBe(palette.primary100);
    expect(scheme.primaryContainer).toBe(palette.primary90);
    expect(scheme.onPrimaryContainer).toBe(palette.primary10);
    expect(scheme.inversePrimary).toBe(palette.primary80);
    expect(scheme.secondary).toBe(palette.secondary40);
    expect(scheme.tertiary).toBe(palette.tertiary40);
    expect(scheme.onPrimaryFixedVariant).toBe(palette.primary30);
  });

  it('uses the Compose dark tone assignments', () => {
    const scheme = composeSchemeFromTonalPalette(baseline, true);
    expect(scheme.primary).toBe(palette.primary80);
    expect(scheme.onPrimary).toBe(palette.primary20);
    expect(scheme.primaryContainer).toBe(palette.primary30);
    expect(scheme.onPrimaryContainer).toBe(palette.primary90);
    expect(scheme.inversePrimary).toBe(palette.primary40);
    expect(scheme.secondary).toBe(palette.secondary80);
    expect(scheme.tertiary).toBe(palette.tertiary80);
  });

  it('takes error roles from the static Compose baseline', () => {
    const light = composeSchemeFromTonalPalette(baseline, false);
    const dark = composeSchemeFromTonalPalette(baseline, true);
    expect(light.error).toBe('#B3261E');
    expect(light.errorContainer).toBe('#F9DEDC');
    expect(dark.error).toBe('#F2B8B5');
    expect(dark.errorContainer).toBe('#8C1D18');
  });

  it('derives the intermediate neutral-variant tones exactly once', () => {
    const light = composeSchemeFromTonalPalette(baseline, false);
    const dark = composeSchemeFromTonalPalette(baseline, true);
    expect(light.background).toBe(light.surface);
    expect(light.background).not.toBe(dark.background);
    expect(light.surfaceContainer).not.toBe(light.surfaceContainerHigh);
    expect(dark.surfaceContainer).not.toBe(dark.surfaceContainerHigh);
    expect(light.scrim).toBe('#000000');
    expect(dark.scrim).toBe('#000000');
  });
});
