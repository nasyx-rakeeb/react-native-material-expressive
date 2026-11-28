import { Platform, StatusBar, TextInput } from 'react-native';

import type {
  EdgeInsets,
  OverlayFocusManager,
  OverlayFocusToken,
  OverlayKeyEvent,
  OverlayKeyEventSource,
} from './types';

/** Compose `Scrim`: black at 32% (`Scrim.kt` / `ScrimTokens`). */
export const DEFAULT_SCRIM_COLOR = 'rgba(0, 0, 0, 0.32)';

export function defaultOverlayInsets(): EdgeInsets {
  const top = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;
  return { top, right: 0, bottom: 0, left: 0 };
}

export function mergeInsets(base: EdgeInsets, extra?: Partial<EdgeInsets>): EdgeInsets {
  return {
    top: base.top + (extra?.top ?? 0),
    right: base.right + (extra?.right ?? 0),
    bottom: base.bottom + (extra?.bottom ?? 0),
    left: base.left + (extra?.left ?? 0),
  };
}

/**
 * Keyboard avoidance behaviour. Compose uses a window inset; RN's closest
 * equivalents are `padding` on iOS and `height` on Android.
 */
export function keyboardAvoidingBehavior(platform: string): 'padding' | 'height' | undefined {
  if (platform === 'ios') return 'padding';
  if (platform === 'android') return 'height';
  return undefined;
}

/**
 * Escape source. Native has no global key listener in RN core; Android back is
 * handled by `BackHandler`. Web uses `window.keydown`. A native hardware
 * keyboard can inject its own source through `OverlayProvider.escapeSource`.
 */
export function createWebEscapeSource(): OverlayKeyEventSource {
  return (handler) => {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') {
      return () => {};
    }
    const listener = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      handler({
        key: 'Escape',
        preventDefault: () => event.preventDefault(),
      } satisfies OverlayKeyEvent);
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  };
}

export const NOOP_ESCAPE_SOURCE: OverlayKeyEventSource = () => () => {};

export const DEFAULT_ESCAPE_SOURCE: OverlayKeyEventSource =
  Platform.OS === 'web' ? createWebEscapeSource() : NOOP_ESCAPE_SOURCE;

function webDocument(): Document | undefined {
  return typeof document === 'undefined' ? undefined : document;
}

/**
 * Captures the focused text input (native) or active element (web) before the
 * first overlay opens and restores it when the stack empties.
 */
export const DEFAULT_OVERLAY_FOCUS_MANAGER: OverlayFocusManager = {
  capture(): OverlayFocusToken | null {
    if (Platform.OS === 'web') {
      const active = webDocument()?.activeElement as HTMLElement | null;
      if (!active || active === webDocument()?.body) return null;
      return { platform: 'web', value: active };
    }
    const input = TextInput.State.currentlyFocusedInput();
    return input ? { platform: 'native', value: input } : null;
  },
  restore(token: OverlayFocusToken | null): void {
    if (!token) return;
    if (token.platform === 'web') {
      (token.value as HTMLElement | null)?.focus?.();
      return;
    }
    TextInput.State.focusTextInput(
      token.value as Parameters<typeof TextInput.State.focusTextInput>[0],
    );
  },
};

export function isEscapeEvent(event: OverlayKeyEvent): boolean {
  return event.key === 'Escape' || event.key === 'Esc';
}
