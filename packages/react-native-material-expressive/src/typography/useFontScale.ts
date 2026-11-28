import { PixelRatio, useWindowDimensions } from 'react-native';

/**
 * The platform font scale, reactive to window/configuration changes.
 *
 * `useWindowDimensions()` updates on configuration changes (including the
 * system font scale), so the value is read during render rather than cached
 * at module load. `PixelRatio.getFontScale()` is the fallback for platforms
 * that do not include `fontScale` in the window dimensions.
 */
export function useFontScale(): number {
  const { fontScale } = useWindowDimensions();
  return fontScale ?? PixelRatio.getFontScale();
}
