import {
  DEFAULT_HEIGHT_SIZE_CLASSES,
  DEFAULT_WIDTH_SIZE_CLASSES,
  calculateWindowSizeClass,
  snapTo8Dp,
  windowHeightSizeClass,
  windowWidthSizeClass,
} from '../windowSizeClass';

describe('window size classes', () => {
  it('matches the Compose width breakpoints at their inclusive boundaries', () => {
    expect(windowWidthSizeClass(0)).toBe('compact');
    expect(windowWidthSizeClass(599.9)).toBe('compact');
    expect(windowWidthSizeClass(600)).toBe('medium');
    expect(windowWidthSizeClass(839.9)).toBe('medium');
    expect(windowWidthSizeClass(840)).toBe('expanded');
    expect(windowWidthSizeClass(1600)).toBe('expanded');
  });

  it('matches the Compose height breakpoints at their inclusive boundaries', () => {
    expect(windowHeightSizeClass(0)).toBe('compact');
    expect(windowHeightSizeClass(479.9)).toBe('compact');
    expect(windowHeightSizeClass(480)).toBe('medium');
    expect(windowHeightSizeClass(899.9)).toBe('medium');
    expect(windowHeightSizeClass(900)).toBe('expanded');
    expect(windowHeightSizeClass(2400)).toBe('expanded');
  });

  it('reports both axes for a phone, tablet and desktop', () => {
    expect(calculateWindowSizeClass({ width: 412, height: 892 })).toEqual({
      widthSizeClass: 'compact',
      heightSizeClass: 'medium',
    });
    expect(calculateWindowSizeClass({ width: 800, height: 1280 })).toEqual({
      widthSizeClass: 'medium',
      heightSizeClass: 'expanded',
    });
    expect(calculateWindowSizeClass({ width: 1440, height: 900 })).toEqual({
      widthSizeClass: 'expanded',
      heightSizeClass: 'expanded',
    });
  });

  it('honours a restricted supported set using Compose fallback order', () => {
    // Only medium/expanded are supported. Below 600 dp, Compose returns the
    // smallest supported class (medium), not compact.
    expect(windowWidthSizeClass(320, ['medium', 'expanded'])).toBe('medium');
    expect(windowWidthSizeClass(700, ['medium', 'expanded'])).toBe('medium');
    expect(windowWidthSizeClass(900, ['medium', 'expanded'])).toBe('expanded');
    expect(windowWidthSizeClass(900, ['compact'])).toBe('compact');
    expect(windowHeightSizeClass(300, ['medium', 'expanded'])).toBe('medium');
  });

  it('rejects negative and non-finite sizes', () => {
    expect(() => windowWidthSizeClass(-1)).toThrow(RangeError);
    expect(() => windowHeightSizeClass(Number.NaN)).toThrow(TypeError);
    expect(() => windowWidthSizeClass(Number.POSITIVE_INFINITY)).toThrow(TypeError);
  });

  it('rejects an empty supported set', () => {
    expect(() => windowWidthSizeClass(320, [])).toThrow(RangeError);
    expect(() => windowHeightSizeClass(320, [])).toThrow(RangeError);
  });

  it('exports the default sets in Compose order', () => {
    expect(DEFAULT_WIDTH_SIZE_CLASSES).toEqual(['compact', 'medium', 'expanded']);
    expect(DEFAULT_HEIGHT_SIZE_CLASSES).toEqual(['compact', 'medium', 'expanded']);
  });

  it('snaps to the 8 dp expressive grid', () => {
    expect(snapTo8Dp(0)).toBe(0);
    expect(snapTo8Dp(3.9)).toBe(0);
    expect(snapTo8Dp(4)).toBe(8);
    expect(snapTo8Dp(12)).toBe(16);
    expect(snapTo8Dp(16)).toBe(16);
  });
});
