import { palette } from '../../tokens/generated/global';
import {
  expressiveLightColorScheme,
  standardDarkColorScheme,
  standardLightColorScheme,
} from '../../color/defaultSchemes';
import { M3_COLOR_ROLES, type M3ColorScheme } from '../../color/types';
import {
  getDynamicColorSchemes,
  isDynamicColorAvailable,
  parseDynamicColorPayload,
} from '../dynamicColor';

const TONES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100] as const;

function toneRange(prefix: 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'neutralVariant') {
  return Object.fromEntries(
    TONES.map((tone) => [String(tone), (palette as Record<string, string>)[`${prefix}${tone}`]]),
  );
}

const TONES_PAYLOAD = {
  kind: 'tones',
  apiLevel: 31,
  tones: {
    primary: toneRange('primary'),
    secondary: toneRange('secondary'),
    tertiary: toneRange('tertiary'),
    neutral: toneRange('neutral'),
    neutralVariant: toneRange('neutralVariant'),
  },
};

function withoutBaselineRoles(scheme: M3ColorScheme): Record<string, string> {
  const result: Record<string, string> = {};
  for (const role of M3_COLOR_ROLES) {
    if (role === 'error' || role === 'onError' || role === 'errorContainer') continue;
    if (role === 'onErrorContainer' || role === 'scrim') continue;
    result[role] = scheme[role];
  }
  return result;
}

const LIGHT_ROLES = { ...withoutBaselineRoles(standardLightColorScheme()), primary: '#123456' };
const DARK_ROLES = { ...withoutBaselineRoles(standardDarkColorScheme()), primary: '#654321' };

describe('parseDynamicColorPayload', () => {
  it('returns null below API 31', () => {
    expect(
      parseDynamicColorPayload(JSON.stringify({ kind: 'unsupported', apiLevel: 30 })),
    ).toBeNull();
  });

  it('maps API 31-33 tonal palettes for light and dark', () => {
    const result = parseDynamicColorPayload(JSON.stringify(TONES_PAYLOAD));
    expect(result).not.toBeNull();
    expect(result?.kind).toBe('tones');
    expect(result?.apiLevel).toBe(31);
    expect(Object.keys(result!.light).sort()).toEqual([...M3_COLOR_ROLES].sort());
    expect(result?.light.primary).toBe(palette.primary40);
    expect(result?.dark.primary).toBe(palette.primary80);
    expect(result?.light.surface).not.toBe(result?.dark.surface);
    expect(result?.light.error).toBe(standardLightColorScheme().error);
  });

  it('fills Compose baseline roles for API 34+ role payloads', () => {
    const result = parseDynamicColorPayload(
      JSON.stringify({
        kind: 'roles',
        apiLevel: 34,
        light: LIGHT_ROLES,
        dark: DARK_ROLES,
      }),
    );
    expect(result?.kind).toBe('roles');
    expect(result?.light.primary).toBe('#123456');
    expect(result?.dark.primary).toBe('#654321');
    expect(result?.light.error).toBe(standardLightColorScheme().error);
    expect(result?.light.onErrorContainer).toBe(standardLightColorScheme().onErrorContainer);
    expect(result?.light.scrim).toBe('#000000');
    expect(result?.dark.error).toBe(standardDarkColorScheme().error);
    expect(result?.dark.onErrorContainer).toBe(standardDarkColorScheme().onErrorContainer);
  });

  it('accepts a complete 48-role payload', () => {
    const light = { ...standardLightColorScheme(), primary: '#ABCDEF' };
    const dark = { ...standardDarkColorScheme(), primary: '#FEDCBA' };
    const result = parseDynamicColorPayload(
      JSON.stringify({ kind: 'roles', apiLevel: 35, light, dark }),
    );
    expect(result?.light.primary).toBe('#ABCDEF');
    expect(result?.dark.primary).toBe('#FEDCBA');
  });

  it('rejects a role payload missing a non-baseline role', () => {
    const light = { ...LIGHT_ROLES } as Record<string, string>;
    delete light.primary;
    expect(() =>
      parseDynamicColorPayload(
        JSON.stringify({ kind: 'roles', apiLevel: 34, light, dark: DARK_ROLES }),
      ),
    ).toThrow('missing or invalid role "primary"');
  });

  it('rejects malformed tones, roles, and hex values', () => {
    expect(() =>
      parseDynamicColorPayload(JSON.stringify({ kind: 'tones', apiLevel: 31, tones: {} })),
    ).toThrow('malformed tonal palette');

    const invalid = { ...LIGHT_ROLES, primary: 'not-a-colour' };
    expect(() =>
      parseDynamicColorPayload(
        JSON.stringify({ kind: 'roles', apiLevel: 34, light: invalid, dark: DARK_ROLES }),
      ),
    ).toThrow('missing or invalid role "primary"');

    expect(
      parseDynamicColorPayload(JSON.stringify({ kind: 'something-else', apiLevel: 34 })),
    ).toBeNull();
  });
});

describe('dynamic colour fallback', () => {
  it('reports availability from the native bridge', () => {
    expect(isDynamicColorAvailable()).toBe(false);
  });

  it('returns null and caches the fallback when the bridge is absent', async () => {
    await expect(getDynamicColorSchemes()).resolves.toBeNull();
    await expect(getDynamicColorSchemes()).resolves.toBeNull();
  });

  it('keeps the expressive light baseline distinct from standard light', () => {
    expect(expressiveLightColorScheme().primary).toBe(standardLightColorScheme().primary);
    expect(expressiveLightColorScheme().onPrimaryContainer).not.toBe(
      standardLightColorScheme().onPrimaryContainer,
    );
  });
});
