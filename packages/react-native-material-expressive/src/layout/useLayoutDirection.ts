import { useMemo } from 'react';
import { I18nManager } from 'react-native';

import {
  directionValue,
  mirrorIconTransform,
  resolveLayoutDirection,
  resolveRowDirection,
  resolveStartEnd,
  resolveTextAlign,
  textWritingDirection,
  type LayoutDirection,
  type TextAlignment,
} from './rtl';

export interface UseLayoutDirectionResult {
  readonly direction: LayoutDirection;
  readonly isRTL: boolean;
  readonly isLTR: boolean;
  readonly value: <T>(ltr: T, rtl: T) => T;
  readonly startEnd: (start: number, end: number) => { left: number; right: number };
  readonly textAlign: (align?: TextAlignment) => 'left' | 'right' | 'center';
  readonly iconTransform: { transform: [{ scaleX: -1 }] } | undefined;
  readonly rowDirection: 'row' | 'row-reverse';
  readonly writingDirection: 'ltr' | 'rtl';
}

/**
 * The current layout direction plus direction-aware helpers.
 *
 * `I18nManager.isRTL` is process-wide, so the hook does not subscribe to a
 * change event; toggling RTL at runtime requires `forceRTL` and an app
 * restart, exactly as RN documents.
 */
export function useLayoutDirection(): UseLayoutDirectionResult {
  const direction = resolveLayoutDirection(I18nManager.isRTL);

  return useMemo(() => {
    const current = direction;
    return {
      direction: current,
      isRTL: current === 'rtl',
      isLTR: current === 'ltr',
      value: <T>(ltr: T, rtl: T) => directionValue(current, ltr, rtl),
      startEnd: (start: number, end: number) => resolveStartEnd(current, start, end),
      textAlign: (align: TextAlignment = 'start') => resolveTextAlign(current, align),
      iconTransform: mirrorIconTransform(current),
      rowDirection: resolveRowDirection(current),
      writingDirection: textWritingDirection(current),
    };
  }, [direction]);
}
