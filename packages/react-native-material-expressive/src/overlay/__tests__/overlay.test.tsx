import React from 'react';
import { BackHandler, Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { OverlayProvider } from '../OverlayProvider';
import { Portal } from '../Portal';
import { useOverlay, type UseOverlayResult } from '../useOverlay';
import { nextFocusIndex } from '../FocusTrap';
import { isEscapeEvent, keyboardAvoidingBehavior, mergeInsets } from '../platform';
import type { OverlayFocusManager, OverlayKeyEvent } from '../types';

function installBackHandlerSpy() {
  const handlers: Array<() => boolean> = [];
  const spy = jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, handler) => {
    handlers.push(handler as () => boolean);
    return { remove: () => {} } as never;
  });
  return {
    handlers,
    latest: () => handlers[handlers.length - 1]!,
    restore: () => spy.mockRestore(),
  };
}

function makeEscapeSource() {
  const handlers: Array<(event: OverlayKeyEvent) => void> = [];
  const source = (handler: (event: OverlayKeyEvent) => void) => {
    handlers.push(handler);
    return () => {};
  };
  return {
    source,
    fire: (event: OverlayKeyEvent) => {
      for (const handler of handlers) handler(event);
    },
  };
}

function renderProvider(
  children: React.ReactNode,
  props: Partial<React.ComponentProps<typeof OverlayProvider>> = {},
) {
  let tree: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<OverlayProvider {...props}>{children}</OverlayProvider>);
  });
  return tree!;
}

function Capture({ onReady }: { onReady: (api: UseOverlayResult) => void }) {
  const api = useOverlay();
  onReady(api);
  return null;
}

describe('OverlayProvider stacking', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('dismisses only the topmost overlay on Android back', () => {
    const back = installBackHandlerSpy();
    const aClose = jest.fn();
    const bClose = jest.fn();
    let api!: UseOverlayResult;
    const tree = renderProvider(<Capture onReady={(value) => (api = value)} />);

    act(() => {
      api.open(() => <Text testID="a">A</Text>, { onClose: aClose, testID: 'a' });
      api.open(() => <Text testID="b">B</Text>, { onClose: bClose, testID: 'b' });
    });

    expect(api.stack).toHaveLength(2);
    expect(back.latest()()).toBe(true);
    expect(bClose).toHaveBeenCalledTimes(1);
    expect(aClose).not.toHaveBeenCalled();
    expect(api.stack).toHaveLength(2);

    act(() => api.closeAll());
    expect(api.stack).toHaveLength(0);
    act(() => tree.unmount());
    back.restore();
  });

  it('removes the topmost overlay when it has no onClose handler', () => {
    const back = installBackHandlerSpy();
    let api!: UseOverlayResult;
    renderProvider(<Capture onReady={(value) => (api = value)} />);

    act(() => {
      api.open(() => <Text testID="a">A</Text>, { testID: 'a' });
      api.open(() => <Text testID="b">B</Text>, { testID: 'b' });
    });
    expect(api.stack).toHaveLength(2);
    act(() => {
      back.latest()();
    });
    expect(api.stack).toHaveLength(1);
    act(() => {
      back.latest()();
    });
    expect(api.stack).toHaveLength(0);
    back.restore();
  });

  it('consumes back on a non-dismissible overlay without closing it', () => {
    const back = installBackHandlerSpy();
    let api!: UseOverlayResult;
    renderProvider(<Capture onReady={(value) => (api = value)} />);
    act(() => {
      api.open(() => <Text testID="locked">Locked</Text>, { dismissible: false });
    });
    expect(back.latest()()).toBe(true);
    expect(api.stack).toHaveLength(1);
    back.restore();
  });

  it('dismisses only the topmost overlay on Escape', () => {
    const escape = makeEscapeSource();
    const aClose = jest.fn();
    const bClose = jest.fn();
    let api!: UseOverlayResult;
    renderProvider(<Capture onReady={(value) => (api = value)} />, {
      escapeSource: escape.source,
    });

    act(() => {
      api.open(() => <Text testID="a">A</Text>, { onClose: aClose, testID: 'a' });
      api.open(() => <Text testID="b">B</Text>, { onClose: bClose, testID: 'b' });
    });
    escape.fire({ key: 'Escape' });
    expect(bClose).toHaveBeenCalledTimes(1);
    expect(aClose).not.toHaveBeenCalled();
  });

  it('ignores Escape for a non-dismissible topmost overlay', () => {
    const escape = makeEscapeSource();
    const close = jest.fn();
    let api!: UseOverlayResult;
    renderProvider(<Capture onReady={(value) => (api = value)} />, {
      escapeSource: escape.source,
    });
    act(() => {
      api.open(() => <Text testID="locked">Locked</Text>, {
        dismissible: false,
        onClose: close,
      });
    });
    escape.fire({ key: 'Escape' });
    expect(close).not.toHaveBeenCalled();
    expect(api.stack).toHaveLength(1);
  });

  it('presses the top scrim without touching the one below', () => {
    const aClose = jest.fn();
    const bClose = jest.fn();
    let api!: UseOverlayResult;
    const tree = renderProvider(<Capture onReady={(value) => (api = value)} />);
    act(() => {
      api.open(() => <Text testID="a">A</Text>, { onClose: aClose, testID: 'a' });
      api.open(() => <Text testID="b">B</Text>, { onClose: bClose, testID: 'b' });
    });
    const scrimB = tree.root.findByProps({ testID: 'b-scrim' });
    act(() => scrimB.props.onPress());
    expect(bClose).toHaveBeenCalledTimes(1);
    expect(aClose).not.toHaveBeenCalled();

    act(() => api.close());
    const scrimA = tree.root.findByProps({ testID: 'a-scrim' });
    act(() => scrimA.props.onPress());
    expect(aClose).toHaveBeenCalledTimes(1);
  });
});

