import React from 'react';
import { Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { expressiveLightColorScheme } from '../../color/defaultSchemes';
import { Surface } from '../../elevation/Surface';
import { Text } from '../../typography/Text';
import { M3Provider } from '../M3Provider';
import {
  useM3ContentColor,
  useM3LayoutDirection,
  useM3MotionScheme,
  useM3ReduceMotion,
  useM3WindowSizeClass,
} from '../M3Provider';
import { useM3Theme } from '../M3ThemeProvider';

jest.mock('../../motion/reduceMotionStore', () => {
  const snapshot = { enabled: true, ready: true };
  return {
    subscribeReduceMotion: () => () => {},
    getReduceMotionSnapshot: () => snapshot,
    getReduceMotionServerSnapshot: () => snapshot,
  };
});

function flatten(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) {
    return Object.assign({}, ...style.map(flatten));
  }
  return (style ?? {}) as Record<string, unknown>;
}

function Probe() {
  const theme = useM3Theme();
  const windowSize = useM3WindowSizeClass();
  const layout = useM3LayoutDirection();
  const reduceMotion = useM3ReduceMotion();
  const motion = useM3MotionScheme();
  const contentColor = useM3ContentColor();
  return (
    <RNText testID="probe" style={{ color: theme.colorScheme.primary }}>
      {`${windowSize.widthSizeClass}/${windowSize.heightSizeClass}/${layout.direction}/${String(
        reduceMotion,
      )}/${motion.name}/${contentColor}/${theme.isDark}`}
    </RNText>
  );
}

function readProbe(element: React.ReactElement): string {
  let tree: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(element);
  });
  return tree!.root.findByProps({ testID: 'probe' }).props.children as string;
}

describe('M3Provider', () => {
  it('provides theme, window size class, direction, motion and reduce-motion', () => {
    const value = readProbe(
      <M3Provider layoutDirection="rtl" reduceMotion windowSize={{ width: 900, height: 1000 }}>
        <Probe />
      </M3Provider>,
    );
    expect(value).toContain('expanded/expanded/rtl/true/expressive');
  });

  it('uses compact classes for a small window', () => {
    const value = readProbe(
      <M3Provider windowSize={{ width: 400, height: 500 }}>
        <Probe />
      </M3Provider>,
    );
    expect(value).toContain('compact/medium/ltr/true');
  });

  it('honours a supported-class restriction', () => {
    const value = readProbe(
      <M3Provider
        supportedWidthSizeClasses={['medium', 'expanded']}
        windowSize={{ width: 400, height: 500 }}
      >
        <Probe />
      </M3Provider>,
    );
    expect(value).toContain('medium/medium');
  });

  it('applies theme options', () => {
    const value = readProbe(
      <M3Provider mode="dark" windowSize={{ width: 400, height: 500 }}>
        <Probe />
      </M3Provider>,
    );
    expect(value).toContain('/true');
  });

  it('provides onPrimary for a primary Surface and inherits custom content colour', () => {
    const scheme = expressiveLightColorScheme();
    let tree: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <M3Provider windowSize={{ width: 400, height: 500 }}>
          <Surface color={scheme.primary}>
            <Text testID="on-primary">primary</Text>
          </Surface>
          <Surface color="#123456">
            <Text testID="custom">custom</Text>
          </Surface>
        </M3Provider>,
      );
    });
    const textNodes = tree!.root.findAllByType(RNText);
    const primary = flatten(
      textNodes.find((node) => node.props.testID === 'on-primary')!.props.style,
    );
    const custom = flatten(textNodes.find((node) => node.props.testID === 'custom')!.props.style);
    expect(primary.color).toBe(scheme.onPrimary);
    expect(custom.color).toBe(scheme.onSurface);
  });
});
