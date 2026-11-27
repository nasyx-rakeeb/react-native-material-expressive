import { MINIMUM_TOUCH_TARGET_DP, resolveHitSlop } from '../touchTarget';

describe('48 dp touch targets', () => {
  it('uses the Material minimum interactive size', () => {
    // material3/InteractiveComponentSize.kt:266-269
    expect(MINIMUM_TOUCH_TARGET_DP).toBe(48);
  });

  it('expands a small visual only through hit slop', () => {
    expect(resolveHitSlop(24, 24)).toEqual({ top: 12, right: 12, bottom: 12, left: 12 });
    expect(resolveHitSlop(40, 24)).toEqual({ top: 12, right: 4, bottom: 12, left: 4 });
  });

  it('does not shrink a visual that is already large enough', () => {
    expect(resolveHitSlop(48, 48)).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    expect(resolveHitSlop(60, 20)).toEqual({ top: 14, right: 0, bottom: 14, left: 0 });
  });

  it('lets callers add slop but never fall below the minimum', () => {
    expect(resolveHitSlop(24, 24, 48, 4)).toEqual({
      top: 12,
      right: 12,
      bottom: 12,
      left: 12,
    });
    expect(resolveHitSlop(48, 48, 48, 8)).toEqual({ top: 8, right: 8, bottom: 8, left: 8 });
    expect(resolveHitSlop(24, 24, 48, { top: 20, left: 2 })).toEqual({
      top: 20,
      right: 12,
      bottom: 12,
      left: 12,
    });
  });

  it('supports a custom minimum without changing the default', () => {
    expect(resolveHitSlop(32, 32, 64)).toEqual({ top: 16, right: 16, bottom: 16, left: 16 });
    expect(MINIMUM_TOUCH_TARGET_DP).toBe(48);
  });
});
