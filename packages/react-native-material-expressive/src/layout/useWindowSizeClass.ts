import { useWindowDimensions } from 'react-native';

import {
  calculateWindowSizeClass,
  type WindowHeightSizeClass,
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
 * window metrics model.
 */
export function useWindowSizeClass(options: UseWindowSizeClassOptions = {}): WindowSizeClass {
  const { width, height } = useWindowDimensions();
  return calculateWindowSizeClass(
    { width, height },
    {
      supportedWidthSizeClasses: options.supportedWidthSizeClasses,
      supportedHeightSizeClasses: options.supportedHeightSizeClasses,
    },
  );
}
