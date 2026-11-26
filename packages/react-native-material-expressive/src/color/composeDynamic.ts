/**
 * Compose Material3 dynamic-colour role mapping.
 *
 * Compose's API 31–33 dynamic scheme maps system tonal palettes to roles with a
 * fixed table. The system exposes only 13 tones per palette; Compose derives
 * the intermediate surface tones (98, 96, 94, 92, 87, 24, 22, 17, 12, 6, 4)
 * from the 40-tone with Cam16. This module performs the same derivation with
 * `material-color-utilities` so the role values can be verified against
 * `dynamicLightColorScheme` / `dynamicDarkColorScheme` on an emulator.
 */
import { Hct, hexFromArgb } from '@material/material-color-utilities';
import { standardDarkColorScheme, standardLightColorScheme } from './defaultSchemes';
import type { M3ColorScheme } from './types';

/** Tones exposed by Android's `system_accent*` / `system_neutral*` resources. */
export const COMPOSE_TONES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100] as const;
export type ComposeTone = (typeof COMPOSE_TONES)[number];

/** Five tonal ranges used by Compose's dynamic scheme. */
export interface ComposeTonalPalette {
  primary: Record<ComposeTone, string>;
  secondary: Record<ComposeTone, string>;
  tertiary: Record<ComposeTone, string>;
  neutral: Record<ComposeTone, string>;
  neutralVariant: Record<ComposeTone, string>;
}

type PaletteName = keyof ComposeTonalPalette;
type ToneName =
  | 0
  | 4
  | 6
  | 10
  | 12
  | 17
  | 20
  | 22
  | 24
  | 30
  | 40
  | 50
  | 60
  | 70
  | 80
  | 87
  | 90
  | 92
  | 94
  | 95
  | 96
  | 98
  | 99
  | 100;

function toneValue(palette: ComposeTonalPalette, name: PaletteName, tone: ToneName): string {
  const direct = palette[name][tone as ComposeTone];
  if (direct !== undefined) {
    return direct.toUpperCase();
  }
  const base = Hct.fromInt(Number.parseInt(palette[name][40].slice(1), 16) | 0xff000000);
  return hexFromArgb(Hct.from(base.hue, base.chroma, tone).toInt()).toUpperCase();
}

/**
 * Build a complete Compose-compatible scheme from five system tonal palettes.
 *
 * Error roles and `scrim` are not part of Compose's dynamic tonal palette; they
 * come from the baseline scheme, exactly as `lightColorScheme()` /
 * `darkColorScheme()` do when the dynamic overloads omit them.
 */
export function composeSchemeFromTonalPalette(
  palette: ComposeTonalPalette,
  isDark: boolean,
): M3ColorScheme {
  const p = (tone: ToneName) => toneValue(palette, 'primary', tone);
  const s = (tone: ToneName) => toneValue(palette, 'secondary', tone);
  const t = (tone: ToneName) => toneValue(palette, 'tertiary', tone);
  const nv = (tone: ToneName) => toneValue(palette, 'neutralVariant', tone);
  const baseline = isDark ? standardDarkColorScheme() : standardLightColorScheme();

  return Object.freeze({
    error: baseline.error,
    onError: baseline.onError,
    errorContainer: baseline.errorContainer,
    onErrorContainer: baseline.onErrorContainer,
    scrim: nv(0),

    primary: isDark ? p(80) : p(40),
    onPrimary: isDark ? p(20) : p(100),
    primaryContainer: isDark ? p(30) : p(90),
    onPrimaryContainer: isDark ? p(90) : p(10),
    inversePrimary: isDark ? p(40) : p(80),
    surfaceTint: isDark ? p(80) : p(40),

    secondary: isDark ? s(80) : s(40),
    onSecondary: isDark ? s(20) : s(100),
    secondaryContainer: isDark ? s(30) : s(90),
    onSecondaryContainer: isDark ? s(90) : s(10),

    tertiary: isDark ? t(80) : t(40),
    onTertiary: isDark ? t(20) : t(100),
    tertiaryContainer: isDark ? t(30) : t(90),
    onTertiaryContainer: isDark ? t(90) : t(10),

    background: isDark ? nv(6) : nv(98),
    onBackground: isDark ? nv(90) : nv(10),
    surface: isDark ? nv(6) : nv(98),
    onSurface: isDark ? nv(90) : nv(10),
    surfaceVariant: isDark ? nv(30) : nv(90),
    onSurfaceVariant: isDark ? nv(80) : nv(30),
    surfaceBright: isDark ? nv(24) : nv(98),
    surfaceDim: isDark ? nv(6) : nv(87),
    surfaceContainer: isDark ? nv(12) : nv(94),
    surfaceContainerHigh: isDark ? nv(17) : nv(92),
    surfaceContainerHighest: isDark ? nv(22) : nv(90),
    surfaceContainerLow: isDark ? nv(10) : nv(96),
    surfaceContainerLowest: isDark ? nv(4) : nv(100),
    inverseSurface: isDark ? nv(90) : nv(20),
    inverseOnSurface: isDark ? nv(20) : nv(95),
    outline: isDark ? nv(60) : nv(50),
    outlineVariant: isDark ? nv(30) : nv(80),

    primaryFixed: p(90),
    primaryFixedDim: p(80),
    onPrimaryFixed: p(10),
    onPrimaryFixedVariant: p(30),
    secondaryFixed: s(90),
    secondaryFixedDim: s(80),
    onSecondaryFixed: s(10),
    onSecondaryFixedVariant: s(30),
    tertiaryFixed: t(90),
    tertiaryFixedDim: t(80),
    onTertiaryFixed: t(10),
    onTertiaryFixedVariant: t(30),
  });
}
