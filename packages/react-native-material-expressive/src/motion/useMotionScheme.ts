import { useM3Theme } from '../theme/M3ThemeProvider';
import { resolveMotionScheme, type MotionScheme, type MotionSchemeName } from './MotionScheme';

/**
 * Read the active theme's motion scheme, or override it for a subtree.
 * Defaults to the expressive scheme outside a provider.
 */
export function useMotionScheme(override?: MotionSchemeName | MotionScheme): MotionScheme {
  const theme = useM3Theme();
  return resolveMotionScheme(override ?? theme.motionScheme);
}
