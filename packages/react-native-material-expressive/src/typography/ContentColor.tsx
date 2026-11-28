import { createContext, useContext, type ReactNode } from 'react';

import type { M3ColorRole, M3ColorScheme } from '../color/types';
import { useM3Theme } from '../theme/M3ThemeProvider';

/**
 * The nearest content colour, mirroring Compose's `LocalContentColor`.
 *
 * `null` means no provider has set one; consumers fall back to
 * `colorScheme.onSurface`, which is also the `MaterialTheme` default.
 */
const ContentColorContext = createContext<string | null>(null);

export interface ContentColorProviderProps {
  /** Content colour for the subtree. */
  color: string;
  children?: ReactNode;
}

/** Provide a content colour to text and icons in the subtree. */
export function ContentColorProvider({ color, children }: ContentColorProviderProps) {
  return <ContentColorContext.Provider value={color}>{children}</ContentColorContext.Provider>;
}

/** Read the nearest content colour, falling back to `onSurface`. */
export function useContentColor(): string {
  const provided = useContext(ContentColorContext);
  const theme = useM3Theme();
  return provided ?? theme.colorScheme.onSurface;
}

/**
 * Compose's `ColorScheme.contentColorFor` order. Compose checks these roles
 * in a fixed `when` order, so equal-valued roles resolve like Compose rather
 * than by object key order.
 */
const CONTENT_ROLE_ORDER: ReadonlyArray<readonly [M3ColorRole, M3ColorRole]> = [
  ['primary', 'onPrimary'],
  ['secondary', 'onSecondary'],
  ['tertiary', 'onTertiary'],
  ['background', 'onBackground'],
  ['error', 'onError'],
  ['primaryContainer', 'onPrimaryContainer'],
  ['secondaryContainer', 'onSecondaryContainer'],
  ['tertiaryContainer', 'onTertiaryContainer'],
  ['errorContainer', 'onErrorContainer'],
  ['inverseSurface', 'inverseOnSurface'],
  ['surface', 'onSurface'],
  ['surfaceVariant', 'onSurfaceVariant'],
  ['surfaceBright', 'onSurface'],
  ['surfaceContainer', 'onSurface'],
  ['surfaceContainerHigh', 'onSurface'],
  ['surfaceContainerHighest', 'onSurface'],
  ['surfaceContainerLow', 'onSurface'],
  ['surfaceContainerLowest', 'onSurface'],
  ['surfaceDim', 'onSurface'],
  ['primaryFixed', 'onPrimaryFixed'],
  ['primaryFixedDim', 'onPrimaryFixed'],
  ['secondaryFixed', 'onSecondaryFixed'],
  ['secondaryFixedDim', 'onSecondaryFixed'],
  ['tertiaryFixed', 'onTertiaryFixed'],
  ['tertiaryFixedDim', 'onTertiaryFixed'],
];

/**
 * Compose's `ColorScheme.contentColorFor`: map a container colour to its
 * content colour. Returns `undefined` for colours that are not scheme roles
 * (including arbitrary custom colours), matching Compose's
 * `Color.Unspecified` result.
 */
export function contentColorFor(
  scheme: M3ColorScheme,
  backgroundColor: string,
): string | undefined {
  const target = backgroundColor.toLowerCase();
  for (const [containerRole, contentRole] of CONTENT_ROLE_ORDER) {
    if (scheme[containerRole].toLowerCase() === target) {
      return scheme[contentRole];
    }
  }
  return undefined;
}
