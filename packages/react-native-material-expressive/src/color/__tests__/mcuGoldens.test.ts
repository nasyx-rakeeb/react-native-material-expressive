import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createColorScheme } from '../generate';
import { M3_COLOR_ROLES, type M3ColorScheme, type M3SchemeVariant } from '../types';

interface GoldenFile {
  schema: number;
  mcuVersion: string;
  specVersion: '2021';
  seeds: string[];
  variants: M3SchemeVariant[];
  contrastLevels: number[];
  schemes: Record<string, Record<string, string>>;
}

const evidenceDir = path.resolve(__dirname, '../../../../../docs/evidence/day4/color');
const goldens = JSON.parse(
  readFileSync(path.join(evidenceDir, 'mcu-goldens.json'), 'utf8'),
) as GoldenFile;

describe('material-color-utilities goldens', () => {
  it('records the expected generator matrix', () => {
    expect(goldens.schema).toBe(1);
    expect(goldens.mcuVersion).toBe('0.4.0');
    expect(goldens.specVersion).toBe('2021');
    expect(goldens.seeds).toHaveLength(6);
    expect(goldens.variants).toHaveLength(9);
    expect(goldens.contrastLevels).toEqual([-1, 0, 0.5, 1]);
    expect(Object.keys(goldens.schemes)).toHaveLength(
      goldens.seeds.length * goldens.variants.length * goldens.contrastLevels.length * 2,
    );
  });

  it('matches every generated role for the full matrix', () => {
    const failures: Array<{
      key: string;
      role: string;
      expected: string;
      actual: string;
    }> = [];

    for (const seed of goldens.seeds) {
      for (const variant of goldens.variants) {
        for (const contrastLevel of goldens.contrastLevels) {
          for (const isDark of [false, true]) {
            const key = `${seed}|${variant}|${isDark ? 'dark' : 'light'}|${contrastLevel}`;
            const expected = goldens.schemes[key];
            expect(expected).toBeDefined();
            if (!expected) continue;
            const actual = createColorScheme({
              seed,
              variant,
              contrastLevel,
              isDark,
              specVersion: '2021',
            });
            for (const role of M3_COLOR_ROLES) {
              if (expected[role] !== actual[role]) {
                failures.push({
                  key,
                  role,
                  expected: expected[role]!,
                  actual: actual[role],
                });
              }
            }
          }
        }
      }
    }

    console.log(
      `MCU goldens: ${Object.keys(goldens.schemes).length} schemes, ` +
        `${failures.length} role mismatches`,
    );
    expect(failures).toEqual([]);
  });

  it('returns the same scheme object from the cache', () => {
    const options = { seed: '#6750A4', variant: 'expressive' as const, isDark: true };
    const first = createColorScheme(options);
    const second = createColorScheme(options);
    expect(second).toBe(first);
  });

  it('keeps fixed roles identical between light and dark', () => {
    const light: M3ColorScheme = createColorScheme({ seed: '#006A6A' });
    const dark: M3ColorScheme = createColorScheme({ seed: '#006A6A', isDark: true });
    for (const role of M3_COLOR_ROLES) {
      if (
        role.endsWith('Fixed') ||
        role.endsWith('FixedDim') ||
        (role.startsWith('on') && role.includes('Fixed'))
      ) {
        expect(dark[role]).toBe(light[role]);
      }
    }
  });
});
