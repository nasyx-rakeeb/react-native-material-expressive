/**
 * Clips decorative React Native content to a Material shape. This file is
 * original project code (MIT).
 *
 * The clip is rendered through an SVG `foreignObject`. It is visual clipping
 * only: react-native-svg does not lay out the native subtree inside
 * `foreignObject`, so touch and accessibility hit-testing do not work there.
 * `ShapeContainer` is therefore **decorative/non-interactive only** (ADR-017,
 * `U-32`). Interactive content belongs in a `borderRadius`-based container.
 */

import { isValidElement, useEffect, useMemo, type ReactNode } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  SectionList,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
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
  /**
   * Required acknowledgment that the clipped content is decorative. The
   * `foreignObject` subtree is not reachable by touch or assistive technology
   * (`U-32`, ADR-017). Use a `borderRadius`-based container for anything
   * interactive.
   */
  decorative: true;
  /**
   * Decorative content only. Plain text and images are fine; buttons, links,
   * inputs and other focusable content are not.
   */
  children?: ReactNode;
  testID?: string;
}

type ShapeContainerLayoutProps = Omit<ShapeContainerBaseProps, 'decorative'>;

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

const INTERACTIVE_COMPONENTS = new Set<unknown>([
  FlatList,
  Pressable,
  ScrollView,
  SectionList,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback,
]);

function componentName(type: unknown): string {
  if (typeof type === 'string') {
    return type;
  }
  const named = type as { displayName?: string; name?: string } | null;
  return named?.displayName ?? named?.name ?? 'element';
}

function findInteractive(node: ReactNode, depth = 0): string | null {
  if (depth > 12 || node === null || node === undefined || typeof node === 'boolean') {
    return null;
  }
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findInteractive(child, depth + 1);
      if (found !== null) {
        return found;
      }
    }
    return null;
  }
  if (!isValidElement(node)) {
    return null;
  }
  const props = node.props as Record<string, unknown>;
  if (
    typeof props.onPress === 'function' ||
    typeof props.onLongPress === 'function' ||
    typeof props.onPressIn === 'function' ||
    typeof props.onPressOut === 'function' ||
    typeof props.onAccessibilityTap === 'function' ||
    props.accessible === true ||
    typeof props.accessibilityRole === 'string' ||
    INTERACTIVE_COMPONENTS.has(node.type)
  ) {
    return componentName(node.type);
  }
  return findInteractive(props.children as ReactNode, depth + 1);
}

let warnedAboutInteractiveChildren = false;

function useDecorativeChildrenWarning(children: ReactNode) {
  useEffect(() => {
    if (!__DEV__ || warnedAboutInteractiveChildren) {
      return;
    }
    const found = findInteractive(children);
    if (found !== null) {
      warnedAboutInteractiveChildren = true;
      console.warn(
        `[M3E] ShapeContainer is decorative-only: <${found}> inside it is not reachable by ` +
          'touch or screen readers (U-32, ADR-017). Use a borderRadius-based container for ' +
          'interactive content.',
      );
    }
  }, [children]);
}

function StaticShapeContainer({
  shape,
  size,
  color,
  style,
  children,
  testID,
}: ShapeContainerLayoutProps & { shape: ShapeSource }) {
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
}: ShapeContainerLayoutProps & {
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
}: ShapeContainerLayoutProps & {
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
}: ShapeContainerLayoutProps & {
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

/**
 * Clips decorative children to a static or morphing Material shape.
 *
 * Interactive content is unsupported: the `foreignObject` subtree has no
 * layout, touch dispatch or accessibility bounds (`U-32`, ADR-017). The
 * required `decorative` prop makes that contract explicit at the call site,
 * and a development warning flags pressable/accessible children.
 */
export function ShapeContainer(props: ShapeContainerProps) {
  useDecorativeChildrenWarning(props.children);
  if (__DEV__ && props.decorative !== true) {
    console.error(
      '[M3E] ShapeContainer requires `decorative`. It is visual-only: interactive content ' +
        'inside it is unreachable (U-32, ADR-017). Use a borderRadius-based container instead.',
    );
  }
  if ('shape' in props) {
    return <StaticShapeContainer {...props} />;
  }
  return <MorphingShapeContainer {...props} />;
}
