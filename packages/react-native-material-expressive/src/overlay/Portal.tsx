import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';

import { useOverlayActions } from './context';
import type { OverlayOptions, OverlayRenderApi } from './types';

export interface PortalProps extends Omit<OverlayOptions, 'onClose'> {
  /** Mount the children in the overlay stack while true. */
  visible: boolean;
  children: ReactNode;
  /**
   * Back/Escape/scrim request. When supplied, the portal does **not** close
   * itself; the owner must set `visible` to false. When omitted, the portal
   * closes immediately.
   */
  onClose?: () => void;
}

/**
 * Declarative portal into the nearest `OverlayProvider`.
 *
 * ```tsx
 * <Portal visible={open} onClose={() => setOpen(false)}>
 *   <Dialog>…</Dialog>
 * </Portal>
 * ```
 *
 * The portal re-publishes its children on every render, so controlled content
 * stays live without remounting the overlay. The id and options are captured
 * when the portal opens; changing them while visible requires closing first.
 */
export function Portal({ visible, children, onClose, ...options }: PortalProps) {
  const actions = useOverlayActions();
  const idRef = useRef<string | null>(null);
  const renderRef = useRef<ReactNode>(children);
  const optionsRef = useRef(options);
  const onCloseRef = useRef(onClose);

  // Keep the latest render/options available to the overlay entry without
  // writing refs during render. This layout effect is declared first so it
  // runs before the open/update effects below.
  useLayoutEffect(() => {
    renderRef.current = children;
    optionsRef.current = options;
    onCloseRef.current = onClose;
  });

  useLayoutEffect(() => {
    if (visible && idRef.current === null) {
      const closeHandler =
        onCloseRef.current === undefined ? undefined : () => onCloseRef.current?.();
      idRef.current = actions.open((_api: OverlayRenderApi) => renderRef.current, {
        ...optionsRef.current,
        onClose: closeHandler,
      });
    } else if (!visible && idRef.current !== null) {
      actions.close(idRef.current);
      idRef.current = null;
    }
  }, [visible, actions]);

  useLayoutEffect(() => {
    if (idRef.current !== null) {
      actions.update(idRef.current, (_api: OverlayRenderApi) => renderRef.current);
    }
  });

  useEffect(
    () => () => {
      if (idRef.current !== null) {
        actions.close(idRef.current);
        idRef.current = null;
      }
    },
    [actions],
  );

  return null;
}
