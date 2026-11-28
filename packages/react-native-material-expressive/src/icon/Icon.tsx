import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useLayoutDirection } from '../layout';
import { useM3Theme } from '../theme';
import { PathIconCanvas } from '../shapes/PathCanvas';
import { INTERNAL_ICON_PATHS, type InternalIconName } from './paths';

interface IconBaseProps {
  /** Square size in dp. Default 24. Does not scale with font scale. */
  size?: number;
  /** Tint. Defaults to the theme `onSurface` role. */
  color?: string;
  /**
   * Mirror directional glyphs (arrows, chevrons, back/forward) in RTL.
   * Never set this for logos, media controls, or checkmarks.
   */
  mirror?: boolean;
  fillRule?: 'nonzero' | 'evenodd';
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** TalkBack/VoiceOver label. Omit for decorative icons. */
  accessibilityLabel?: string;
}

export type IconProps = IconBaseProps &
  (
    | {
        /** A bundled internal path icon. */
        name: InternalIconName;
        path?: never;
        viewBox?: never;
      }
    | {
        /** Custom SVG path data in a 24×24 (or supplied) viewBox. */
        path: string | readonly string[];
        name?: never;
        viewBox?: string;
      }
  );

/**
 * An icon drawn from SVG path data, not a font.
 *
 * The path registry is a small core set derived from Google Material Icons
 * (Apache-2.0). It is the fallback when an app does not bundle the Material
 * Symbols font. Use `MaterialSymbol` for the full variable-font set.
 *
 * Rendering goes through `PathIconCanvas`; no icon file imports a renderer
 * directly (ADR-002 / U-29 follow-up).
 */
export function Icon({
  name,
  path,
  viewBox,
  size = 24,
  color,
  mirror = false,
  fillRule = 'nonzero',
  style,
  testID,
  accessibilityLabel,
}: IconProps) {
  const theme = useM3Theme();
  const { direction } = useLayoutDirection();
  const tint = color ?? theme.colorScheme.onSurface;
  const paths = path === undefined ? INTERNAL_ICON_PATHS[name as InternalIconName] : path;
  const pathList = typeof paths === 'string' ? [paths] : paths;
  const mirrorStyle =
    mirror && direction === 'rtl' ? { transform: [{ scaleX: -1 as const }] } : null;

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityLabel === undefined ? undefined : 'image'}
      accessible={accessibilityLabel !== undefined}
      importantForAccessibility={accessibilityLabel === undefined ? 'no' : 'yes'}
      pointerEvents="none"
      style={[{ width: size, height: size }, mirrorStyle, style]}
      testID={testID}
    >
      <PathIconCanvas
        color={tint}
        fillRule={fillRule}
        paths={pathList}
        size={size}
        viewBox={viewBox}
      />
    </View>
  );
}
