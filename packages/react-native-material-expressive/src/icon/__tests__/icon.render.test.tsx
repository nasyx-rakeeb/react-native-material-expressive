import React from 'react';
import { Text, View } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

// PathCanvas imports Reanimated, whose native worklets runtime is not present
// in Jest. The icon unit test only needs the renderer boundary contract; the
// real SVG output is covered by the Android pixel diff.
jest.mock('../../shapes/PathCanvas', () => ({
  PathIconCanvas: (props: Record<string, unknown>) =>
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('react').createElement('PathIconCanvas', props),
}));

import { Icon } from '../Icon';
import { MaterialSymbol } from '../MaterialSymbol';
import { MATERIAL_SYMBOLS_FONT_FAMILY } from '../materialSymbols';

function flatten(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) {
    return Object.assign({}, ...style.map(flatten));
  }
  return (style ?? {}) as Record<string, unknown>;
}

describe('MaterialSymbol rendering', () => {
  it('renders the glyph at a fixed dp size and does not scale with font scale', () => {
    let tree: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(<MaterialSymbol name="check" size={20} testID="symbol" />);
    });
    const wrapper = tree!.root.findAllByType(View).find((node) => node.props.testID === 'symbol')!;
    const text = wrapper.findByType(Text);
    const style = flatten(text.props.style);
    expect(text.props.children).toBe('\ue668');
    expect(text.props.numberOfLines).toBe(1);
    expect(text.props.allowFontScaling).toBe(false);
    expect(style.fontFamily).toBe(MATERIAL_SYMBOLS_FONT_FAMILY);
    expect(style.fontSize).toBe(20);
    expect(style.lineHeight).toBe(20);
    expect(style.width).toBe(20);
    expect(style.height).toBe(20);
    // Compose LineHeightStyle.Center parity: the 1.2em font line box is
    // centred inside the 1em line height, so paint moves down by 0.1em.
    expect(style.transform).toEqual([{ translateY: 2 }]);
    // Compose clips the glyph to the 1em text box; RN needs an explicit clip
    // because a shifted, heavy glyph can paint a few physical pixels below it.
    expect(flatten(wrapper.props.style)).toMatchObject({
      width: 20,
      height: 20,
      overflow: 'hidden',
    });
  });

  it('labels an informative icon and hides a decorative one', () => {
    let informative: TestRenderer.ReactTestRenderer;
    let decorative: TestRenderer.ReactTestRenderer;
    act(() => {
      informative = TestRenderer.create(<MaterialSymbol accessibilityLabel="Done" name="check" />);
      decorative = TestRenderer.create(<MaterialSymbol name="check" />);
    });
    const labelled = informative!.root
      .findAllByType(Text)
      .find((node) => node.props.accessibilityLabel === 'Done')!;
    expect(labelled.props.accessibilityRole).toBe('image');
    expect(labelled.props.accessible).toBe(true);
    const hidden = decorative!.root
      .findAllByType(Text)
      .find((node) => node.props.importantForAccessibility === 'no')!;
    expect(hidden.props.accessible).toBe(false);
  });
});

describe('Icon rendering', () => {
  it('renders internal path data through the renderer boundary', () => {
    let tree: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(<Icon name="check" size={32} testID="icon" />);
    });
    const wrapper = tree!.root.findAllByType(View).find((node) => node.props.testID === 'icon')!;
    expect(flatten(wrapper.props.style)).toMatchObject({ width: 32, height: 32 });
    const svg = tree!.root.findAll((node) => (node.type as unknown as string) === 'PathIconCanvas');
    expect(svg.length).toBe(1);
    expect(svg[0]!.props.paths[0]).toMatch(/^M/);
  });

  it('accepts custom path data', () => {
    let tree: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(<Icon path="M0 0h24v24H0z" />);
    });
    const svg = tree!.root.findAll((node) => (node.type as unknown as string) === 'PathIconCanvas');
    expect(svg[0]!.props.paths).toEqual(['M0 0h24v24H0z']);
  });
});
