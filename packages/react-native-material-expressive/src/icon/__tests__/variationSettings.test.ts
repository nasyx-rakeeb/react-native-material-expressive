import { materialSymbolVariationSettings, resolveMaterialSymbolAxes } from '../variationSettings';

const supported = { supported: true, reason: 'supported' } as const;
const unsupported = {
  supported: false,
  reason: 'android-api-too-old',
  androidApiLevel: 25,
} as const;

describe('Material Symbols axes', () => {
  it('uses the font defaults', () => {
    const axes = resolveMaterialSymbolAxes({}, supported);
    expect(axes).toMatchObject({ fill: 0, weight: 400, grade: 0, opticalSize: 24 });
    expect(axes.fontVariationSettings).toBe("'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24");
    expect(axes.applied).toBe(true);
  });

  it('passes all four axes in the order RN expects', () => {
    expect(
      materialSymbolVariationSettings({ fill: 1, weight: 500, grade: 200, opticalSize: 48 }),
    ).toBe("'FILL' 1, 'wght' 500, 'GRAD' 200, 'opsz' 48");
  });

  it('clamps to the upstream fvar ranges and rounds', () => {
    const axes = resolveMaterialSymbolAxes(
      { weight: 50, grade: -500, opticalSize: 100 },
      supported,
    );
    expect(axes.weight).toBe(100);
    expect(axes.grade).toBe(-50);
    expect(axes.opticalSize).toBe(48);
    expect(resolveMaterialSymbolAxes({ weight: 499.6 }, supported).weight).toBe(500);
    expect(resolveMaterialSymbolAxes({ fill: 1 }, supported).fill).toBe(1);
    expect(resolveMaterialSymbolAxes({ fill: 0 }, supported).fill).toBe(0);
  });

  it('reports that an old Android runtime will not apply the axes', () => {
    const axes = resolveMaterialSymbolAxes({ fill: 1 }, unsupported);
    expect(axes.applied).toBe(false);
    expect(axes.fontVariationSettings).toContain("'FILL' 1");
    expect(axes.support.reason).toBe('android-api-too-old');
  });
});
