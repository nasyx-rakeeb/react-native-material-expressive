import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';

import { OverlayActionsContext, OverlayEntriesContext, type OverlayActions } from './context';
import { OverlayHost } from './OverlayHost';
import {
  DEFAULT_ESCAPE_SOURCE,
  DEFAULT_OVERLAY_FOCUS_MANAGER,
  DEFAULT_SCRIM_COLOR,
  defaultOverlayInsets,
  isEscapeEvent,
} from './platform';
import type {
  EdgeInsets,
  OverlayEntry,
  OverlayFocusManager,
  OverlayFocusToken,
  OverlayKeyEventSource,
  OverlayOptions,
  OverlayRenderApi,
  ResolvedOverlayOptions,
} from './types';

export interface OverlayProviderProps {
  children: ReactNode;
  /**
   * Window insets in dp. Pass `useSafeAreaInsets()` from
   * `react-native-safe-area-context`; the default only knows the Android
   * status bar height, so a notched iOS app should always pass this.
   */
  insets?: EdgeInsets;
  /**
   * Escape source. Defaults to `window.keydown` on web and a no-op on native,
   * where Android back is handled by `BackHandler`. Pass a source to support a
   * native hardware keyboard or TV remote.
   */
  escapeSource?: OverlayKeyEventSource | null;
  /** Injectable for tests; defaults to focused input / active element. */
  focusManager?: OverlayFocusManager;
  testID?: string;
}

function resolveOptions(options: OverlayOptions): ResolvedOverlayOptions {
  return {
    dismissible: options.dismissible ?? true,
    modal: options.modal ?? true,
    scrimColor: options.scrimColor ?? DEFAULT_SCRIM_COLOR,
    placement: options.placement ?? 'center',
    keyboardAvoiding: options.keyboardAvoiding ?? true,
    insets: options.insets ?? {},
    onClose: options.onClose,
    testID: options.testID,
  };
}

/**
 * Owns the overlay stack and renders it above the app.
 *
 * Stacking rules:
 * - entries render in insertion order; the last one is topmost;
 * - Android back and Escape dismiss **only** the topmost entry;
 * - a dismissible entry calls `onClose` when supplied (the owner closes it),
 *   otherwise it is removed immediately;
 * - modal layers below the top are inert and hidden from assistive tech;
 * - focus is captured before the first overlay and restored when the stack
 *   empties.
 */
export function OverlayProvider({
  children,
  insets,
  escapeSource,
  focusManager,
  testID,
}: OverlayProviderProps) {
  const [entries, setEntries] = useState<readonly OverlayEntry[]>([]);
  const entriesRef = useRef<readonly OverlayEntry[]>(entries);
  const idCounter = useRef(0);
  const focusToken = useRef<OverlayFocusToken | null>(null);
  const hadOverlays = useRef(false);

  const commit = useCallback((next: readonly OverlayEntry[]) => {
    entriesRef.current = next;
    setEntries(next);
  }, []);

  const open = useCallback(
    (render: (api: OverlayRenderApi) => ReactNode, options: OverlayOptions = {}) => {
      const id = options.id ?? `overlay-${++idCounter.current}`;
      const entry: OverlayEntry = {
        id,
        render,
        options: resolveOptions(options),
        revision: 0,
      };
      commit([...entriesRef.current, entry]);
      return id;
    },
    [commit],
  );

  const close = useCallback(
    (id?: string) => {
      const current = entriesRef.current;
      if (current.length === 0) return;
      const targetId = id ?? current[current.length - 1]!.id;
      const next = current.filter((entry) => entry.id !== targetId);
      if (next.length !== current.length) commit(next);
    },
    [commit],
  );

  const closeAll = useCallback(() => {
    if (entriesRef.current.length > 0) commit([]);
  }, [commit]);

  const dismiss = useCallback(
    (id?: string) => {
      const current = entriesRef.current;
      const target =
        id === undefined ? current[current.length - 1] : current.find((entry) => entry.id === id);
      if (!target || !target.options.dismissible) return;
      if (target.options.onClose !== undefined) {
        target.options.onClose();
        return;
      }
      close(target.id);
    },
    [close],
  );

  const update = useCallback(
    (id: string, render: (api: OverlayRenderApi) => ReactNode) => {
      const current = entriesRef.current;
      const index = current.findIndex((entry) => entry.id === id);
      if (index < 0) return;
      const next = current.slice();
      const existing = next[index]!;
      next[index] = { ...existing, render, revision: existing.revision + 1 };
      commit(next);
    },
    [commit],
  );

  const actions = useMemo<OverlayActions>(
    () => ({ open, close, dismiss, closeAll, update }),
    [open, close, dismiss, closeAll, update],
  );

  useEffect(() => {
    if (entries.length === 0) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (entriesRef.current.length === 0) return false;
      dismiss();
      return true;
    });
    return () => subscription.remove();
  }, [entries.length, dismiss]);

  useEffect(() => {
    if (entries.length === 0) return;
    const source = escapeSource === null ? null : (escapeSource ?? DEFAULT_ESCAPE_SOURCE);
    if (source === null) return;
    return source((event) => {
      if (!isEscapeEvent(event)) return;
      if (entriesRef.current.length === 0) return;
      event.preventDefault?.();
      dismiss();
    });
  }, [entries.length, escapeSource, dismiss]);

  useEffect(() => {
    const hasOverlays = entries.length > 0;
    const manager = focusManager ?? DEFAULT_OVERLAY_FOCUS_MANAGER;
    if (hasOverlays && !hadOverlays.current) {
      focusToken.current = manager.capture();
    } else if (!hasOverlays && hadOverlays.current) {
      manager.restore(focusToken.current);
      focusToken.current = null;
    }
    hadOverlays.current = hasOverlays;
  }, [entries.length, focusManager]);

  const resolvedInsets = insets ?? defaultOverlayInsets();
  const modalOpen = entries.some((entry) => entry.options.modal);

  return (
    <OverlayActionsContext.Provider value={actions}>
      <OverlayEntriesContext.Provider value={entries}>
        <View style={styles.root} testID={testID}>
          <View
            accessibilityElementsHidden={modalOpen}
            importantForAccessibility={modalOpen ? 'no-hide-descendants' : 'auto'}
            style={styles.content}
          >
            {children}
          </View>
          <OverlayHost
            entries={entries}
            insets={resolvedInsets}
            onClose={close}
            onDismiss={dismiss}
            testID={testID === undefined ? undefined : `${testID}-host`}
          />
        </View>
      </OverlayEntriesContext.Provider>
    </OverlayActionsContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
});
