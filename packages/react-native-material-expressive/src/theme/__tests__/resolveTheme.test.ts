import {
  M3_COLOR_ROLES,
  expressiveLightColorScheme,
  standardDarkColorScheme,
  type M3ColorScheme,
} from '../../color';
import { resolveM3Theme } from '../resolveTheme';

const CUSTOM_LIGHT = Object.fromEntries(
  M3_COLOR_ROLES.map((role) => [role, '#112233']),
) as unknown as M3ColorScheme;
const CUSTOM_DARK = Object.fromEntries(
  M3_COLOR_ROLES.map((role) => [role, '#445566']),
) as unknown as M3ColorScheme;
const DYNAMIC_LIGHT = Object.fromEntries(
  M3_COLOR_ROLES.map((role) => [role, '#778899']),
) as unknown as M3ColorScheme;
const DYNAMIC_DARK = Object.fromEntries(
  M3_COLOR_ROLES.map((role) => [role, '#AABBCC']),
) as unknown as M3ColorScheme;

describe('resolveM3Theme', () => {
  it('uses expressive light and standard dark in system mode', () => {
    const light = resolveM3Theme({}, 'light');
    expect(light.colorScheme).toBe(expressiveLightColorScheme());
    expect(light.source).toBe('default');
    expect(light.isDark).toBe(false);

    const dark = resolveM3Theme({}, 'dark');
    expect(dark.colorScheme).toBe(standardDarkColorScheme());
    expect(dark.source).toBe('default');
    expect(dark.isDark).toBe(true);
  });

  it('falls back to light when the system appearance is unknown', () => {
    expect(resolveM3Theme({}, null).resolvedMode).toBe('light');
  });

  it('honours an explicit light or dark mode over the system', () => {
    expect(resolveM3Theme({ mode: 'light' }, 'dark').isDark).toBe(false);
    expect(resolveM3Theme({ mode: 'dark' }, 'light').isDark).toBe(true);
  });

  it('generates expressive dark only in expressive mode', () => {
    const standard = resolveM3Theme({}, 'dark');
    const expressive = resolveM3Theme({ mode: 'expressive' }, 'dark');
    expect(expressive.source).toBe('generated-expressive');
    expect(expressive.colorScheme).not.toBe(standard.colorScheme);
    expect(expressive.colorScheme.primary).not.toBe(standard.colorScheme.primary);

    const expressiveLight = resolveM3Theme({ mode: 'expressive' }, 'light');
    expect(expressiveLight.colorScheme).toBe(expressiveLightColorScheme());
  });

  it('prefers dynamic colours over defaults', () => {
    const light = resolveM3Theme({ dynamicColor: true }, 'light', {
      light: DYNAMIC_LIGHT,
      dark: DYNAMIC_DARK,
    });
    expect(light.colorScheme).toBe(DYNAMIC_LIGHT);
    expect(light.source).toBe('dynamic');

    const dark = resolveM3Theme({ dynamicColor: true, mode: 'expressive' }, 'dark', {
      light: DYNAMIC_LIGHT,
      dark: DYNAMIC_DARK,
    });
    expect(dark.colorScheme).toBe(DYNAMIC_DARK);
    expect(dark.source).toBe('dynamic');
  });

  it('ignores dynamic colours when the option is off or the payload is null', () => {
    expect(resolveM3Theme({}, 'light', { light: DYNAMIC_LIGHT, dark: DYNAMIC_DARK }).source).toBe(
      'default',
    );
    expect(resolveM3Theme({ dynamicColor: true }, 'light', null).source).toBe('default');
  });

  it('prefers explicit schemes over everything', () => {
    const light = resolveM3Theme(
      { dynamicColor: true, lightScheme: CUSTOM_LIGHT, darkScheme: CUSTOM_DARK },
      'light',
      { light: DYNAMIC_LIGHT, dark: DYNAMIC_DARK },
    );
    expect(light.colorScheme).toBe(CUSTOM_LIGHT);
    expect(light.source).toBe('custom');

    const dark = resolveM3Theme(
      { dynamicColor: true, lightScheme: CUSTOM_LIGHT, darkScheme: CUSTOM_DARK },
      'dark',
      { light: DYNAMIC_LIGHT, dark: DYNAMIC_DARK },
    );
    expect(dark.colorScheme).toBe(CUSTOM_DARK);
    expect(dark.source).toBe('custom');
  });

  it('applies the contrast level to generated expressive dark', () => {
    const standard = resolveM3Theme({ mode: 'expressive', seed: '#006A6A' }, 'dark');
    const high = resolveM3Theme({ mode: 'expressive', seed: '#006A6A', contrastLevel: 1 }, 'dark');
    expect(high.colorScheme).not.toBe(standard.colorScheme);
    expect(high.colorScheme.onSurface).not.toBe(standard.colorScheme.onSurface);
  });

  it('reports the resolved mode and seed', () => {
    const theme = resolveM3Theme({ mode: 'expressive', seed: '#006A6A' }, 'dark');
    expect(theme.resolvedMode).toBe('dark');
    expect(theme.seed).toBe('#006A6A');
  });
});
