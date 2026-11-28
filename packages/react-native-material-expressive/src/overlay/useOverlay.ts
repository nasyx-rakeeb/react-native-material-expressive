import { useContext, useMemo } from 'react';

import { OverlayEntriesContext, useOverlayActions, type OverlayActions } from './context';

export interface UseOverlayResult extends OverlayActions {
  /** Overlay ids, bottom to top. */
  readonly stack: readonly string[];
  readonly topId: string | null;
  isOpen(id?: string): boolean;
}

/** Read the overlay stack and its actions. Must be inside `OverlayProvider`. */
export function useOverlay(): UseOverlayResult {
  const actions = useOverlayActions();
  const entries = useContext(OverlayEntriesContext);

  return useMemo(() => {
    const stack = entries.map((entry) => entry.id);
    const topId = stack.length === 0 ? null : stack[stack.length - 1]!;
    return {
      ...actions,
      stack,
      topId,
      isOpen: (id?: string) => (id === undefined ? stack.length > 0 : stack.includes(id)),
    };
  }, [actions, entries]);
}