describe('OverlayProvider focus and accessibility', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('captures focus once and restores it when the stack empties', () => {
    const token = { platform: 'native' as const, value: {} };
    const manager: OverlayFocusManager = {
      capture: jest.fn(() => token),
      restore: jest.fn(),
    };
    let api!: UseOverlayResult;
    renderProvider(<Capture onReady={(value) => (api = value)} />, {
      focusManager: manager,
    });

    act(() => {
      api.open(() => <Text testID="a">A</Text>);
      api.open(() => <Text testID="b">B</Text>);
    });
    expect(manager.capture).toHaveBeenCalledTimes(1);

    act(() => api.close());
    expect(manager.restore).not.toHaveBeenCalled();
    act(() => api.close());
    expect(manager.restore).toHaveBeenCalledWith(token);
  });

  it('hides the app subtree from assistive technology while a modal is open', () => {
    let api!: UseOverlayResult;
    const tree = renderProvider(
      <>
        <Capture onReady={(value) => (api = value)} />
        <Text testID="app">App</Text>
      </>,
    );
    const hiddenBefore = tree.root.findAll(
      (node) => node.props.importantForAccessibility === 'no-hide-descendants',
    );
    expect(hiddenBefore).toHaveLength(0);

    act(() => {
      api.open(() => <Text testID="dialog">Dialog</Text>, { testID: 'dialog' });
    });
    const hiddenAfter = tree.root.findAll(
      (node) => node.props.importantForAccessibility === 'no-hide-descendants',
    );
    expect(hiddenAfter.length).toBeGreaterThan(0);
    const focusTraps = tree.root.findAll((node) => node.props.accessibilityViewIsModal === true);
    expect(focusTraps.length).toBeGreaterThan(0);
  });

  it('applies provider and per-overlay insets to the content padding', () => {
    let api!: UseOverlayResult;
    const tree = renderProvider(<Capture onReady={(value) => (api = value)} />, {
      insets: { top: 10, right: 11, bottom: 12, left: 13 },
    });
    act(() => {
      api.open(() => <Text testID="sheet">Sheet</Text>, {
        insets: { top: 5 },
        testID: 'sheet',
      });
    });
    const padded = tree.root.findAll(
      (node) =>
        node.props.style != null &&
        !Array.isArray(node.props.style) &&
        node.props.style.paddingTop === 15 &&
        node.props.style.paddingRight === 11 &&
        node.props.style.paddingBottom === 12 &&
        node.props.style.paddingLeft === 13,
    );
    expect(padded.length).toBeGreaterThan(0);
  });

  it('uses the platform keyboard-avoidance behaviour', () => {
    let api!: UseOverlayResult;
    const tree = renderProvider(<Capture onReady={(value) => (api = value)} />);
    act(() => {
      api.open(() => <Text testID="form">Form</Text>, { testID: 'form' });
    });
    const kav = tree.root.findAll(
      (node) => node.props.behavior === 'height' || node.props.behavior === 'padding',
    );
    expect(kav.length).toBeGreaterThan(0);
    expect(kav[0]!.props.keyboardVerticalOffset).toBe(0);
  });
});

