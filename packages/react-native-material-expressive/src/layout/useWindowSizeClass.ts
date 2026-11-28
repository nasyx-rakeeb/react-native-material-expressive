import { useContext } from 'react';
import { useWindowDimensions } from 'react-native';

import { WindowSizeClassContext, WindowSizeContext } from './context';
import {
  calculateWindowSizeClass,
  type WindowHeightSizeClass,
  type WindowSize,
  type WindowSizeClass,
  type WindowWidthSizeClass,
} from './windowSizeClass';

export interface UseWindowSizeClassOptions {
  supportedWidthSizeClasses?: readonly WindowWidthSizeClass[];
  supportedHeightSizeClasses?: readonly WindowHeightSizeClass[];
}

/**
 * The current window's size class, recalculated when the window changes.
 *
 * `useWindowDimensions()` already reports dp, so no density conversion is
 * needed. On web this follows the browser viewport, matching the Compose
 * window metrics model. When an `M3Provider` supplies a window size or class,
 * that value wins; the provider is the single recompute point for its subtree.
 */
export function useWindowSizeClass(options: UseWindowSizeClassOptions = {}): WindowSizeClass {
  const providedClass = useContext(WindowSizeClassContext);
  const providedSize = useContext(WindowSizeContext);
  const dimensions = useWindowDimensions();
  if (providedClass) {
    return providedClass;
  }
  return calculateWindowSizeClass(providedSize ?? dimensions, {
    supportedWidthSizeClasses: options.supportedWidthSizeClasses,
    supportedHeightSizeClasses: options.supportedHeightSizeClasses,
  });
}

/** The current window size in dp, from `M3Provider` or the platform window. */
export function useWindowSize(): WindowSize {
  const provided = useContext(WindowSizeContext);
  const dimensions = useWindowDimensions();
  return provided ?? { width: dimensions.width, height: dimensions.height };
}
