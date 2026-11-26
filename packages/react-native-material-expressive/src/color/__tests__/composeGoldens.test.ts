import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  expressiveLightColorScheme,
  standardDarkColorScheme,
  standardLightColorScheme,
} from '../defaultSchemes';
import {
  COMPOSE_TONES,
  composeSchemeFromTonalPalette,
  type ComposeTonalPalette,
} from '../composeDynamic';
import { M3_COLOR_ROLES, type M3ColorScheme } from '../types';

interface DumpFile {
  schema: number;
  apiLevel: number;
  defaults: Record<'light' | 'dark' | 'expressiveLight', M3ColorScheme>;
  dynamic: {
    light: M3ColorScheme;
    dark: M3ColorScheme;
    tones: TonePalette;
  };
  mapped: Record<string, { light: M3ColorScheme; dark: M3ColorScheme }>;
}

interface PaletteFile {
  schema: number;
  variants: string[];
  palettes: Record<string, TonePalette>;
}

type TonePalette = Record<keyof ComposeTonalPalette, Record<string, string>>;

const evidenceDir = path.resolve(__dirname, '../../../../../docs/evidence/day4/color');
const dump = JSON.parse(
  readFileSync(path.join(evidenceDir, 'compose-dump.json'), 'utf8'),
) as DumpFile;
const paletteFile = JSON.parse(
  readFileSync(path.join(evidenceDir, 'compose-palettes.json'), 'utf8'),
) as PaletteFile;
const nativeDynamic = JSON.parse(
  readFileSync(path.join(evidenceDir, 'native-dynamic-payload.json'), 'utf8'),
) as { light: M3ColorScheme; dark: M3ColorScheme; apiLevel: number; kind: string };

function normalize(palette: TonePalette): ComposeTonalPalette {
  const normalizeRange = (range: Record<string, string>) =>
    Object.fromEntries(
      COMPOSE_TONES.map((tone) => [tone, range[String(tone)]!.toUpperCase()]),
    ) as ComposeTonalPalette['primary'];
  return {
    primary: normalizeRange(palette.primary),
    secondary: normalizeRange(palette.secondary),
    tertiary: normalizeRange(palette.tertiary),
    neutral: normalizeRange(palette.neutral),
    neutralVariant: normalizeRange(palette.neutralVariant),
  };
}

interface Diff {
  role: string;
  expected: string;
  actual: string;
  delta: number;
}

function channelDelta(a: string, b: string): number {
  let max = 0;
  for (let i = 1; i < 7; i += 2) {
    max = Math.max(
      max,
      Math.abs(Number.parseInt(a.slice(i, i + 2), 16) - Number.parseInt(b.slice(i, i + 2), 16)),
    );
  }
  return max;
}

function diff(expected: M3ColorScheme, actual: M3ColorScheme): Diff[] {
  return M3_COLOR_ROLES.flatMap((role) => {
    const delta = channelDelta(expected[role], actual[role]);
    return delta === 0 ? [] : [{ role, expected: expected[role], actual: actual[role], delta }];
  });
}

function summarize(label: string, diffs: Diff[], schemeCount: number) {
  const maxDelta = diffs.reduce((max, entry) => Math.max(max, entry.delta), 0);
  const differingSchemes = new Set(diffs.map((entry) => entry.role)).size;
  console.log(
    `${label}: ${schemeCount} schemes, ${diffs.length} role differences, ` +
      `${differingSchemes} roles, max channel delta ${maxDelta}`,
  );
  if (diffs.length > 0) {
    console.log(diffs.slice(0, 12));
  }
  return { maxDelta, count: diffs.length };
}

describe('Compose colour goldens', () => {
  it('matches the public Compose defaults exactly', () => {
    const cases: Array<[string, M3ColorScheme, M3ColorScheme]> = [
      ['light', standardLightColorScheme(), dump.defaults.light],
      ['dark', standardDarkColorScheme(), dump.defaults.dark],
      ['expressiveLight', expressiveLightColorScheme(), dump.defaults.expressiveLight],
    ];
    for (const [name, actual, expected] of cases) {
      const differences = diff(expected, actual);
      expect({ name, differences }).toEqual({ name, differences: [] });
    }
  });

  it('matches the API 31 device dynamic scheme exactly', () => {
    expect(nativeDynamic.apiLevel).toBe(31);
    expect(nativeDynamic.kind).toBe('tones');
    expect(diff(dump.dynamic.light, nativeDynamic.light)).toEqual([]);
    expect(diff(dump.dynamic.dark, nativeDynamic.dark)).toEqual([]);
  });

  it('matches Compose dynamic tone mapping within one RGB unit', () => {
    const differences = [
      ...diff(
        dump.dynamic.light,
        composeSchemeFromTonalPalette(normalize(dump.dynamic.tones), false),
      ),
      ...diff(
        dump.dynamic.dark,
        composeSchemeFromTonalPalette(normalize(dump.dynamic.tones), true),
      ),
    ];
    summarize('Compose dynamic', differences, 2);
    expect(differences.filter((entry) => entry.delta > 1)).toEqual([]);
  });

  it('matches Compose variant-palette mapping within one RGB unit', () => {
    const differences: Diff[] = [];
    const keys = Object.keys(dump.mapped);
    expect(keys).toHaveLength(Object.keys(paletteFile.palettes).length);
    for (const key of keys) {
      const palette = normalize(paletteFile.palettes[key]!);
      const expected = dump.mapped[key]!;
      differences.push(
        ...diff(expected.light, composeSchemeFromTonalPalette(palette, false)),
        ...diff(expected.dark, composeSchemeFromTonalPalette(palette, true)),
      );
    }
    summarize('Compose variants', differences, keys.length * 2);
    expect(differences.filter((entry) => entry.delta > 1)).toEqual([]);
  });
});
