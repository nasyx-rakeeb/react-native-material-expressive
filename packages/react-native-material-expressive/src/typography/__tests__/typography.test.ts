import { typography as tokens } from '../../tokens/generated/global';
import {
  createM3Typography,
  defaultTypography,
  M3_BASELINE_ROLES,
  M3_EMPHASIZED_ROLES,
  robotoFlexTypography,
  ROBOTO_FLEX_FAMILY,
  ROBOTO_FLEX_NATURAL_LINE_HEIGHT_RATIO,
} from '../createTypography';
import { resolveVariableFontSupport } from '../support';
import type { M3TypeScaleRole } from '../types';

const ALL_ROLES = Object.keys(tokens) as M3TypeScaleRole[];

describe('createM3Typography', () => {
  it('includes all 30 baseline and emphasized roles exactly once', () => {
    expect(ALL_ROLES).toHaveLength(30);
    expect(M3_BASELINE_ROLES).toHaveLength(15);
    expect(M3_EMPHASIZED_ROLES).toHaveLength(15);
    expect(new Set([...M3_BASELINE_ROLES, ...M3_EMPHASIZED_ROLES]).size).toBe(30);
    expect(Object.keys(defaultTypography).sort()).toEqual([...ALL_ROLES].sort());
  });

  it('uses the platform font and token values by default', () => {
    for (const role of ALL_ROLES) {
      const token = tokens[role];
      const style = defaultTypography[role];
      expect(style).toMatchObject({
        fontSize: token.fontSize,
        lineHeight: Math.max(
          token.lineHeight,
          token.fontSize * ROBOTO_FLEX_NATURAL_LINE_HEIGHT_RATIO,
        ),
        letterSpacing: token.letterSpacing,
        fontWeight: String(token.fontWeight),
        includeFontPadding: false,
      });
      expect(style.fontFamily).toBeUndefined();
      expect(style.fontVariationSettings).toBeUndefined();
    }
    expect(Object.isFrozen(defaultTypography)).toBe(true);
    for (const role of ALL_ROLES) {
      expect(Object.isFrozen(defaultTypography[role])).toBe(true);
    }
  });

  it('emits variable-font weights without a synthetic fontWeight', () => {
    const typography = createM3Typography({
      fontFamily: ROBOTO_FLEX_FAMILY,
      variableFonts: true,
    });
    for (const role of ALL_ROLES) {
      const style = typography[role];
      expect(style.fontFamily).toBe(ROBOTO_FLEX_FAMILY);
      expect(style.fontVariationSettings).toBe(`'wght' ${tokens[role].fontWeight}`);
      expect(style.fontWeight).toBeUndefined();
    }
  });

  it('uses per-weight static families when variable fonts are unavailable', () => {
    const typography = createM3Typography({
      fontFamily: 'Brand Sans',
      staticFamilies: {
        400: 'BrandSans-Regular',
        500: 'BrandSans-Medium',
        700: 'BrandSans-Bold',
      },
      variableFonts: false,
    });
    expect(typography.bodyLarge.fontFamily).toBe('BrandSans-Regular');
    expect(typography.bodyLarge.fontWeight).toBe('400');
    expect(typography.labelLarge.fontFamily).toBe('BrandSans-Medium');
    expect(typography.labelLarge.fontWeight).toBe('500');
    expect(typography.labelLargeEmphasized.fontFamily).toBe('BrandSans-Bold');
    expect(typography.labelLargeEmphasized.fontWeight).toBe('700');
    expect(typography.bodyLarge.fontVariationSettings).toBeUndefined();
  });

  it('falls back to the base family with explicit weights', () => {
    const typography = createM3Typography({
      fontFamily: 'Brand Sans',
      variableFonts: false,
    });
    expect(typography.titleMedium.fontFamily).toBe('Brand Sans');
    expect(typography.titleMedium.fontWeight).toBe('500');
    expect(typography.titleMedium.fontVariationSettings).toBeUndefined();
  });

  it('exposes a Roboto Flex convenience builder', () => {
    const typography = robotoFlexTypography();
    for (const role of ALL_ROLES) {
      expect(typography[role].fontFamily).toBe(ROBOTO_FLEX_FAMILY);
    }
  });
});

