/**
 * Small sRGB colour helpers used by the tonal-elevation and state-layer math.
 *
 * Compose composites colours in sRGB space for `Color.compositeOver`; these
 * functions mirror that for 8-bit hex values. They are worklet-safe (no RN
 * imports) so interaction styles can be derived on the UI thread if needed.
 */

export interface Rgba {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
}

const HEX_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export function parseHexColor(hex: string): Rgba {
  'worklet';
  if (!HEX_PATTERN.test(hex)) {
    throw new Error(`Invalid hex colour: ${hex}`);
  }
  let body = hex.slice(1);
  if (body.length === 3) {
    body = body
      .split('')
      .map((part) => part + part)
      .join('');
  }
  const r = Number.parseInt(body.slice(0, 2), 16);
  const g = Number.parseInt(body.slice(2, 4), 16);
  const b = Number.parseInt(body.slice(4, 6), 16);
  const a = body.length === 8 ? Number.parseInt(body.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

function channel(value: number): string {
  'worklet';
  return Math.round(Math.min(255, Math.max(0, value)))
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
}

export function toHexColor(color: Rgba): string {
  'worklet';
  const alpha = Math.round(Math.min(1, Math.max(0, color.a)) * 255);
  const base = `#${channel(color.r)}${channel(color.g)}${channel(color.b)}`;
  return alpha === 255 ? base : `${base}${channel(alpha)}`;
}

/**
 * `foreground` composited over `background`, both in sRGB 0–255.
 * Mirrors Compose `Color.compositeOver`.
 */
export function compositeOver(foreground: Rgba, background: Rgba): Rgba {
  'worklet';
  const alpha = foreground.a;
  const inverse = 1 - alpha;
  return {
    r: foreground.r * alpha + background.r * inverse,
    g: foreground.g * alpha + background.g * inverse,
    b: foreground.b * alpha + background.b * inverse,
    a: 1,
  };
}

export function withAlpha(hex: string, alpha: number): string {
  'worklet';
  const color = parseHexColor(hex);
  return toHexColor({ ...color, a: Math.min(1, Math.max(0, alpha)) });
}

/** Compare two hex colours by parsed channel values, ignoring case/short form. */
export function colorsEqual(a: string, b: string): boolean {
  'worklet';
  const left = parseHexColor(a);
  const right = parseHexColor(b);
  return left.r === right.r && left.g === right.g && left.b === right.b && left.a === right.a;
}
