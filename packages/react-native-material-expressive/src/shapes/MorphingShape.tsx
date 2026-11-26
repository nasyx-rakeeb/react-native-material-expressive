/**
 * Animated Material shape morph primitive. This file is original project code
 * (MIT).
 */

import { useMemo } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { isSharedValue, useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { PathCanvas } from './PathCanvas';
import { interpolateGeometry, type PathGeometry } from './pathGeometry';
import { resolveMorphEndpoints, type MorphEndpoints, type ShapeSource } from './shapeSource';

export interface MorphingShapeProps {
  /** Start shape: a `MaterialShapes` name or a `RoundedPolygon`. */
  from: ShapeSource;
  /** End shape: a `MaterialShapes` name or a `RoundedPolygon`. */
  to: ShapeSource;
  /**
   * Morph progress. `0` is `from`, `1` is `to`. Values outside `[0, 1]`
   * extrapolate, matching Compose `Morph.asCubics`; spring overshoot is
   * intentionally preserved.
   */
  progress: number | SharedValue<number>;
  /** Rendered square size in dp. */
  size?: number;
  /** Fill colour. */
  color?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

function StaticMorph({
  endpoints,
  progress,
  size,
  color,
  style,
  testID,
}: {
  endpoints: MorphEndpoints;
  progress: number;
  size: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const geometry = useMemo(
    () => interpolateGeometry(endpoints.start, endpoints.end, progress),
    [endpoints, progress],
  );
  return (
    <PathCanvas
      geometry={geometry}
      width={size}
      height={size}
      color={color}
      style={style}
      testID={testID}
    />
  );
}

function AnimatedMorph({
  endpoints,
  progress,
  size,
  color,
  style,
  testID,
}: {
  endpoints: MorphEndpoints;
  progress: SharedValue<number>;
  size: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const geometry = useDerivedValue<PathGeometry>(() =>
    interpolateGeometry(endpoints.start, endpoints.end, progress.value),
  );
  return (
    <PathCanvas
      geometry={geometry}
      width={size}
      height={size}
      color={color}
      style={style}
      testID={testID}
    />
  );
}

/** Morphs between two Material shapes, driven by a number or a shared value. */
export function MorphingShape({
  from,
  to,
  progress,
  size = 48,
  color = '#000000',
  style,
  testID,
}: MorphingShapeProps) {
  const endpoints = useMemo(() => resolveMorphEndpoints(from, to), [from, to]);

  if (isSharedValue<number>(progress)) {
    return (
      <AnimatedMorph
        endpoints={endpoints}
        progress={progress}
        size={size}
        color={color}
        style={style}
        testID={testID}
      />
    );
  }

  return (
    <StaticMorph
      endpoints={endpoints}
      progress={progress}
      size={size}
      color={color}
      style={style}
      testID={testID}
    />
  );
}
