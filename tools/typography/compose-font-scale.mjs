/**
 * Compose UI's non-linear font-scale converter, ported from
 * `androidx.compose.ui.unit.fontscaling.FontScaleConverterFactory` (Compose UI
 * 1.12.0). Compose activates it for font scales >= 1.03; React Native's
 * `allowFontScaling` stays linear, so cross-stack text comparisons above 1.0
 * must map token sp through this table before comparing font sizes.
 *
 * The tables are the exact `CommonFontSizes` / lookup-table pairs shipped in
 * the Compose 1.12.0 artifact. Values between table points are linearly
 * interpolated, matching `FontScaleConverterTable.lookupAndInterpolate`.
 */

const COMMON_FONT_SIZES = [8, 10, 12, 14, 18, 20, 24, 30, 100];

export const COMPOSE_FONT_SCALE_TABLES = {
  1.15: {
    fromSp: COMMON_FONT_SIZES,
    toDp: [9.2, 11.5, 13.8, 16.4, 19.8, 21.8, 25.2, 30, 100],
  },
  1.3: {
    fromSp: COMMON_FONT_SIZES,
    toDp: [10.4, 13, 15.6, 18.8, 21.6, 23.6, 26.4, 30, 100],
  },
  1.5: {
    fromSp: COMMON_FONT_SIZES,
    toDp: [12, 15, 18, 22, 24, 26, 28, 30, 100],
  },
  1.8: {
    fromSp: COMMON_FONT_SIZES,
    toDp: [14.4, 18, 21.6, 24.4, 27.6, 30.8, 32.8, 34.8, 100],
  },
  2.0: {
    fromSp: COMMON_FONT_SIZES,
    toDp: [16, 20, 24, 26, 30, 34, 36, 38, 100],
  },
};

export const COMPOSE_NON_LINEAR_MIN_SCALE = 1.03;

export function isComposeNonLinearFontScalingActive(fontScale) {
  return Number(fontScale) >= COMPOSE_NON_LINEAR_MIN_SCALE;
}

/**
 * `FontScaleConverterTable.lookupAndInterpolate`: exact table hit, linear
 * interpolation between points, and linear extrapolation by the first/last
 * table ratio outside the table.
 */
function lookupAndInterpolate(value, from, to) {
  const magnitude = Math.abs(value);
  const sign = Math.sign(value);
  const last = from.length - 1;
  if (magnitude <= from[0]) {
    return sign * ((magnitude / from[0]) * to[0]);
  }
  if (magnitude >= from[last]) {
    return sign * (magnitude * (to[last] / from[last]));
  }
  for (let index = 1; index <= last; index += 1) {
    if (magnitude <= from[index]) {
      const t = (magnitude - from[index - 1]) / (from[index] - from[index - 1]);
      return sign * (to[index - 1] + t * (to[index] - to[index - 1]));
    }
  }
  return value;
}

function convertWithTable(sp, table) {
  return lookupAndInterpolate(sp, table.fromSp, table.toDp);
}

function interpolateTables(sp, lowTable, highTable, fraction) {
  const low = convertWithTable(sp, lowTable);
  const high = convertWithTable(sp, highTable);
  return low + fraction * (high - low);
}

const IDENTITY_TABLE = { fromSp: [1], toDp: [1] };

const TABLE_KEYS = Object.keys(COMPOSE_FONT_SCALE_TABLES)
  .map(Number)
  .sort((a, b) => a - b);

/**
 * Return the effective dp value Compose uses for an sp token at `fontScale`.
 *
 * Matches `FontScaleConverterFactory.forScale`:
 * - below 1.03: identity (linear scaling);
 * - exact table scale (1.15, 1.3, 1.5, 1.8, 2.0): that table;
 * - between 1.03 and 1.15: interpolate between identity and the 1.15 table;
 * - between two tables: interpolate the converted values;
 * - above 2.0: linear `sp * fontScale`.
 *
 * Compose keys tables with `int(fontScale * 100)`, so 1.3001 hits the 1.3
 * table while 1.2999 interpolates between 1.15 and 1.3.
 */
export function composeFontScale(sp, fontScale) {
  const scale = Number(fontScale);
  if (!isComposeNonLinearFontScalingActive(scale)) {
    return sp;
  }
  const key = Math.trunc(scale * 100);
  const exact = COMPOSE_FONT_SCALE_TABLES[key / 100];
  if (exact) {
    return convertWithTable(sp, exact);
  }
  if (key > 200) {
    return sp * scale;
  }
  if (key < 115) {
    const fraction = (scale - 1) / (TABLE_KEYS[0] - 1);
    return interpolateTables(sp, IDENTITY_TABLE, COMPOSE_FONT_SCALE_TABLES[1.15], fraction);
  }
  for (let index = 1; index < TABLE_KEYS.length; index += 1) {
    if (scale <= TABLE_KEYS[index]) {
      const low = TABLE_KEYS[index - 1];
      const high = TABLE_KEYS[index];
      const fraction = (scale - low) / (high - low);
      return interpolateTables(
        sp,
        COMPOSE_FONT_SCALE_TABLES[low],
        COMPOSE_FONT_SCALE_TABLES[high],
        fraction,
      );
    }
  }
  return sp * scale;
}
