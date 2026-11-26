import { useM3Theme } from '../theme/M3ThemeProvider';
import type { M3TextStyle, M3TypeScaleRole } from './types';

/**
 * Resolve a type-scale role from the active theme.
 *
 * React Native applies the system font scale to `fontSize`, `lineHeight`, and
 * `letterSpacing` when the rendered `Text` has `allowFontScaling` enabled (the
 * default). Pass `allowFontScaling={false}` on the `Text` for exact sp values
 * in measurement and pixel scenes.
 */
export function useM3TextStyle(role: M3TypeScaleRole): M3TextStyle {
  return useM3Theme().typography[role];
}
