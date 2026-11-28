import type { ReactNode } from 'react';

/** Window insets in dp. Pass `useSafeAreaInsets()` from the app. */
export interface EdgeInsets {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

export type OverlayPlacement = 'center' | 'bottom' | 'fullscreen';

export interface OverlayOptions {
  /** Stable id. Generated when omitted. */
  id?: string;
  /** Back/Escape/scrim may request a close. Default true. */
  dismissible?: boolean;
  /**
   * Modal overlays add a scrim, trap assistive-technology focus and make
   * everything below them inert. Default true.
   */
  modal?: boolean;
  /** Scrim colour. Default `rgba(0, 0, 0, 0.32)` (Compose `Scrim`). */
  scrimColor?: string;
  /** Where the content sits inside the inset-safe area. Default `center`. */
  placement?: OverlayPlacement;
  /** Wrap content in `KeyboardAvoidingView`. Default true. */
  keyboardAvoiding?: boolean;
  /** Extra insets for this overlay, added to the provider insets. */
  insets?: Partial<EdgeInsets>;
  /** Called when back/Escape/scrim asks to close. Owner closes via `close(id)`. */
  onClose?: () => void;
  testID?: string;
}

export interface ResolvedOverlayOptions {
  dismissible: boolean;
  modal: boolean;
  scrimColor: string;
  placement: OverlayPlacement;
  keyboardAvoiding: boolean;
  insets: Partial<EdgeInsets>;
  onClose?: () => void;
  testID?: string;
}

export interface OverlayRenderApi {
  /** The overlay id. */
  id: string;
  /** Remove this overlay immediately. */
  close: () => void;
  /** Ask to close: calls `onClose` when supplied, otherwise closes. */
  dismiss: () => void;
  /** True for the last entry in the stack. */
  isTopmost: boolean;
}

export interface OverlayEntry {
  id: string;
  render: (api: OverlayRenderApi) => ReactNode;
  options: ResolvedOverlayOptions;
  /** Bumped by `Portal` when its children change. */
  revision: number;
}

export interface OverlayKeyEvent {
  key: string;
  preventDefault?: () => void;
}

/**
 * Escape-key source. The default subscribes on web and is a no-op on native,
 * where the Android back button is the dismissal gesture. Inject a source on
 * native to support a hardware keyboard or a TV remote.
 */
export type OverlayKeyEventSource = (handler: (event: OverlayKeyEvent) => void) => () => void;

export interface OverlayFocusToken {
  readonly platform: 'web' | 'native';
  readonly value: unknown;
}

export interface OverlayFocusManager {
  capture(): OverlayFocusToken | null;
  restore(token: OverlayFocusToken | null): void;
}
