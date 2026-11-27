import {
  ELEVATION_LEVELS,
  elevationLevelToDp,
  elevationToIosShadow,
  resolveSurfaceColor,
  surfaceColorAtElevation,
} from '../elevation';

describe('elevation tokens', () => {
  it('matches Compose ElevationTokens.Level0..Level5', () => {
    // material3/tokens/ElevationTokens.kt:23-41
    expect(ELEVATION_LEVELS).toEqual([0, 1, 3, 6, 8, 12]);
    expect([0, 1, 2, 3, 4, 5].map((level) => elevationLevelToDp(level as 0))).toEqual([
      0, 1, 3, 6, 8, 12,
    ]);
  });

  it('returns the surface unchanged at level 0', () => {
    expect(surfaceColorAtElevation('#FEF7FF', '#6750A4', 0)).toBe('#FEF7FF');
  });

  it('applies the Compose tonal alpha formula', () => {
    // ColorScheme.kt:1157-1160, alpha = ((4.5 * ln(e + 1)) + 2) / 100.
    // Expected values are the sRGB composite of surfaceTint over surface.
    expect(surfaceColorAtElevation('#FEF7FF', '#6750A4', 1)).toBe('#F6EEFA');
    expect(surfaceColorAtElevation('#FEF7FF', '#6750A4', 3)).toBe('#F2E9F8');
    expect(surfaceColorAtElevation('#FEF7FF', '#6750A4', 6)).toBe('#EEE5F5');
    expect(surfaceColorAtElevation('#FEF7FF', '#6750A4', 8)).toBe('#ECE3F4');
    expect(surfaceColorAtElevation('#FEF7FF', '#6750A4', 12)).toBe('#EAE0F3');
  });

  it('applies tonal elevation only to the surface role', () => {
    // Surface.kt applies surfaceColorAtElevation only when the container
    // colour equals ColorScheme.surface.
    expect(resolveSurfaceColor('#FEF7FF', '#FEF7FF', '#6750A4', 6)).toBe('#EEE5F5');
    expect(resolveSurfaceColor('#6750A4', '#FEF7FF', '#6750A4', 6)).toBe('#6750A4');
    expect(resolveSurfaceColor('#FEF7FF', '#FEF7FF', '#6750A4', 0)).toBe('#FEF7FF');
    expect(resolveSurfaceColor('#fef7ff', '#FEF7FF', '#6750A4', 1)).toBe('#F6EEFA');
  });

  it('returns no iOS shadow at level 0 and a documented approximation above it', () => {
    expect(elevationToIosShadow(0)).toEqual({
      shadowColor: '#000000',
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
    });
    const shadow = elevationToIosShadow(6);
    expect(shadow.shadowOpacity).toBeGreaterThan(0);
    expect(shadow.shadowRadius).toBe(9);
    expect(shadow.shadowOffset.height).toBe(3);
  });
});
