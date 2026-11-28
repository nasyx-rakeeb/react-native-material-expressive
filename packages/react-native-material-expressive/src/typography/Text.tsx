import { useMemo, type ReactNode } from 'react';
import {
  Text as RNText,
  type StyleProp,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native';

import { useLayoutDirection } from '../layout';
import { useM3Theme } from '../theme/M3ThemeProvider';
import type { M3BaselineRole } from './createTypography';
import { useContentColor } from './ContentColor';
import { composeFontScale, composeLineHeight } from './fontScale';
import { useFontScale } from './useFontScale';

export type TextAlign = 'start' | 'center' | 'end' | 'left' | 'right' | 'justify';

/** How the component applies the platform font scale. */
export type TextFontScaleMode = 'compose' | 'linear' | 'none';

export interface TextProps extends Omit<RNTextProps, 'style' | 'allowFontScaling'> {
  children?: ReactNode;
  /**
   * Baseline type-scale role. Defaults to `bodyLarge`, matching Compose's
   * `LocalTextStyle` default in `MaterialTheme`.
   */
  variant?: M3BaselineRole;
  /**
   * Use the matching emphasized role (opt-in per ADR-006). Emphasized styles
   * are never the default.
   */
  emphasized?: boolean;
  /** Explicit font size in sp. Overrides the variant's size. */
  fontSize?: number;
  /** Explicit line height in sp. Overrides the variant's line height. */
  lineHeight?: number;
  /** Explicit letter spacing in sp. Overrides the variant's tracking. */
  letterSpacing?: number;
  /**
   * Text colour. When omitted, the nearest `ContentColorProvider` value is
   * used, then `colorScheme.onSurface`.
   */
  color?: string;
  /** Text alignment; `start`/`end` resolve through the layout direction. */
  align?: TextAlign;
  /**
   * `compose` (default) applies Compose's non-linear `FontScaleConverter`
   * and disables RN's linear scaling. `linear` keeps RN's linear
   * `allowFontScaling`. `none` ignores the platform scale; use it only for
   * measurement and pixel scenes.
   */
  fontScaleMode?: TextFontScaleMode;
  style?: StyleProp<TextStyle>;
}

function resolveAlign(
  align: TextAlign | undefined,
  direction: 'ltr' | 'rtl',
): TextStyle['textAlign'] | undefined {
  if (align === undefined) {
    return undefined;
  }
  if (align === 'start') {
    return direction === 'rtl' ? 'right' : 'left';
  }
  if (align === 'end') {
    return direction === 'rtl' ? 'left' : 'right';
  }
  return align;
}

/**
 * Material 3 text with Compose-faithful font scaling and content colour.
 *
 * React Native's `allowFontScaling` is linear; Compose switches to a
 * non-linear table at font scale 1.03. This component converts `fontSize`,
 * `lineHeight`, and `letterSpacing` through that table and sets
 * `allowFontScaling={false}`, so a 1.3 scale renders `bodyLarge` at 20.2 dp
 * instead of 20.8 dp and `displayLarge` at 57 dp instead of 74.1 dp.
 *
 * Layout numbers are dp, as React Native expects. The `fontSize`,
 * `lineHeight`, and `letterSpacing` props are sp tokens; do not pass the
 * converted values back in.
 */
export function Text({
  children,
  variant = 'bodyLarge',
  emphasized = false,
  fontSize,
  lineHeight,
  letterSpacing,
  color,
  align,
  fontScaleMode = 'compose',
  style,
  ...rest
}: TextProps) {
  const theme = useM3Theme();
  const contentColor = useContentColor();
  const { direction } = useLayoutDirection();
  const fontScale = useFontScale();
  const role = emphasized ? `${variant}Emphasized` : variant;
  const token = theme.typography[role as keyof typeof theme.typography];

  const baseFontSize = fontSize ?? token.fontSize;
  const baseLineHeight = lineHeight ?? token.lineHeight;
  const baseLetterSpacing = letterSpacing ?? token.letterSpacing;

  const scaled = useMemo(() => {
    if (fontScaleMode === 'linear') {
      return {
        fontSize: baseFontSize,
        lineHeight: baseLineHeight,
        letterSpacing: baseLetterSpacing,
      };
    }
    const scale = fontScaleMode === 'none' ? 1 : fontScale;
    return {
      fontSize: composeFontScale(baseFontSize, scale),
      lineHeight: composeLineHeight(baseLineHeight, baseFontSize, scale),
      letterSpacing: composeFontScale(baseLetterSpacing, scale),
    };
  }, [baseFontSize, baseLetterSpacing, baseLineHeight, fontScale, fontScaleMode]);

  const computed: TextStyle = {
    fontSize: scaled.fontSize,
    lineHeight: scaled.lineHeight,
    letterSpacing: scaled.letterSpacing,
    fontFamily: token.fontFamily,
    fontVariationSettings: token.fontVariationSettings,
    fontWeight: token.fontWeight,
    includeFontPadding: token.includeFontPadding,
    color: color ?? contentColor,
    textAlign: resolveAlign(align, direction),
  };

  return (
    <RNText {...rest} allowFontScaling={fontScaleMode === 'linear'} style={[computed, style]}>
      {children}
    </RNText>
  );
}
