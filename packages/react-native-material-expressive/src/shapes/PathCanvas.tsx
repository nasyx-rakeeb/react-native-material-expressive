/**
 * The single renderer boundary for path-based drawing.
 *
 * Every shape primitive goes through this file. Only `PathCanvas` imports
 * `react-native-svg`; swapping renderers (ADR-002) is a change here, not in the
 * components. This file is original project code (MIT).
 */

import { useId, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  isSharedValue,
  useAnimatedProps,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { ClipPath, Defs, ForeignObject, G, Path } from 'react-native-svg';

import { geometryToSvgPath, type PathGeometry } from './pathGeometry';

/** A static geometry, or a shared value updated on the UI thread. */
export type PathGeometrySource = PathGeometry | SharedValue<PathGeometry>;

export interface PathCanvasProps {
  /** Normalised unit-square path geometry. */
  geometry: PathGeometrySource;
  /** Rendered width in dp. Geometry x coordinates are multiplied by this. */
  width: number;
  /** Rendered height in dp. Geometry y coordinates are multiplied by this. */
  height: number;
  /** Fill colour. Pass `null` for no fill (for example a clip-only container). */
  color?: string | null;
  style?: StyleProp<ViewStyle>;
  /**
   * Content clipped to the path. Rendered through an SVG `foreignObject`, so it
   * is visual clipping only: touches are not clipped to the path.
   */
  children?: ReactNode;
  testID?: string;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

function StaticPathLayer({
  geometry,
  width,
  height,
  color,
}: {
  geometry: PathGeometry;
  width: number;
  height: number;
  color: string;
}) {
  return <Path d={geometryToSvgPath(geometry, width, height)} fill={color} />;
}

function AnimatedPathLayer({
  geometry,
  width,
  height,
  color,
}: {
  geometry: SharedValue<PathGeometry>;
  width: number;
  height: number;
  color: string;
}) {
  const animatedProps = useAnimatedProps(() => ({
    d: geometryToSvgPath(geometry.value, width, height),
  }));
  return <AnimatedPath animatedProps={animatedProps} fill={color} />;
}

function PathLayer({
  geometry,
  width,
  height,
  color,
}: {
  geometry: PathGeometrySource;
  width: number;
  height: number;
  color: string;
}) {
  if (isSharedValue<PathGeometry>(geometry)) {
    return <AnimatedPathLayer geometry={geometry} width={width} height={height} color={color} />;
  }
  return <StaticPathLayer geometry={geometry} width={width} height={height} color={color} />;
}

/**
 * Renders a path on an SVG canvas and optionally clips children to it.
 *
 * This is the only file allowed to import a path renderer (ADR-003). The
 * renderer decision lives in ADR-002.
 */
export function PathCanvas({
  geometry,
  width,
  height,
  color = '#000000',
  style,
  children,
  testID,
}: PathCanvasProps) {
  const rawId = useId();
  const clipId = `m3e-clip-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  if (children === undefined || children === null) {
    return (
      <Svg width={width} height={height} style={style} testID={testID}>
        <PathLayer geometry={geometry} width={width} height={height} color={color ?? 'none'} />
      </Svg>
    );
  }

  return (
    <Svg width={width} height={height} style={style} testID={testID}>
      <Defs>
        <ClipPath id={clipId}>
          <PathLayer geometry={geometry} width={width} height={height} color={color ?? 'none'} />
        </ClipPath>
      </Defs>
      {color === null ? null : (
        <PathLayer geometry={geometry} width={width} height={height} color={color} />
      )}
      <G clipPath={`url(#${clipId})`}>
        <ForeignObject x={0} y={0} width={width} height={height}>
          <View collapsable={false} style={{ width, height }}>
            {children}
          </View>
        </ForeignObject>
      </G>
    </Svg>
  );
}
