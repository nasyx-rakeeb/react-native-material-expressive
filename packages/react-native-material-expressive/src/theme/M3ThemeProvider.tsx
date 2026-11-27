import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import type { M3ColorScheme } from '../color/types';
import type { M3Typography } from '../typography/types';
import { getDynamicColorSchemes, isDynamicColorAvailable } from './dynamicColor';
import { resolveM3Theme } from './resolveTheme';
import type { M3Theme, M3ThemeOptions } from './types';

const FALLBACK_THEME: M3Theme = resolveM3Theme({ mode: 'light' });
const M3ThemeContext = createContext<M3Theme>(FALLBACK_THEME);

export interface M3ThemeProviderProps extends M3ThemeOptions {
  children: ReactNode;
}

interface DynamicState {
  light: M3ColorScheme;
  dark: M3ColorScheme;
}

/**
 * Resolves the active Material 3 Expressive scheme for its subtree.
 *
 * Priority for each appearance: explicit `lightScheme`/`darkScheme`, then
 * dynamic Android colours when enabled and available, then the generated
 * expressive dark scheme in `mode="expressive"`, then the static Compose
 * baselines (expressive light, standard dark).
 */
export function M3ThemeProvider({
  children,
  mode,
  seed,
  contrastLevel,
  dynamicColor = false,
  lightScheme,
  darkScheme,
  typography,
  motionScheme,
}: M3ThemeProviderProps) {
  const systemMode = useColorScheme();
  const [dynamic, setDynamic] = useState<DynamicState | null>(null);

  useEffect(() => {
    if (!dynamicColor || !isDynamicColorAvailable()) {
      return;
    }
    let active = true;
    void getDynamicColorSchemes().then((schemes) => {
      if (!active) return;
      setDynamic(schemes ? { light: schemes.light, dark: schemes.dark } : null);
    });
    return () => {
      active = false;
    };
  }, [dynamicColor]);

  const options = useMemo(
    () => ({
      mode,
      seed,
      contrastLevel,
      dynamicColor,
      lightScheme,
      darkScheme,
      typography,
      motionScheme,
    }),
    [mode, seed, contrastLevel, dynamicColor, lightScheme, darkScheme, typography, motionScheme],
  );

  const theme = useMemo(
    () => resolveM3Theme(options, systemMode, dynamic),
    [options, systemMode, dynamic],
  );

  return <M3ThemeContext.Provider value={theme}>{children}</M3ThemeContext.Provider>;
}

/** Read the active theme. Defaults to the light expressive theme outside a provider. */
export function useM3Theme(): M3Theme {
  return useContext(M3ThemeContext);
}

/** Read only the active 48-role colour scheme. */
export function useM3ColorScheme(): M3ColorScheme {
  return useContext(M3ThemeContext).colorScheme;
}

/** Read only the active 30-role type scale. */
export function useM3Typography(): M3Typography {
  return useContext(M3ThemeContext).typography;
}
