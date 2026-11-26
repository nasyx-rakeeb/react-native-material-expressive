/**
 * Public Android dynamic-colour access with graceful fallback.
 *
 * The native module is optional: on iOS, web, Jest, Expo Go, or an Android
 * device below API 31 this module returns `null` and the theme provider keeps
 * its static scheme.
 */
import { Platform, TurboModuleRegistry } from 'react-native';
import {
  COMPOSE_TONES,
  composeSchemeFromTonalPalette,
  type ComposeTonalPalette,
  type ComposeTone,
} from '../color/composeDynamic';
import { standardDarkColorScheme, standardLightColorScheme } from '../color/defaultSchemes';
import { M3_COLOR_ROLES, type M3ColorRole, type M3ColorScheme } from '../color/types';
import type { Spec } from '../native/NativeM3EDynamicColor';

const HEX = /^#[0-9A-F]{6}$/;

/**
 * Compose's API 34 dynamic style exposes 43 role resources. Error roles and
 * scrim are not part of it: Compose's `lightColorScheme` / `darkColorScheme`
 * defaults fill them with the static baseline values.
 */
const BASELINE_ROLES = new Set<M3ColorRole>([
  'error',
  'onError',
  'errorContainer',
  'onErrorContainer',
  'scrim',
]);

type TonePalette = Record<ComposeTone, string>;

interface TonesPayload {
  kind: 'tones';
  apiLevel: number;
  tones: {
    primary: TonePalette;
    secondary: TonePalette;
    tertiary: TonePalette;
    neutral: TonePalette;
    neutralVariant: TonePalette;
  };
}

interface RolesPayload {
  kind: 'roles';
  apiLevel: number;
  light: Record<string, string>;
  dark: Record<string, string>;
}

export interface DynamicColorSchemes {
  light: M3ColorScheme;
  dark: M3ColorScheme;
  apiLevel: number;
  kind: 'tones' | 'roles';
}

const nativeModule =
  Platform.OS === 'android' ? TurboModuleRegistry.get<Spec>('M3EDynamicColor') : null;

let payloadPromise: Promise<DynamicColorSchemes | null> | null = null;

/** Whether the native bridge is present. API level is checked natively. */
export function isDynamicColorAvailable(): boolean {
  return nativeModule != null;
}

function isTonePalette(value: unknown): value is TonePalette {
  if (value == null || typeof value !== 'object') return false;
  const palette = value as Record<string, unknown>;
  return COMPOSE_TONES.every((tone) => {
    const color = palette[String(tone)];
    return typeof color === 'string' && HEX.test(color.toUpperCase());
  });
}

function parseTones(payload: TonesPayload): ComposeTonalPalette {
  const tones = payload.tones;
  if (
    !tones ||
    !isTonePalette(tones.primary) ||
    !isTonePalette(tones.secondary) ||
    !isTonePalette(tones.tertiary) ||
    !isTonePalette(tones.neutral) ||
    !isTonePalette(tones.neutralVariant)
  ) {
    throw new Error('M3E dynamic color: malformed tonal palette payload.');
  }
  const normalize = (palette: TonePalette): TonePalette =>
    Object.fromEntries(
      COMPOSE_TONES.map((tone) => [tone, palette[tone].toUpperCase()]),
    ) as TonePalette;
  return {
    primary: normalize(tones.primary),
    secondary: normalize(tones.secondary),
    tertiary: normalize(tones.tertiary),
    neutral: normalize(tones.neutral),
    neutralVariant: normalize(tones.neutralVariant),
  };
}

function parseRoles(value: unknown, isDark: boolean): M3ColorScheme {
  if (value == null || typeof value !== 'object') {
    throw new Error('M3E dynamic color: malformed role payload.');
  }
  const record = value as Record<string, unknown>;
  const baseline = isDark ? standardDarkColorScheme() : standardLightColorScheme();
  const result: Record<string, string> = {};
  for (const role of M3_COLOR_ROLES) {
    const color = record[role];
    if (color === undefined && BASELINE_ROLES.has(role)) {
      result[role] = baseline[role];
      continue;
    }
    if (typeof color !== 'string' || !HEX.test(color.toUpperCase())) {
      throw new Error(`M3E dynamic color: missing or invalid role "${role}".`);
    }
    result[role] = color.toUpperCase();
  }
  return Object.freeze(result) as M3ColorScheme;
}

/**
 * Parse a native payload. Exported for the host-side contract tests; the
 * module-level loader catches malformed payloads and falls back to static
 * colours.
 */
export function parseDynamicColorPayload(raw: string): DynamicColorSchemes | null {
  const parsed = JSON.parse(raw) as
    TonesPayload | RolesPayload | { kind: 'unsupported'; apiLevel: number };

  if (parsed.kind === 'unsupported') {
    return null;
  }
  if (parsed.kind === 'tones') {
    const palette = parseTones(parsed);
    return {
      light: composeSchemeFromTonalPalette(palette, false),
      dark: composeSchemeFromTonalPalette(palette, true),
      apiLevel: parsed.apiLevel,
      kind: 'tones',
    };
  }
  if (parsed.kind === 'roles') {
    return {
      light: parseRoles(parsed.light, false),
      dark: parseRoles(parsed.dark, true),
      apiLevel: parsed.apiLevel,
      kind: 'roles',
    };
  }
  return null;
}

async function loadPayload(): Promise<DynamicColorSchemes | null> {
  if (!nativeModule) {
    return null;
  }
  const raw = await nativeModule.getDynamicColorPayload();
  return parseDynamicColorPayload(raw);
}

/**
 * Read the platform scheme once and cache it for the process lifetime.
 * Returns `null` when dynamic colour is unavailable or malformed.
 */
export function getDynamicColorSchemes(): Promise<DynamicColorSchemes | null> {
  payloadPromise ??= loadPayload().catch(() => null);
  return payloadPromise;
}

/** Clear the dynamic-colour cache. Intended for tests. */
export function resetDynamicColorCache(): void {
  payloadPromise = null;
}
