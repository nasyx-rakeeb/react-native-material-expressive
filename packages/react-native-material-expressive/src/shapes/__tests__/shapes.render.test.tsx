import React from 'react';
import { Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

// PathCanvas imports Reanimated, whose native worklets runtime is not present
// in Jest. These tests assert the renderer-boundary contract (geometry, size,
// colour, children); the SVG output itself is covered by the Android diff.
jest.mock('react-native-reanimated', () => ({
  isSharedValue: (value: unknown) =>
    typeof value === 'object' && value !== null && 'value' in (value as object),
  useDerivedValue: (factory: () => unknown) => ({ value: factory() }),
  useAnimatedProps: (factory: () => unknown) => factory(),
  createAnimatedComponent: (component: unknown) => component,
  default: { createAnimatedComponent: (component: unknown) => component },
}));
jest.mock('../PathCanvas', () => ({
  PathCanvas: (props: Record<string, unknown>) =>
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('react').createElement('PathCanvas', props),
}));

import { MaterialShapes } from '../MaterialShapes';
import { MorphingShape } from '../MorphingShape';
import { Shape } from '../Shape';
import { ShapeContainer } from '../ShapeContainer';

function canvases(tree: TestRenderer.ReactTestRenderer) {
  return tree.root.findAll((node) => node.type === ('PathCanvas' as never));
}

describe('Shape rendering', () => {
  it('passes resolved geometry, size and colour to the renderer boundary', () => {
    let tree: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <Shape shape={MaterialShapes.Arch} size={64} color="#6750A4" testID="shape" />,
      );
    });
    const [canvas] = canvases(tree!);
    expect(canvas).toBeDefined();
    expect(canvas!.props).toMatchObject({
      width: 64,
      height: 64,
      color: '#6750A4',
      testID: 'shape',
    });
    expect(Array.isArray(canvas!.props.geometry)).toBe(true);
    expect(canvas!.props.geometry.length).toBeGreaterThan(0);
    expect(canvas!.props.geometry.every((value: number) => Number.isFinite(value))).toBe(true);
  });

  it('defaults to 48 dp and black', () => {
    let tree: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(<Shape shape={MaterialShapes.Circle} />);
    });
    expect(canvases(tree!)[0]!.props).toMatchObject({ width: 48, height: 48, color: '#000000' });
  });
});

describe('MorphingShape rendering', () => {
  it('interpolates between the two shapes for a numeric progress', () => {
    let start: TestRenderer.ReactTestRenderer;
    let middle: TestRenderer.ReactTestRenderer;
    let end: TestRenderer.ReactTestRenderer;
    act(() => {
      start = TestRenderer.create(
        <MorphingShape from={MaterialShapes.Arch} to={MaterialShapes.Clover4Leaf} progress={0} />,
      );
      middle = TestRenderer.create(
        <MorphingShape from={MaterialShapes.Arch} to={MaterialShapes.Clover4Leaf} progress={0.5} />,
      );
      end = TestRenderer.create(
        <MorphingShape from={MaterialShapes.Arch} to={MaterialShapes.Clover4Leaf} progress={1} />,
      );
    });
    const startGeometry = canvases(start!)[0]!.props.geometry as number[];
    const middleGeometry = canvases(middle!)[0]!.props.geometry as number[];
    const endGeometry = canvases(end!)[0]!.props.geometry as number[];
    expect(middleGeometry).toHaveLength(startGeometry.length);
    expect(middleGeometry[0]).not.toBe(startGeometry[0]);
    expect(middleGeometry[0]).not.toBe(endGeometry[0]);
  });

  it('forwards the renderer props', () => {
    let tree: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <MorphingShape
          from={MaterialShapes.Arch}
          to={MaterialShapes.Clover4Leaf}
          progress={0.25}
          size={72}
          color="#123456"
          testID="morph"
        />,
      );
    });
    expect(canvases(tree!)[0]!.props).toMatchObject({
      width: 72,
      height: 72,
      color: '#123456',
      testID: 'morph',
    });
  });
});

describe('ShapeContainer rendering', () => {
  it('clips children through the renderer boundary without a fill', () => {
    let tree: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <ShapeContainer shape={MaterialShapes.Arch} decorative testID="clip">
          <Text>decorative</Text>
        </ShapeContainer>,
      );
    });
    const [canvas] = canvases(tree!);
    expect(canvas!.props).toMatchObject({ width: 48, height: 48, color: null, testID: 'clip' });
    expect(canvas!.props.children).toBeDefined();
  });

  it('supports a morphing clip', () => {
    let tree: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <ShapeContainer
          from={MaterialShapes.Arch}
          to={MaterialShapes.Clover4Leaf}
          progress={0.5}
          decorative
          size={96}
          color="#abcdef"
        >
          <Text>morphing</Text>
        </ShapeContainer>,
      );
    });
    expect(canvases(tree!)[0]!.props).toMatchObject({
      width: 96,
      height: 96,
      color: '#abcdef',
    });
  });
});
