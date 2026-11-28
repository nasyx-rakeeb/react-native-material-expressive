import { createContext, type ReactNode } from 'react';

import type { LayoutDirection } from './rtl';
import type { WindowSize, WindowSizeClass } from './windowSizeClass';

/** Provided by `M3Provider`; `null` means "use the platform value". */
export const LayoutDirectionContext = createContext<LayoutDirection | null>(null);

/** Provided by `M3Provider`; `null` means "use `useWindowDimensions()`". */
export const WindowSizeContext = createContext<WindowSize | null>(null);

/** Provided by `M3Provider`; `null` means "calculate from the window". */
export const WindowSizeClassContext = createContext<WindowSizeClass | null>(null);

export interface M3LayoutProviderProps {
  /** Force a direction for previews and tests. Omit to follow `I18nManager`. */
  layoutDirection?: LayoutDirection;
  /** Force a window size for previews and tests. Omit to follow the window. */
  windowSize?: WindowSize;
  children?: ReactNode;
}

/** Internal provider used by `M3Provider`; exported for advanced composition. */
export function M3LayoutDirectionProvider({
  layoutDirection,
  children,
}: {
  layoutDirection?: LayoutDirection;
  children?: ReactNode;
}) {
  return (
    <LayoutDirectionContext.Provider value={layoutDirection ?? null}>
      {children}
    </LayoutDirectionContext.Provider>
  );
}

/** Internal provider used by `M3Provider`; exported for advanced composition. */
export function M3WindowSizeProvider({
  windowSize,
  children,
}: {
  windowSize?: WindowSize;
  children?: ReactNode;
}) {
  return (
    <WindowSizeContext.Provider value={windowSize ?? null}>{children}</WindowSizeContext.Provider>
  );
}

/** Internal provider used by `M3Provider`; exported for advanced composition. */
export function M3WindowSizeClassProvider({
  windowSizeClass,
  children,
}: {
  windowSizeClass?: WindowSizeClass;
  children?: ReactNode;
}) {
  return (
    <WindowSizeClassContext.Provider value={windowSizeClass ?? null}>
      {children}
    </WindowSizeClassContext.Provider>
  );
}