describe('Portal', () => {
  it('opens while visible and closes when hidden', () => {
    let tree: TestRenderer.ReactTestRenderer;
    const onClose = jest.fn();
    function Harness({ visible }: { visible: boolean }) {
      return (
        <OverlayProvider>
          <Portal visible={visible} onClose={onClose} testID="portal">
            <Text testID="portal-content">Portal</Text>
          </Portal>
          <Text testID="app">App</Text>
        </OverlayProvider>
      );
    }
    act(() => {
      tree = TestRenderer.create(<Harness visible />);
    });
    expect(
      tree!.root.findAllByType(Text).filter((node) => node.props.testID === 'portal-content'),
    ).toHaveLength(1);

    act(() => {
      tree!.update(<Harness visible={false} />);
    });
    expect(
      tree!.root.findAllByType(Text).filter((node) => node.props.testID === 'portal-content'),
    ).toHaveLength(0);
  });

  it('updates live children without remounting the overlay', () => {
    let tree: TestRenderer.ReactTestRenderer;
    function Harness({ label }: { label: string }) {
      return (
        <OverlayProvider>
          <Portal visible testID="portal">
            <Text testID="portal-content">{label}</Text>
          </Portal>
        </OverlayProvider>
      );
    }
    act(() => {
      tree = TestRenderer.create(<Harness label="first" />);
    });
    const first = tree!.root
      .findAllByType(Text)
      .find((node) => node.props.testID === 'portal-content')!;
    expect(first.props.children).toBe('first');
    act(() => {
      tree!.update(<Harness label="second" />);
    });
    const second = tree!.root
      .findAllByType(Text)
      .find((node) => node.props.testID === 'portal-content')!;
    expect(second.props.children).toBe('second');
  });
});

describe('overlay platform helpers', () => {
  it('merges insets', () => {
    expect(mergeInsets({ top: 1, right: 2, bottom: 3, left: 4 }, { top: 10, left: 20 })).toEqual({
      top: 11,
      right: 2,
      bottom: 3,
      left: 24,
    });
  });

  it('selects keyboard behaviour by platform', () => {
    expect(keyboardAvoidingBehavior('ios')).toBe('padding');
    expect(keyboardAvoidingBehavior('android')).toBe('height');
    expect(keyboardAvoidingBehavior('web')).toBeUndefined();
  });

  it('recognises Escape spellings', () => {
    expect(isEscapeEvent({ key: 'Escape' })).toBe(true);
    expect(isEscapeEvent({ key: 'Esc' })).toBe(true);
    expect(isEscapeEvent({ key: 'Enter' })).toBe(false);
  });

  it('wraps the focus index in both directions', () => {
    expect(nextFocusIndex(0, 3, false)).toBe(1);
    expect(nextFocusIndex(2, 3, false)).toBe(0);
    expect(nextFocusIndex(0, 3, true)).toBe(2);
    expect(nextFocusIndex(-1, 3, false)).toBe(0);
    expect(nextFocusIndex(-1, 3, true)).toBe(2);
    expect(nextFocusIndex(0, 0, false)).toBe(-1);
  });
});
