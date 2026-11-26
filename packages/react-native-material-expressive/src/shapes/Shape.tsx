/**
 * Static Material shape primitive. This file is original project code (MIT).
 */

import { useMemo } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { PathCanvas } from './PathCanvas';
import { resolveShapeGeometry, type ShapeSource } from './shapeSource';

export interface ShapeProps {
  /** A `MaterialShapes` name or a caller-built `RoundedPolygon`. */
  shape: ShapeSource;
  /** Rendered square size in dp. */
  size?: number;
  /** Fill colour. */
  color?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Renders one Material 3 shape. */
export function Shape({ shape, size = 48, color = '#000000', style, testID }: ShapeProps) {
  const geometry = useMemo(() => resolveShapeGeometry(shape), [shape]);
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
