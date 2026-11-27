import { RIPPLE, rippleFrameAt, rippleGeometry, rippleRadiusAt } from '../rippleGeometry';
import { fastOutSlowIn } from '../../utils/easing';

describe('ripple geometry', () => {
  it('uses the Compose start and end radii', () => {
    // material3-ripple/ripple/RippleAnimation.kt:157-174
    expect(RIPPLE.startRadiusFactor).toBe(0.3);
    expect(RIPPLE.boundedExtraRadiusDp).toBe(10);
    expect(RIPPLE.fadeInMs).toBe(75);
    expect(RIPPLE.radiusMs).toBe(225);
    expect(RIPPLE.fadeOutMs).toBe(150);

    const geometry = rippleGeometry(100, 50);
    expect(geometry.startRadius).toBeCloseTo(30, 10);
    expect(geometry.endRadius).toBeCloseTo(Math.hypot(100, 50) / 2 + 10, 10);
    expect(geometry.originX).toBe(50);
    expect(geometry.originY).toBe(25);
  });

  it('keeps an unbounded ripple inside the component radius and centred', () => {
    const geometry = rippleGeometry(100, 50, 10, 20, false);
    expect(geometry.endRadius).toBeCloseTo(Math.hypot(100, 50) / 2, 10);
    expect(geometry.originX).toBe(50);
    expect(geometry.originY).toBe(25);
  });

  it('keeps a bounded ripple at the press origin', () => {
    const geometry = rippleGeometry(100, 50, 10, 20, true);
    expect(geometry.originX).toBe(10);
    expect(geometry.originY).toBe(20);
    expect(geometry.centerX).toBe(50);
    expect(geometry.centerY).toBe(25);
  });

  it('interpolates the radius linearly in the eased progress domain', () => {
    const geometry = rippleGeometry(100, 50);
    expect(rippleRadiusAt(0, geometry)).toBeCloseTo(geometry.startRadius, 10);
    expect(rippleRadiusAt(1, geometry)).toBeCloseTo(geometry.endRadius, 10);
    expect(rippleRadiusAt(0.5, geometry)).toBeCloseTo(
      (geometry.startRadius + geometry.endRadius) / 2,
      10,
    );
  });

  it('computes a deterministic static frame', () => {
    const geometry = rippleGeometry(100, 50, 10, 20);
    const start = rippleFrameAt(0, geometry);
    expect(start.radius).toBeCloseTo(geometry.startRadius, 10);
    expect(start.centerX).toBe(10);
    expect(start.centerY).toBe(20);
    expect(start.alpha).toBe(0);

    const end = rippleFrameAt(1, geometry);
    expect(end.radius).toBeCloseTo(geometry.endRadius, 10);
    expect(end.centerX).toBe(50);
    expect(end.centerY).toBe(25);
    expect(end.alpha).toBe(1);

    const half = rippleFrameAt(0.5, geometry);
    expect(half.alpha).toBe(1);
    expect(half.centerX).toBe(30);
    expect(half.radius).toBeGreaterThan(geometry.startRadius);
    expect(half.radius).toBeLessThan(geometry.endRadius);
  });

  it('evaluates FastOutSlowIn with the Compose control points', () => {
    expect(fastOutSlowIn(0)).toBe(0);
    expect(fastOutSlowIn(1)).toBe(1);
    expect(fastOutSlowIn(0.5)).toBeCloseTo(0.775561313022294, 10);
    expect(fastOutSlowIn(0.5)).toBeLessThan(0.8);
    expect(fastOutSlowIn(0.25)).toBeLessThan(fastOutSlowIn(0.75));
  });
});
