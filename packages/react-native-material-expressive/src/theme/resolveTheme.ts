import { expressiveLightColorScheme, standardDarkColorScheme } from '../color/defaultSchemes';
import { createColorScheme, expressiveDarkColorScheme } from '../color/generate';
import type { M3ColorScheme } from '../color/types';
import { defaultTypography } from '../typography/createTypography';
import type { M3Typography } from '../typography/types';
import type { M3ColorSchemeSource, M3Theme, M3ThemeOptions } from './types';

interface DynamicSchemes {
  light: M3ColorScheme;
  dark: M3ColorScheme;
}

function generatedExpressiveDark(options: M3ThemeOptions): M3ColorScheme {
  if (options.contrastLevel === undefined) {
    return expressiveDarkColorScheme(options.seed);
  }
  return createColorScheme({
    seed: options.seed ?? '#6750A4',
    isDark: true,
    variant: 'expressive',
    contrastLevel: options.contrastLevel,
  });
}

/**
 * Pure theme resolution. Exposed separately from the provider so the priority
 * rules (custom > dynamic > generated/static) are testable without React.
 */
export function resolveM3Theme(
  options: M3ThemeOptions,
  systemMode: 'light' | 'dark' | null = null,
  dynamicSchemes: DynamicSchemes | null = null,
): M3Theme {
  const mode = options.mode ?? 'system';
  const resolvedMode: 'light' | 'dark' =
    mode === 'light' || mode === 'dark' ? mode : (systemMode ?? 'light');
  const isDark = resolvedMode === 'dark';

  let colorScheme: M3ColorScheme;
  let source: M3ColorSchemeSource;

  if (isDark) {
    if (options.darkScheme) {
      colorScheme = options.darkScheme;
      source = 'custom';
    } else if (options.dynamicColor && dynamicSchemes) {
      colorScheme = dynamicSchemes.dark;
      source = 'dynamic';
    } else if (mode === 'expressive') {
      colorScheme = generatedExpressiveDark(options);
      source = 'generated-expressive';
    } else {
      colorScheme = standardDarkColorScheme();
      source = 'default';
    }
  } else if (options.lightScheme) {
    colorScheme = options.lightScheme;
    source = 'custom';
  } else if (options.dynamicColor && dynamicSchemes) {
    colorScheme = dynamicSchemes.light;
    source = 'dynamic';
  } else {
    colorScheme = expressiveLightColorScheme();
    source = 'default';
  }

  const typography: M3Typography = options.typography
    ? Object.freeze({ ...defaultTypography, ...options.typography })
    : defaultTypography;

  return {
    colorScheme,
    typography,
    isDark,
    resolvedMode,
    source,
    seed: options.seed,
  };
}
