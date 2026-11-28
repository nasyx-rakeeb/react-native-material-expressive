import { createContext, useContext, type ReactNode } from 'react';

import type { OverlayEntry, OverlayOptions, OverlayRenderApi } from './types';

export interface OverlayActions {
  open(render: (api: OverlayRenderApi) => ReactNode, options?: OverlayOptions): string;
  close(id?: string): void;
  dismiss(id?: string): void;
  closeAll(): void;
  update(id: string, render: (api: OverlayRenderApi) => ReactNode): void;
}

export const OverlayActionsContext = createContext<OverlayActions | null>(null);
export const OverlayEntriesContext = createContext<readonly OverlayEntry[]>([]);

export function useOverlayActions(): OverlayActions {
  const actions = useContext(OverlayActionsContext);
  if (actions === null) {
    throw new Error('Overlay components must be rendered inside <OverlayProvider>.');
  }
  return actions;
}
