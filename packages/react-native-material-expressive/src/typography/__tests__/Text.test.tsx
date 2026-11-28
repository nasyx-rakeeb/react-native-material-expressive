import React from 'react';
import { Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { defaultTypography } from '../createTypography';
import { ContentColorProvider } from '../ContentColor';
import { Text } from '../Text';

let mockFontScale = 1;

jest.mock('../useFontScale', () => ({
  useFontScale: () => mockFontScale,
}));

function flatten(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) {
    return Object.assign({}, ...style.map(flatten));
  }
  return (style ?? {}) as Record<string, unknown>;
}

function renderText(element: React.ReactElement): Record<string, unknown> {
  let tree: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(element);
  });
  const node = tree!.root.findByType(RNText);
  return flatten(node.props.style);
}

describe('Text', () => {
  beforeEach(() => {
    mockFontScale = 1;
  });

  it('uses bodyLarge by default and disables RN linear scaling', () => {
    const style = renderText(<Text>Hello</Text>);
    expect(style.fontSize).toBe(16);
    expect(style.lineHeight).toBe(24);
    expect(style.letterSpacing).toBe(0.5);
    expect(style.includeFontPadding).toBe(false);
    expect(style.color).toBe('#1D1B20');
  });

  it('uses Compose non-linear scaling at 1.3', () => {
    mockFontScale = 1.3;
    const style = renderText(<Text>Hello</Text>);
    expect(style.fontSize).toBeCloseTo(20.2, 6);
    expect(style.lineHeight).toBeCloseTo(30.3, 6);
    expect(style.letterSpacing).toBeCloseTo(0.65, 6);
  });

  it('uses the Compose displayLarge table value, not linear scaling', () => {
    mockFontScale = 1.3;
    const style = renderText(<Text variant="displayLarge">Hello</Text>);
    expect(style.fontSize).toBe(57);
    expect(style.lineHeight).toBeCloseTo(67.032, 6);
  });

  it('keeps RN linear scaling when requested', () => {
    mockFontScale = 1.3;
    let tree: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(<Text fontScaleMode="linear">Hello</Text>);
    });
    const node = tree!.root.findByType(RNText);
    expect(node.props.allowFontScaling).toBe(true);
    const style = flatten(node.props.style);
    expect(style.fontSize).toBe(16);
    expect(style.lineHeight).toBe(24);
  });

  it('can ignore the platform scale for measurement scenes', () => {
    mockFontScale = 1.3;
    let tree: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(<Text fontScaleMode="none">Hello</Text>);
    });
    const node = tree!.root.findByType(RNText);
    expect(node.props.allowFontScaling).toBe(false);
    const style = flatten(node.props.style);
    expect(style.fontSize).toBe(16);
  });

  it('opts into emphasized styles explicitly', () => {
    const style = renderText(
      <Text emphasized variant="bodyLarge">
        Hello
      </Text>,
    );
    expect(style.fontWeight).toBe('500');
    expect(style.letterSpacing).toBe(0.15);
    expect(style.fontSize).toBe(16);
    expect(defaultTypography.bodyLargeEmphasized.fontWeight).toBe('500');
  });

  it('inherits the nearest content colour', () => {
    const style = renderText(
      <ContentColorProvider color="#123456">
        <Text>Hello</Text>
      </ContentColorProvider>,
    );
    expect(style.color).toBe('#123456');
  });

  it('lets an explicit colour win over the content colour', () => {
    const style = renderText(
      <ContentColorProvider color="#123456">
        <Text color="#ABCDEF">Hello</Text>
      </ContentColorProvider>,
    );
    expect(style.color).toBe('#ABCDEF');
  });

  it('supports explicit sp overrides and converts them', () => {
    mockFontScale = 1.3;
    const style = renderText(
      <Text fontSize={20} lineHeight={28} letterSpacing={1}>
        Hello
      </Text>,
    );
    expect(style.fontSize).toBeCloseTo(23.6, 6);
    expect(style.lineHeight).toBeCloseTo(33.04, 6);
    expect(style.letterSpacing).toBeCloseTo(1.3, 6);
  });

  it('resolves start/end alignment through the layout direction', () => {
    expect(renderText(<Text align="end">Hello</Text>).textAlign).toBe('right');
    expect(renderText(<Text align="start">Hello</Text>).textAlign).toBe('left');
  });

  it('passes through RN text props and style overrides', () => {
    let tree: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <Text numberOfLines={2} style={{ marginTop: 4 }} testID="label">
          Hello
        </Text>,
      );
    });
    const node = tree!.root.findByType(RNText);
    expect(node.props.numberOfLines).toBe(2);
    expect(node.props.testID).toBe('label');
    expect(flatten(node.props.style).marginTop).toBe(4);
  });
});
