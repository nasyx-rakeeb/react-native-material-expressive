import { clamp, lerp } from '../math';

describe('clamp', () => {
  it('returns the value when it is inside the range', () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });

  it('clamps below the minimum', () => {
    expect(clamp(-2, 0, 1)).toBe(0);
  });

  it('clamps above the maximum', () => {
    expect(clamp(2, 0, 1)).toBe(1);
  });

  it('handles equal bounds', () => {
    expect(clamp(5, 3, 3)).toBe(3);
  });
});

describe('lerp', () => {
  it('returns the start at t=0', () => {
    expect(lerp(10, 20, 0)).toBe(10);
  });

  it('returns the end at t=1', () => {
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it('returns the midpoint at t=0.5', () => {
    expect(lerp(10, 20, 0.5)).toBe(15);
  });

  it('permits extrapolation', () => {
    expect(lerp(10, 20, 2)).toBe(30);
  });
});
