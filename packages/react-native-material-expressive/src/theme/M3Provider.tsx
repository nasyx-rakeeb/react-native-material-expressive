import { useMemo, type ReactNode } from 'react';
import { useWindowDimensions } from 'react-native';

import {
  LayoutDirectionContext,
  WindowSizeClassContext,
  WindowSizeContext,
} from '../layout/context';
import { getLayoutDirection, type LayoutDirection } from '../layout/rtl';
import {
  calculateWindowSizeClass,
  type WindowHeightSizeClass,
  type WindowSize,
  type WindowWidthSizeClass,
} from '../layout/windowSizeClass';
import { useLayoutDirection } from '../layout/useLayoutDirection';
import { useWindowSizeClass } from '../layout/useWindowSizeClass';
import { ReduceMotionOverrideProvider } from '../motion/ReduceMotionContext';
import { useReduceMotion } from '../motion/useReduceMotion';
import { useContentColor } from '../typography/ContentColor';
import { M3ThemeProvider, useM3Theme } from './M3ThemeProvider';
import type { M3ThemeOptions } from './types';

export interface M3ProviderProps extends M3ThemeOptions {
  children: ReactNode;
  /**
   * Force the platform reduce-motion setting for this subtree. Omit to follow
   * the OS; `true` holds animations at their reduced state.
   */
  reduceMotion?: boolean;
  /**
   * Force a layout direction for previews, tests, or a scoped subtree. Omit to
   * follow `I18nManager.isRTL`.
   */
  layoutDirection?: LayoutDirection;
  /**
   * Force a window size in dp for previews, tests, or a fixed-size surface.
   * Omit to follow `useWindowDimensions()`.
   */
  windowSize?: WindowSize;
  /** Width classes the subtree supports; defaults to all three. */
  supportedWidthSizeClasses?: readonly WindowWidthSizeClass[];
  /** Height classes the subtree supports; defaults to all three. */
  supportedHeightSizeClasses?: readonly WindowHeightSizeClass[];
}

/**
 * The root Material 3 provider.
 *
 * Composes the theme (colour, typography, motion), the platform reduce-motion
 * setting, the window size class, and the layout direction into one tree, so
 * every hook reads the same values and there is a single recompute point for
 * window changes. All overrides are optional; without them the provider
 * follows the platform, exactly like `MaterialExpressiveTheme`.
 */
export function M3Provider({
  children,
  reduceMotion,
  layoutDirection,
  windowSize,
  supportedWidthSizeClasses,
  supportedHeightSizeClasses,
  ...themeOptions
}: M3ProviderProps) {
  const dimensions = useWindowDimensions();
  const resolvedSize = useMemo(
    () => windowSize ?? { width: dimensions.width, height: dimensions.height },
    [windowSize, dimensions.width, dimensions.height],
  );
  const windowSizeClass = useMemo(
    () =>
      calculateWindowSizeClass(resolvedSize, {
        supportedWidthSizeClasses,
        supportedHeightSizeClasses,
      }),
    [resolvedSize, supportedWidthSizeClasses, supportedHeightSizeClasses],
  );
  const resolvedDirection = layoutDirection ?? getLayoutDirection();

  return (
    <M3ThemeProvider {...themeOptions}>
      <ReduceMotionOverrideProvider value={reduceMotion}>
        <LayoutDirectionContext.Provider value={resolvedDirection}>
          <WindowSizeContext.Provider value={resolvedSize}>
            <WindowSizeClassContext.Provider value={windowSizeClass}>
              {children}
            </WindowSizeClassContext.Provider>
          </WindowSizeContext.Provider>
        </LayoutDirectionContext.Provider>
      </ReduceMotionOverrideProvider>
    </M3ThemeProvider>
  );
}

/** The active motion scheme, wired through the provider's theme. */
export function useM3MotionScheme() {
  return useM3Theme().motionScheme;
}

/** The active reduce-motion state, including a provider override. */
export function useM3ReduceMotion(): boolean {
  return useReduceMotion();
}

/** The provider's window size class. */
export function useM3WindowSizeClass() {
  return useWindowSizeClass();
}

/** The provider's layout direction and direction-aware helpers. */
export function useM3LayoutDirection() {
  return useLayoutDirection();
}

/** The nearest content colour, falling back to `onSurface`. */
export function useM3ContentColor(): string {
  return useContentColor();
}
