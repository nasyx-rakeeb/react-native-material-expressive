import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { useM3Theme } from '../theme';
import {
  elevationLevelToDp,
  elevationToIosShadow,
  resolveSurfaceColor,
  type ElevationLevel,
} from './elevation';

export interface SurfaceBorder {
  readonly color: string;
  readonly width: number;
}

export interface SurfaceProps {
  children?: ReactNode;
  /** Material elevation level 0–5; sets both tonal and shadow elevation. */
  level?: ElevationLevel;
  /** Tonal overlay elevation in dp. Overrides the `level` value. */
  tonalElevation?: number;
  /** Shadow elevation in dp. Overrides the `level` value. */
  shadowElevation?: number;
  /** Container colour. Defaults to the theme `surface` role. */
  color?: string;
  /** Corner radius in dp. */
  shape?: number;
  border?: SurfaceBorder;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * A Material surface with tonal elevation and a platform shadow.
 *
 * Tonal colour follows Compose exactly: the `surfaceTint` overlay is applied
 * only when the container colour equals `ColorScheme.surface`
 * (`ColorScheme.kt:1566-1572`), with
 * `alpha = ((4.5 * ln(elevation + 1)) + 2) / 100` (`ColorScheme.kt:1157-1160`).
 *
 * Android uses the native `elevation` RenderNode, which is the same model
 * Compose uses. iOS uses `elevationToIosShadow`, a documented approximation;
 * it is never claimed to be pixel-matched. Motion kind: **none** (elevation
 * is a static property in this primitive).
 */
export function Surface({
  children,
  level,
  tonalElevation,
  shadowElevation,
  color,
  shape = 0,
  border,
  style,
  testID,
}: SurfaceProps) {
  const theme = useM3Theme();
  const baseColor = color ?? theme.colorScheme.surface;
  const tonal = tonalElevation ?? (level === undefined ? 0 : elevationLevelToDp(level));
  const shadow = shadowElevation ?? (level === undefined ? 0 : elevationLevelToDp(level));

  const resolvedColor = resolveSurfaceColor(
    baseColor,
    theme.colorScheme.surface,
    theme.colorScheme.surfaceTint,
    tonal,
  );

  const shadowStyle: ViewStyle =
    shadow <= 0
      ? {}
      : Platform.OS === 'ios'
        ? elevationToIosShadow(shadow)
        : Platform.OS === 'android'
          ? { elevation: shadow }
          : { boxShadow: `0 ${Math.round(shadow / 2)}px ${shadow * 1.5}px rgba(0,0,0,0.2)` };

  return (
    <View
      style={[
        style,
        {
          backgroundColor: resolvedColor,
          borderRadius: shape,
          ...shadowStyle,
        },
      ]}
      testID={testID}
    >
      <View
        style={{
          flexGrow: 1,
          borderRadius: shape,
          borderWidth: border?.width ?? 0,
          borderColor: border?.color,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
    </View>
  );
}
