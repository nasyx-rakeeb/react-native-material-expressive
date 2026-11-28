import {
  directionValue,
  mirrorIconTransform,
  resolveLayoutDirection,
  resolveRowDirection,
  resolveStartEnd,
  resolveTextAlign,
  textWritingDirection,
} from '../rtl';

describe('RTL utilities', () => {
  it('resolves the layout direction from the I18n flag', () => {
    expect(resolveLayoutDirection(false)).toBe('ltr');
    expect(resolveLayoutDirection(true)).toBe('rtl');
  });

  it('chooses direction-specific values', () => {
    expect(directionValue('ltr', 8, 12)).toBe(8);
    expect(directionValue('rtl', 8, 12)).toBe(12);
  });

  it('maps logical start/end to physical left/right', () => {
    expect(resolveStartEnd('ltr', 16, 24)).toEqual({ left: 16, right: 24 });
    expect(resolveStartEnd('rtl', 16, 24)).toEqual({ left: 24, right: 16 });
  });

  it('resolves start/end text alignment and passes physical values through', () => {
    expect(resolveTextAlign('ltr')).toBe('left');
    expect(resolveTextAlign('rtl')).toBe('right');
    expect(resolveTextAlign('ltr', 'end')).toBe('right');
    expect(resolveTextAlign('rtl', 'end')).toBe('left');
    expect(resolveTextAlign('rtl', 'left')).toBe('left');
    expect(resolveTextAlign('rtl', 'center')).toBe('center');
  });

  it('mirrors only in RTL and returns no transform in LTR', () => {
    expect(mirrorIconTransform('ltr')).toBeUndefined();
    expect(mirrorIconTransform('rtl')).toEqual({ transform: [{ scaleX: -1 }] });
  });

  it('flips the explicit row direction for web', () => {
    expect(resolveRowDirection('ltr')).toBe('row');
    expect(resolveRowDirection('rtl')).toBe('row-reverse');
  });

  it('exposes the writing direction', () => {
    expect(textWritingDirection('ltr')).toBe('ltr');
    expect(textWritingDirection('rtl')).toBe('rtl');
  });
});
