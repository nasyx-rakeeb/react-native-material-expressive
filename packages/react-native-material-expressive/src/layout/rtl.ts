import { I18nManager } from 'react-native';

/**
 * RTL helpers. React Native already understands logical style props
 * (`start`, `end`, `marginStart`, `paddingEnd`, …); these helpers exist for the
 * cases RN does not resolve for us: numeric transforms, icon mirroring, text
 * alignment, and values read outside a style object.
 */

export type LayoutDirection = 'ltr' | 'rtl';

export function resolveLayoutDirection(isRtl: boolean): LayoutDirection {
  return isRtl ? 'rtl' : 'ltr';
}

/** The process-wide direction. `I18nManager.forceRTL` needs an app restart. */
export function getLayoutDirection(): LayoutDirection {
  return resolveLayoutDirection(I18nManager.isRTL);
}

/** Choose a value by direction. */
export function directionValue<T>(direction: LayoutDirection, ltr: T, rtl: T): T {
  return direction === 'rtl' ? rtl : ltr;
}

/** Map logical start/end offsets to physical left/right values. */
export function resolveStartEnd(
  direction: LayoutDirection,
  start: number,
  end: number,
): { left: number; right: number } {
  return direction === 'rtl' ? { left: end, right: start } : { left: start, right: end };
}

export type TextAlignment = 'start' | 'end' | 'left' | 'right' | 'center';

/**
 * Resolve `start`/`end` text alignment. Physical `left`/`right` and `center`
 * pass through unchanged, matching RN's `textAlign` semantics.
 */
export function resolveTextAlign(
  direction: LayoutDirection,
  align: TextAlignment = 'start',
): 'left' | 'right' | 'center' {
  if (align === 'center' || align === 'left' || align === 'right') {
    return align;
  }
  const startIsLeft = direction === 'ltr';
  if (align === 'start') return startIsLeft ? 'left' : 'right';
  return startIsLeft ? 'right' : 'left';
}

/**
 * A transform that mirrors a directional icon in RTL. Returns `undefined` in
 * LTR so callers can spread it without an identity transform.
 *
 * Only mirror icons whose meaning is directional (arrows, chevrons, back,
 * send). Never mirror logos, media controls, or checkmarks.
 */
export function mirrorIconTransform(
  direction: LayoutDirection,
): { transform: [{ scaleX: -1 }] } | undefined {
  return direction === 'rtl' ? { transform: [{ scaleX: -1 }] } : undefined;
}

/** A `writingDirection` value for RN `Text` styles. */
export function textWritingDirection(direction: LayoutDirection): 'ltr' | 'rtl' {
  return direction;
}

/**
 * Direction-aware `flexDirection` for rows that must start at the leading
 * edge. RN's `row` already follows the writing direction on Android/iOS, but
 * web needs an explicit `row-reverse` in RTL.
 */
export function resolveRowDirection(direction: LayoutDirection): 'row' | 'row-reverse' {
  return direction === 'rtl' ? 'row-reverse' : 'row';
}
