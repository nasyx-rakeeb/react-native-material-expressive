/**
 * Window size classes, ported from `material3-window-size-class` 1.5.0
 * (`androidx.compose.material3.windowsizeclass.WindowSizeClass`).
 *
 * Breakpoints are in dp and are inclusive lower bounds:
 * width 600 / 840, height 480 / 900. Compose models each class as a value
 * class; TypeScript uses a string union so the values are serialisable and
 * exhaustively switchable.
 */

export type WindowWidthSizeClass = 'compact' | 'medium' | 'expanded';
export type WindowHeightSizeClass = 'compact' | 'medium' | 'expanded';

export interface WindowSizeClass {
  readonly widthSizeClass: WindowWidthSizeClass;
  readonly heightSizeClass: WindowHeightSizeClass;
}

export interface WindowSize {
  /** Window width in dp. */
  readonly width: number;
  /** Window height in dp. */
  readonly height: number;
}

export const WINDOW_WIDTH_BREAKPOINTS = Object.freeze({
  medium: 600,
  expanded: 840,
} as const);

export const WINDOW_HEIGHT_BREAKPOINTS = Object.freeze({
  medium: 480,
  expanded: 900,
} as const);

export const DEFAULT_WIDTH_SIZE_CLASSES: readonly WindowWidthSizeClass[] = Object.freeze([
  'compact',
  'medium',
  'expanded',
]);

export const DEFAULT_HEIGHT_SIZE_CLASSES: readonly WindowHeightSizeClass[] = Object.freeze([
  'compact',
  'medium',
  'expanded',
]);

/** All width classes, largest first, matching Compose's `AllSizeClassList`. */
const WIDTH_ORDER: readonly WindowWidthSizeClass[] = ['expanded', 'medium', 'compact'];
const HEIGHT_ORDER: readonly WindowHeightSizeClass[] = ['expanded', 'medium', 'compact'];

function requireSize(value: number, label: string): void {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${label} must be a finite number`);
  }
  if (value < 0) {
    throw new RangeError(`${label} must not be negative`);
  }
}

function requireSupported<T extends string>(supported: readonly T[], label: string): void {
  if (!Array.isArray(supported) || supported.length === 0) {
    throw new RangeError(`${label} must contain at least one size class`);
  }
}

/**
 * Compose's `WindowWidthSizeClass.fromWidth`: walk largest to smallest, return
 * the first supported class whose breakpoint is met, else the smallest
 * supported class. The fallback matters when a caller opts into a restricted
 * set (for example `['medium', 'expanded']`).
 */
export function windowWidthSizeClass(
  widthDp: number,
  supported: readonly WindowWidthSizeClass[] = DEFAULT_WIDTH_SIZE_CLASSES,
): WindowWidthSizeClass {
  requireSize(widthDp, 'widthDp');
  requireSupported(supported, 'supportedWidthSizeClasses');

  let smallestSupported: WindowWidthSizeClass = 'compact';
  for (const sizeClass of WIDTH_ORDER) {
    if (!supported.includes(sizeClass)) continue;
    const breakpoint =
      sizeClass === 'expanded'
        ? WINDOW_WIDTH_BREAKPOINTS.expanded
        : sizeClass === 'medium'
          ? WINDOW_WIDTH_BREAKPOINTS.medium
          : 0;
    if (widthDp >= breakpoint) return sizeClass;
    smallestSupported = sizeClass;
  }
  return smallestSupported;
}

/** Compose's `WindowHeightSizeClass.fromHeight`; breakpoints 480 / 900 dp. */
export function windowHeightSizeClass(
  heightDp: number,
  supported: readonly WindowHeightSizeClass[] = DEFAULT_HEIGHT_SIZE_CLASSES,
): WindowHeightSizeClass {
  requireSize(heightDp, 'heightDp');
  requireSupported(supported, 'supportedHeightSizeClasses');

  let smallestSupported: WindowHeightSizeClass = 'expanded';
  for (const sizeClass of HEIGHT_ORDER) {
    if (!supported.includes(sizeClass)) continue;
    const breakpoint =
      sizeClass === 'expanded'
        ? WINDOW_HEIGHT_BREAKPOINTS.expanded
        : sizeClass === 'medium'
          ? WINDOW_HEIGHT_BREAKPOINTS.medium
          : 0;
    if (heightDp >= breakpoint) return sizeClass;
    smallestSupported = sizeClass;
  }
  return smallestSupported;
}

/** Compose's `WindowSizeClass.calculateFromSize`. */
export function calculateWindowSizeClass(
  size: WindowSize,
  options: {
    supportedWidthSizeClasses?: readonly WindowWidthSizeClass[];
    supportedHeightSizeClasses?: readonly WindowHeightSizeClass[];
  } = {},
): WindowSizeClass {
  return {
    widthSizeClass: windowWidthSizeClass(size.width, options.supportedWidthSizeClasses),
    heightSizeClass: windowHeightSizeClass(size.height, options.supportedHeightSizeClasses),
  };
}

/**
 * The 8 dp spacing rhythm used by the expressive layout guidance. Exposed as a
 * pure helper so layouts can snap to the same grid without importing a theme.
 */
export function snapTo8Dp(valueDp: number): number {
  'worklet';
  return Math.round(valueDp / 8) * 8;
}