describe('resolveVariableFontSupport', () => {
  it('rejects React Native before 0.88', () => {
    expect(
      resolveVariableFontSupport({
        platform: 'ios',
        reactNativeVersion: { major: 0, minor: 87, patch: 4 },
      }),
    ).toMatchObject({ supported: false, reason: 'rn-too-old' });
  });

  it('rejects Android below API 26 even on RN 0.88', () => {
    expect(
      resolveVariableFontSupport({
        platform: 'android',
        reactNativeVersion: { major: 0, minor: 88, patch: 1 },
        androidApiLevel: 25,
      }),
    ).toMatchObject({ supported: false, reason: 'android-api-too-old' });
  });

  it('accepts RN 0.88 on Android API 26+ and iOS', () => {
    expect(
      resolveVariableFontSupport({
        platform: 'android',
        reactNativeVersion: { major: 0, minor: 88, patch: 1 },
        androidApiLevel: 26,
      }),
    ).toMatchObject({ supported: true, reason: 'supported' });
    expect(
      resolveVariableFontSupport({
        platform: 'ios',
        reactNativeVersion: { major: 0, minor: 88, patch: 1 },
      }),
    ).toMatchObject({ supported: true, reason: 'supported' });
  });

  it('reports unknown and unsupported environments', () => {
    expect(resolveVariableFontSupport({ platform: 'android' })).toMatchObject({
      supported: false,
      reason: 'rn-version-unknown',
    });
    expect(
      resolveVariableFontSupport({
        platform: 'windows',
        reactNativeVersion: { major: 0, minor: 88 },
      }),
    ).toMatchObject({ supported: false, reason: 'platform-unsupported' });
  });
});

describe('line height floor', () => {
  it('raises only the display roles whose token line height is below natural', () => {
    expect(defaultTypography.displayLarge.lineHeight).toBeCloseTo(57 * 1.176);
    expect(defaultTypography.displayLargeEmphasized.lineHeight).toBeCloseTo(57 * 1.176);
    expect(defaultTypography.displayMedium.lineHeight).toBeCloseTo(45 * 1.176);
    expect(defaultTypography.displayMediumEmphasized.lineHeight).toBeCloseTo(45 * 1.176);
    expect(defaultTypography.displaySmall.lineHeight).toBe(44);
    expect(defaultTypography.bodyLarge.lineHeight).toBe(24);
  });

  it('can be disabled or overridden for a brand font', () => {
    const nominal = createM3Typography({ naturalLineHeightRatio: 0 });
    expect(nominal.displayLarge.lineHeight).toBe(64);
    const brand = createM3Typography({ naturalLineHeightRatio: 1.3 });
    expect(brand.displayLarge.lineHeight).toBeCloseTo(57 * 1.3);
    expect(brand.displayMedium.lineHeight).toBeCloseTo(45 * 1.3);
    expect(brand.bodyLarge.lineHeight).toBe(24);
  });

  it('rejects an invalid ratio', () => {
    expect(() => createM3Typography({ naturalLineHeightRatio: -0.1 })).toThrow(RangeError);
    expect(() => createM3Typography({ naturalLineHeightRatio: Number.NaN })).toThrow(RangeError);
    expect(() => createM3Typography({ naturalLineHeightRatio: Number.POSITIVE_INFINITY })).toThrow(
      RangeError,
    );
  });
});

describe('widthAxis', () => {
  it('emits the wdth axis only when it differs from normal', () => {
    const normal = createM3Typography({
      fontFamily: ROBOTO_FLEX_FAMILY,
      variableFonts: true,
    });
    expect(normal.bodyLarge.fontVariationSettings).toBe("'wght' 400");

    const condensed = createM3Typography({
      fontFamily: ROBOTO_FLEX_FAMILY,
      variableFonts: true,
      widthAxis: 75,
    });
    expect(condensed.bodyLarge.fontVariationSettings).toBe("'wght' 400, 'wdth' 75");
  });

  it('rejects values outside the Roboto Flex width range', () => {
    for (const widthAxis of [24, 152, Number.NaN]) {
      expect(() =>
        createM3Typography({
          fontFamily: ROBOTO_FLEX_FAMILY,
          variableFonts: true,
          widthAxis,
        }),
      ).toThrow(RangeError);
    }
  });
});
