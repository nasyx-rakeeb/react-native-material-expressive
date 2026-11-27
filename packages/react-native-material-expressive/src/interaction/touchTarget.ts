/**
 * Material minimum interactive target: 48 dp.
 *
 * Source: `material3/.../InteractiveComponentSize.kt:266-269`.
 * Compose reserves layout space; React Native's `hitSlop` expands only the
 * touch region. `Interactive` uses the second model so a 24 dp visual keeps
 * its 24 dp bounds while the touch target reaches 48 dp.
 */
export const MINIMUM_TOUCH_TARGET_DP = 48;

export interface Insets {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

function isInsets(value: number | Partial<Insets>): value is Partial<Insets> {
  return typeof value === 'object' && value !== null;
}

/**
 * Resolve the hit slop needed to reach `minTarget` without changing layout.
 *
 * A visual wider/taller than the target gets 0 on that axis. `extra` can only
 * enlarge the result; it never shrinks the accessibility minimum.
 */
export function resolveHitSlop(
  widthDp: number,
  heightDp: number,
  minTarget: number = MINIMUM_TOUCH_TARGET_DP,
  extra?: number | Partial<Insets>,
): Insets {
  const horizontal = Math.max(0, (minTarget - widthDp) / 2);
  const vertical = Math.max(0, (minTarget - heightDp) / 2);
  if (extra === undefined) {
    return { top: vertical, right: horizontal, bottom: vertical, left: horizontal };
  }
  if (!isInsets(extra)) {
    const all = Math.max(0, extra);
    return {
      top: Math.max(vertical, all),
      right: Math.max(horizontal, all),
      bottom: Math.max(vertical, all),
      left: Math.max(horizontal, all),
    };
  }
  return {
    top: Math.max(vertical, extra.top ?? 0),
    right: Math.max(horizontal, extra.right ?? 0),
    bottom: Math.max(vertical, extra.bottom ?? 0),
    left: Math.max(horizontal, extra.left ?? 0),
  };
}
