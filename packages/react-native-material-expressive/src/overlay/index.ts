export { OverlayProvider, type OverlayProviderProps } from './OverlayProvider';
export { OverlayHost, type OverlayHostProps } from './OverlayHost';
export { Portal, type PortalProps } from './Portal';
export { useOverlay, type UseOverlayResult } from './useOverlay';
export {
  FOCUSABLE_SELECTOR,
  OverlayFocusTrap,
  nextFocusIndex,
  type OverlayFocusTrapProps,
} from './FocusTrap';
export {
  DEFAULT_ESCAPE_SOURCE,
  DEFAULT_OVERLAY_FOCUS_MANAGER,
  DEFAULT_SCRIM_COLOR,
  NOOP_ESCAPE_SOURCE,
  createWebEscapeSource,
  defaultOverlayInsets,
  isEscapeEvent,
  keyboardAvoidingBehavior,
  mergeInsets,
} from './platform';
export type {
  EdgeInsets,
  OverlayEntry,
  OverlayFocusManager,
  OverlayFocusToken,
  OverlayKeyEvent,
  OverlayKeyEventSource,
  OverlayOptions,
  OverlayPlacement,
  OverlayRenderApi,
  ResolvedOverlayOptions,
} from './types';
