import type { M3ColorScheme, M3ContrastLevel, M3SeedColor } from '../color/types';
import type { M3Typography } from '../typography/types';

/** How the provider chooses the scheme family. */
export type M3ThemeMode = 'system' | 'light' | 'dark' | 'expressive';

/** Where the active scheme came from. */
export type M3ColorSchemeSource = 'default' | 'custom' | 'dynamic' | 'generated-expressive';

/** Fully resolved theme consumed by components. */
export interface M3Theme {
  /** Complete 48-role scheme. */
  colorScheme: M3ColorScheme;
  /** Complete 30-role type scale (baseline + emphasized). */
  typography: M3Typography;
  /** Resolved appearance. */
  isDark: boolean;
  /** Resolved light/dark appearance, even when `mode` was `system`/`expressive`. */
  resolvedMode: 'light' | 'dark';
  /** Source of the active scheme, useful for diagnostics. */
  source: M3ColorSchemeSource;
  /** Seed used by generated schemes, when applicable. */
  seed?: M3SeedColor;
}

/** Theme options accepted by `M3ThemeProvider`. */
export interface M3ThemeOptions {
  /**
   * `system` (default) uses the expressive light baseline in light mode and the
   * standard dark baseline in dark mode. `expressive` additionally generates an
   * expressive dark scheme from `seed`; Compose 1.5 has no expressive dark.
   */
  mode?: M3ThemeMode;
  /** Seed for generated schemes. Defaults to the Compose baseline `#6750A4`. */
  seed?: M3SeedColor;
  /** Contrast level for the generated expressive dark scheme. Defaults to `0`. */
  contrastLevel?: M3ContrastLevel;
  /** Prefer Android system dynamic colours when available (API 31+). */
  dynamicColor?: boolean;
  /** Explicit light scheme; overrides defaults and dynamic colours. */
  lightScheme?: M3ColorScheme;
  /** Explicit dark scheme; overrides defaults, generated, and dynamic colours. */
  darkScheme?: M3ColorScheme;
  /**
   * Type-scale role overrides. Use `createM3Typography()` or
   * `robotoFlexTypography()` to build a complete branded scale.
   */
  typography?: Partial<M3Typography>;
}
