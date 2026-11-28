/**
 * Compose UI's non-linear font-scale converter.
 *
 * Ported from
 * `androidx.compose.ui.unit.fontscaling.FontScaleConverterFactory` and
 * `FontScaleConverterTable` (Compose UI 1.12.0). Compose activates the table
 * for `fontScale >= 1.03`; below that it scales linearly. React Native's
 * `allowFontScaling` is always linear, so `Text` uses this converter and sets
 * `allowFontScaling={false}` to reproduce Compose's effective dp values.
 *
 * The table values are the exact `CommonFontSizes` pairs shipped in the
 * Compose artifact. Values between table points are linearly interpolated,
 * matching `FontScaleConverterTable.lookupAndInterpolate`.
 */

const COMMON_FONT_SIZES = [8, 10, 12, 14, 18, 20, 24, 30, 100] as const;

const TABLES: Readonly<Record<number, readonly number[]>> = Object.freeze({
  1.15: [9.2, 11.5, 13.8, 16.4, 19.8, 21.8, 25.2, 30, 100],
  1.3: [10.4, 13, 15.6, 18.8, 21.6, 23.6, 26.4, 30, 100],
  1.5: [12, 15, 18, 22, 24, 26, 28, 30, 100],
  1.8: [14.4, 18, 21.6, 24.4, 27.6, 30.8, 32.8, 34.8, 100],
  2: [16, 20, 24, 26, 30, 34, 36, 38, 100],
});

const TABLE_SCALES = Object.freeze(
  Object.keys(TABLES)
    .map(Number)
    .sort((a, b) => a - b),
);

export const COMPOSE_NON_LINEAR_MIN_SCALE = 1.03;

/** True when Compose would use a non-linear font-scale table. */
export function isNonLinearFontScalingActive(fontScale: number): boolean {
  return fontScale >= COMPOSE_NON_LINEAR_MIN_SCALE;
}

function lookupAndInterpolate(
  value: number,
  from: readonly number[],
  to: readonly number[],
): number {
  const magnitude = Math.abs(value);
  const sign = Math.sign(value);
  const last = from.length - 1;
  const firstSp = from[0]!;
  const lastSp = from[last]!;
  const firstDp = to[0]!;
  const lastDp = to[last]!;

  if (magnitude <= firstSp) {
    return sign * ((magnitude / firstSp) * firstDp);
  }
  if (magnitude >= lastSp) {
    return sign * (magnitude * (lastDp / lastSp));
  }
  for (let index = 1; index <= last; index += 1) {
    const endSp = from[index]!;
    if (magnitude <= endSp) {
      const startSp = from[index - 1]!;
      const startDp = to[index - 1]!;
      const endDp = to[index]!;
      const t = (magnitude - startSp) / (endSp - startSp);
      return sign * (startDp + t * (endDp - startDp));
    }
  }
  return value;
}

function convertWithTable(sp: number, table: readonly number[]): number {
  return lookupAndInterpolate(sp, COMMON_FONT_SIZES, table);
}

function interpolateTables(
  sp: number,
  low: readonly number[],
  high: readonly number[],
  fraction: number,
): number {
  const lowValue = convertWithTable(sp, low);
  const highValue = convertWithTable(sp, high);
  return lowValue + fraction * (highValue - lowValue);
}

const IDENTITY_TABLE = COMMON_FONT_SIZES;

/**
 * Convert an sp token to the effective dp value Compose uses at `fontScale`.
 *
 * - `fontScale < 1.03`: linear `sp * fontScale`.
 * - Exact table scale (1.15, 1.3, 1.5, 1.8, 2.0): that table.
 * - Between 1.03 and 1.15: interpolate identity to the 1.15 table.
 * - Between two tables: interpolate the converted values.
 * - Above 2.0: linear `sp * fontScale` (Compose's fallback table).
 *
 * Compose keys tables with `int(fontScale * 100)`, so 1.3001 hits the 1.3
 * table while 1.2999 interpolates between 1.15 and 1.3.
 */
export function composeFontScale(sp: number, fontScale: number): number {
  if (!Number.isFinite(sp) || !Number.isFinite(fontScale)) {
    throw new TypeError('composeFontScale expects finite sp and fontScale values');
  }
  if (fontScale < COMPOSE_NON_LINEAR_MIN_SCALE) {
    return sp * fontScale;
  }

  const key = Math.trunc(fontScale * 100);
  const exact = TABLES[key / 100];
  if (exact) {
    return convertWithTable(sp, exact);
  }
  if (key > 200) {
    return sp * fontScale;
  }
  if (key < 115) {
    const fraction = (fontScale - 1) / (TABLE_SCALES[0]! - 1);
    return interpolateTables(sp, IDENTITY_TABLE, TABLES[1.15]!, fraction);
  }
  for (let index = 1; index < TABLE_SCALES.length; index += 1) {
    const high = TABLE_SCALES[index]!;
    if (fontScale <= high) {
      const low = TABLE_SCALES[index - 1]!;
      const fraction = (fontScale - low) / (high - low);
      return interpolateTables(sp, TABLES[low]!, TABLES[high]!, fraction);
    }
  }
  return sp * fontScale;
}

/**
 * The effective font scale multiplier for a token, relative to its unscaled
 * sp value. Useful for diagnostics and for checking the converter without
 * constructing a Text node.
 */
export function composeFontScaleRatio(sp: number, fontScale: number): number {
  return sp === 0 ? 1 : composeFontScale(sp, fontScale) / sp;
}

/**
 * Compose's local guard in `resolveLineHeightInPx` is `fontScale > 1.05`,
 * slightly later than the global converter's `1.03`. Between those values the
 * line height still goes through `TextUnit.toPx()`, which applies the global
 * converter, so the two branches differ.
 */
export const COMPOSE_LINE_HEIGHT_MULTIPLIER_MIN_SCALE = 1.05;

/**
 * Convert a line-height token the way Compose resolves it.
 *
 * `SpannableExtensions.resolveLineHeightInPx` does not simply convert the
 * line-height token. When non-linear scaling is active it preserves the
 * token's **multiplier over the font size**:
 *
 * `lineHeight = (lineHeightSp / fontSizeSp) * convertedFontSize`
 *
 * That is why `bodyLarge` (16/24 sp) has a 1.5x line box at font scale 1.3:
 * 24/16 * 20.2 = 30.3 sp, not 26.4 sp. Converting the line-height token
 * directly would make RN's line box 10 px too short and shift every glyph.
 *
 * Below 1.03 the conversion is linear. Between 1.03 and 1.05 Compose falls
 * through to `lineHeight.toPx()`, which uses the global converter.
 */
export function composeLineHeight(lineHeight: number, fontSize: number, fontScale: number): number {
  if (!Number.isFinite(lineHeight) || !Number.isFinite(fontSize) || !Number.isFinite(fontScale)) {
    throw new TypeError('composeLineHeight expects finite lineHeight, fontSize and fontScale');
  }
  if (fontScale < COMPOSE_NON_LINEAR_MIN_SCALE) {
    return lineHeight * fontScale;
  }
  if (fontScale <= COMPOSE_LINE_HEIGHT_MULTIPLIER_MIN_SCALE) {
    return composeFontScale(lineHeight, fontScale);
  }
  if (fontSize === 0) {
    // Compose would produce NaN here (0/0); keep the text measurable instead.
    return lineHeight * fontScale;
  }
  return (lineHeight / fontSize) * composeFontScale(fontSize, fontScale);
}
