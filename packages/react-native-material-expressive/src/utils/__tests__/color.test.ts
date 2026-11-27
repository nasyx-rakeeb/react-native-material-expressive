import { colorsEqual, compositeOver, parseHexColor, toHexColor, withAlpha } from '../color';

describe('colour helpers', () => {
  it('parses short and full hex colours', () => {
    expect(parseHexColor('#ABC')).toEqual({ r: 170, g: 187, b: 204, a: 1 });
    expect(parseHexColor('#6750A4')).toEqual({ r: 103, g: 80, b: 164, a: 1 });
    expect(parseHexColor('#6750A480')).toEqual({
      r: 103,
      g: 80,
      b: 164,
      a: 128 / 255,
    });
  });

  it('rejects malformed colours', () => {
    expect(() => parseHexColor('6750A4')).toThrow();
    expect(() => parseHexColor('#6750A')).toThrow();
    expect(() => parseHexColor('#GG50A4')).toThrow();
  });

  it('round-trips to hex', () => {
    expect(toHexColor(parseHexColor('#6750A4'))).toBe('#6750A4');
    expect(toHexColor({ r: 0, g: 0, b: 0, a: 0.5 })).toBe('#00000080');
    expect(toHexColor({ r: 255, g: 255, b: 255, a: 0 })).toBe('#FFFFFF00');
  });

  it('composites in sRGB like Compose Color.compositeOver', () => {
    expect(compositeOver({ r: 0, g: 0, b: 0, a: 0.5 }, { r: 255, g: 255, b: 255, a: 1 })).toEqual({
      r: 127.5,
      g: 127.5,
      b: 127.5,
      a: 1,
    });
    expect(toHexColor(compositeOver(parseHexColor('#6750A4'), parseHexColor('#FEF7FF')))).toBe(
      '#6750A4',
    );
  });

  it('adds alpha and compares colours by channel value', () => {
    expect(withAlpha('#6750A4', 0.5)).toBe('#6750A480');
    expect(withAlpha('#6750A4', 2)).toBe('#6750A4');
    expect(colorsEqual('#fef7ff', '#FEF7FF')).toBe(true);
    expect(colorsEqual('#FFF', '#FFFFFF')).toBe(true);
    expect(colorsEqual('#FEF7FF', '#FEF7FE')).toBe(false);
  });
});
