import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { Interactive } from '../Interactive';

/**
 * The 48 dp minimum is a touch target, not a layout size. This renders the
 * primitive and proves the visible 24×24 style is unchanged while the hit
 * region grows to 48×48.
 */
describe('Interactive touch target rendering', () => {
  it('grows hitSlop to 48 dp without changing the 24 dp visual', () => {
    let tree: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <Interactive style={{ width: 24, height: 24 }} testID="target">
          {null}
        </Interactive>,
      );
    });

    const host = tree!.root.findAll(
      (node) => node.props != null && node.props.hitSlop !== undefined,
    )[0]!;
    // Before layout the visual size is unknown, so the safe minimum is applied.
    expect(host.props.hitSlop).toEqual({ top: 24, right: 24, bottom: 24, left: 24 });

    act(() => {
      host.props.onLayout({
        nativeEvent: { layout: { x: 0, y: 0, width: 24, height: 24 } },
      });
    });

    const laidOut = tree!.root.findAll(
      (node) => node.props != null && node.props.hitSlop !== undefined,
    )[0]!;
    expect(laidOut.props.hitSlop).toEqual({ top: 12, right: 12, bottom: 12, left: 12 });
    expect(24 + laidOut.props.hitSlop.left + laidOut.props.hitSlop.right).toBe(48);
    expect(24 + laidOut.props.hitSlop.top + laidOut.props.hitSlop.bottom).toBe(48);

    // `hitSlop` never reaches layout: the visible style is exactly 24×24.
    const json = tree!.toJSON();
    if (json === null || Array.isArray(json)) {
      throw new Error('expected a single root node');
    }
    const style = Array.isArray(json.props.style)
      ? Object.assign({}, ...json.props.style)
      : json.props.style;
    expect(style).toMatchObject({ width: 24, height: 24 });
    expect(style.width).toBe(24);
    expect(style.height).toBe(24);
  });
});
