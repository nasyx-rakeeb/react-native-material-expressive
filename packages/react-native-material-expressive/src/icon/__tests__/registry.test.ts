import {
  MATERIAL_SYMBOL_NAMES,
  materialSymbolCodepoint,
  materialSymbolCodepoints,
} from '../materialSymbols';
import { INTERNAL_ICON_NAMES, INTERNAL_ICON_PATHS } from '../paths';

describe('Material Symbols registry', () => {
  it('contains the 90 glyphs in the bundled subset', () => {
    expect(MATERIAL_SYMBOL_NAMES).toHaveLength(90);
    expect(MATERIAL_SYMBOL_NAMES).toContain('check');
    expect(MATERIAL_SYMBOL_NAMES).toContain('arrow_back');
    expect(MATERIAL_SYMBOL_NAMES).toContain('wb_sunny');
  });

  it('has a unique private-use codepoint per glyph', () => {
    const codepoints = Object.values(materialSymbolCodepoints);
    expect(new Set(codepoints).size).toBe(codepoints.length);
    for (const codepoint of codepoints) {
      const code = codepoint.codePointAt(0)!;
      expect(code).toBeGreaterThanOrEqual(0xe000);
      expect(code).toBeLessThanOrEqual(0xf8ff);
    }
  });

  it('looks up a codepoint by name', () => {
    expect(materialSymbolCodepoint('check')).toBe('\ue668');
    expect(materialSymbolCodepoint('close')).toBe('\ue5cd');
  });
});

describe('internal icon paths', () => {
  it('registers a small core set', () => {
    expect(INTERNAL_ICON_NAMES.length).toBeGreaterThanOrEqual(12);
    expect(INTERNAL_ICON_NAMES).toContain('check');
    expect(INTERNAL_ICON_NAMES).toContain('arrow_back');
    expect(INTERNAL_ICON_NAMES).toContain('star');
  });

  it('contains only non-empty absolute path data', () => {
    for (const name of INTERNAL_ICON_NAMES) {
      const paths = INTERNAL_ICON_PATHS[name];
      expect(paths.length).toBeGreaterThan(0);
      for (const path of paths) {
        expect(path.startsWith('M')).toBe(true);
        expect(path).not.toContain('NaN');
        expect(path).not.toContain('undefined');
      }
    }
  });
});
