import { PixelRatio, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useLayoutDirection } from '../layout';
import { useContentColor } from '../typography/ContentColor';
import {
  MATERIAL_SYMBOLS_FONT_FAMILY,
  materialSymbolCodepoints,
  type MaterialSymbolName,
} from './materialSymbols';
import { resolveMaterialSymbolAxes, type MaterialSymbolAxes } from './variationSettings';

export interface MaterialSymbolProps extends MaterialSymbolAxes {
  /** A glyph present in the bundled subset (`src/icon/materialSymbols.ts`). */
  name: MaterialSymbolName;
  /** Square size in dp. Default 24. Does not scale with font scale. */
  size?: number;
  /** Tint. Defaults to the nearest content colour (`onSurface` at the root). */
  color?: string;
  /**
   * Mirror directional glyphs (arrows, chevrons, back/forward) in RTL.
   * Never set this for logos, media controls, or checkmarks.
   */
  mirror?: boolean;
  /** Override the registered font family. */
  fontFamily?: string;
  /** Layout style for the icon box (position, margin, opacity). */
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** TalkBack/VoiceOver label. Omit for decorative icons. */
  accessibilityLabel?: string;
}

/**
 * A Material Symbols Outlined glyph rendered with the variable font.
 *
 * All four axes (`FILL`, `wght`, `GRAD`, `opsz`) are passed through
 * `fontVariationSettings`. On platforms that cannot apply variable axes
 * (Android < API 26) the glyph renders at the font's default instance and the
 * component does not pretend the axes were applied.
 *
 * The font must be registered by the app under
 * `MaterialSymbolsOutlined` (the bundled subset is in
 * `assets/fonts/MaterialSymbolsOutlined.ttf`). Icons that must work without a
 * font asset should use `Icon` with internal path data instead.
 */
export function MaterialSymbol({
  name,
  size = 24,
  color,
  fill,
  weight,
  grade,
  opticalSize,
  mirror = false,
  fontFamily = MATERIAL_SYMBOLS_FONT_FAMILY,
  style,
  testID,
  accessibilityLabel,
}: MaterialSymbolProps) {
  const contentColor = useContentColor();
  const { direction } = useLayoutDirection();
  const axes = resolveMaterialSymbolAxes({ fill, weight, grade, opticalSize });
  const tint = color ?? contentColor;
  // The font's ascent/descent are 1.1em/0.1em (upm 960, hhea 1056/-96).
  // Compose centres that 1.2em line box inside the 1em `lineHeight`, which puts
  // the baseline at 1.0em. RN aligns the baseline at `lineHeight - descent`
  // (0.9em), so the glyph sits 0.1em high. Shift the paint down to match,
  // snapped to a whole physical pixel so glyph edges stay on the pixel grid.
  const baselineOffset = PixelRatio.roundToNearestPixel(size * 0.1);
  const transforms: Array<{ translateY: number } | { scaleX: number }> = [
    { translateY: baselineOffset },
  ];
  if (mirror && direction === 'rtl') {
    transforms.push({ scaleX: -1 });
  }

  return (
    <View style={[{ width: size, height: size, overflow: 'hidden' }, style]} testID={testID}>
      <Text
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityLabel === undefined ? undefined : 'image'}
        accessible={accessibilityLabel !== undefined}
        allowFontScaling={false}
        importantForAccessibility={accessibilityLabel === undefined ? 'no' : 'yes'}
        numberOfLines={1}
        selectable={false}
        suppressHighlighting
        style={[
          {
            width: size,
            height: size,
            fontFamily,
            fontSize: size,
            lineHeight: size,
            color: tint,
            textAlign: 'center',
            textAlignVertical: 'center',
            includeFontPadding: false,
            ...(axes.applied ? { fontVariationSettings: axes.fontVariationSettings } : null),
            transform: transforms,
          },
        ]}
      >
        {materialSymbolCodepoints[name]}
      </Text>
    </View>
  );
}
