/**
 * Clips arbitrary React Native content to a Material shape. This file is
 * original project code (MIT).
 *
 * The clip is rendered through an SVG `foreignObject`. It is visual clipping
 * only: touch targets remain rectangular and are not clipped to the path.
 */

import { useMemo, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { isSharedValue, useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { PathCanvas } from './PathCanvas';
import { interpolateGeometry, type PathGeometry } from './pathGeometry';
import { resolveMorphEndpoints, resolveShapeGeometry, type ShapeSource } from './shapeSource';

interface ShapeContainerBaseProps {
  /** Rendered square size in dp. */
  size?: number;
  /** Optional fill drawn behind the clipped content. */
  color?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  testID?: string;
}

export type ShapeContainerProps =
  | (ShapeContainerBaseProps & {
      /** Shape to clip the children to. */
      shape: ShapeSource;
    })
  | (ShapeContainerBaseProps & {
      /** Start shape of a morphing clip. */
      from: ShapeSource;
      /** End shape of a morphing clip. */
      to: ShapeSource;
      /** Morph progress, `0` = `from`, `1` = `to`. */
      progress: number | SharedValue<number>;
    });

function StaticShapeContainer({
  shape,
  size,
  color,
  style,
  children,
  testID,
}: ShapeContainerBaseProps & { shape: ShapeSource }) {
  const geometry = useMemo(() => resolveShapeGeometry(shape), [shape]);
  return (
    <PathCanvas
      geometry={geometry}
      width={size ?? 48}
      height={size ?? 48}
      color={color ?? null}
      style={style}
      testID={testID}
    >
      {children}
    </PathCanvas>
  );
}

function StaticMorphContainer({
  endpoints,
  progress,
  size,
  color,
  style,
  children,
  testID,
}: ShapeContainerBaseProps & {
  endpoints: ReturnType<typeof resolveMorphEndpoints>;
  progress: number;
}) {
  const geometry = useMemo(
    () => interpolateGeometry(endpoints.start, endpoints.end, progress),
    [endpoints, progress],
  );
  return (
    <PathCanvas
      geometry={geometry}
      width={size ?? 48}
      height={size ?? 48}
      color={color ?? null}
      style={style}
      testID={testID}
    >
      {children}
    </PathCanvas>
  );
}

function AnimatedMorphContainer({
  endpoints,
  progress,
  size,
  color,
  style,
  children,
  testID,
}: ShapeContainerBaseProps & {
  endpoints: ReturnType<typeof resolveMorphEndpoints>;
  progress: SharedValue<number>;
}) {
  const geometry = useDerivedValue<PathGeometry>(() =>
    interpolateGeometry(endpoints.start, endpoints.end, progress.value),
  );
  return (
    <PathCanvas
      geometry={geometry}
      width={size ?? 48}
      height={size ?? 48}
      color={color ?? null}
      style={style}
      testID={testID}
    >
      {children}
    </PathCanvas>
  );
}

function MorphingShapeContainer({
  from,
  to,
  progress,
  size,
  color,
  style,
  children,
  testID,
}: ShapeContainerBaseProps & {
  from: ShapeSource;
  to: ShapeSource;
  progress: number | SharedValue<number>;
}) {
  const endpoints = useMemo(() => resolveMorphEndpoints(from, to), [from, to]);

  if (isSharedValue<number>(progress)) {
    return (
      <AnimatedMorphContainer
        endpoints={endpoints}
        progress={progress}
        size={size}
        color={color}
        style={style}
        testID={testID}
      >
        {children}
      </AnimatedMorphContainer>
    );
  }

  return (
    <StaticMorphContainer
      endpoints={endpoints}
      progress={progress}
      size={size}
      color={color}
      style={style}
      testID={testID}
    >
      {children}
    </StaticMorphContainer>
  );
}

/** Clips children to a static or morphing Material shape. */
export function ShapeContainer(props: ShapeContainerProps) {
  if ('shape' in props) {
    return <StaticShapeContainer {...props} />;
  }
  return <MorphingShapeContainer {...props} />;
}
