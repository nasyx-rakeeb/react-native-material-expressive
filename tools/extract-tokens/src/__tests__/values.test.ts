import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { TokenResolver } from '../values.js';
import type { TokenDeclaration, TokenFileSpec } from '../types.js';

function token(
  name: string,
  expression: string,
  overrides: Partial<TokenDeclaration> = {},
): TokenDeclaration {
  return {
    name,
    declaredType: null,
    expression,
    line: 1,
    isConst: false,
    isInline: false,
    ...overrides,
  };
}

function file(declarationName: string, tokens: TokenDeclaration[]): TokenFileSpec {
  return {
    fileName: `${declarationName}.kt`,
    relativePath: `tokens/${declarationName}.kt`,
    packageName: 'androidx.compose.material3.tokens',
    declarationName,
    declarationKind: 'object',
    version: null,
    tokens,
  };
}

describe('TokenResolver.resolveExpression', () => {
  const resolver = new TokenResolver([
    file('ElevationTokens', [token('Level0', '0.0.dp'), token('Level3', '6.0.dp')]),
    file('TypefaceTokens', [
      token('Plain', 'FontFamily.SansSerif'),
      token('WeightMedium', 'FontWeight.Medium'),
    ]),
    file('ColorLightTokens', [token('Primary', 'PaletteTokens.Primary40')]),
    file('PaletteTokens', [token('Primary40', 'Color(red = 103, green = 80, blue = 164)')]),
    file('SelfTokens', [token('Alias', 'Primary'), token('Primary', 'PaletteTokens.Primary40')]),
    file('CycleTokens', [token('A', 'CycleTokens.B'), token('B', 'CycleTokens.A')]),
  ]);

  it('parses dimensions, numbers, colors, shapes, and corner sizes', () => {
    assert.deepEqual(resolver.resolveExpression('40.0.dp', 'X'), { kind: 'dp', value: 40 });
    assert.deepEqual(resolver.resolveExpression('16.sp', 'X'), { kind: 'sp', value: 16 });
    assert.deepEqual(resolver.resolveExpression('0.1f', 'X'), { kind: 'number', value: 0.1 });
    assert.deepEqual(resolver.resolveExpression('Color(red = 103, green = 80, blue = 164)', 'X'), {
      kind: 'color',
      value: '#6750A4',
    });
    assert.deepEqual(resolver.resolveExpression('Color(0xFF6750A4)', 'X'), {
      kind: 'color',
      value: '#6750A4',
    });
    assert.deepEqual(resolver.resolveExpression('RoundedCornerShape(12.0.dp)', 'X'), {
      kind: 'shape',
      value: { type: 'rounded', topStart: 12, topEnd: 12, bottomEnd: 12, bottomStart: 12 },
    });
    assert.deepEqual(
      resolver.resolveExpression(
        'RoundedCornerShape(topStart = 4.0.dp, topEnd = 8.0.dp, bottomEnd = 12.0.dp, bottomStart = 16.0.dp)',
        'X',
      ),
      {
        kind: 'shape',
        value: { type: 'rounded', topStart: 4, topEnd: 8, bottomEnd: 12, bottomStart: 16 },
      },
    );
    assert.deepEqual(resolver.resolveExpression('CircleShape', 'X'), {
      kind: 'shape',
      value: { type: 'circle' },
    });
    assert.deepEqual(resolver.resolveExpression('CornerSize(48.0.dp)', 'X'), {
      kind: 'cornerSize',
      value: 48,
    });
  });

  it('resolves key-token references by role, not by value', () => {
    assert.deepEqual(resolver.resolveExpression('ColorSchemeKeyTokens.Primary', 'X'), {
      kind: 'colorRole',
      value: 'Primary',
    });
    assert.deepEqual(resolver.resolveExpression('ShapeKeyTokens.CornerMedium', 'X'), {
      kind: 'shapeKey',
      value: 'CornerMedium',
    });
    assert.deepEqual(resolver.resolveExpression('TypographyKeyTokens.BodyLarge', 'X'), {
      kind: 'typographyRole',
      value: 'BodyLarge',
    });
    assert.deepEqual(resolver.resolveExpression('MotionSchemeKeyTokens.DefaultSpatial', 'X'), {
      kind: 'motionKey',
      value: 'DefaultSpatial',
    });
  });

  it('follows token references through global objects', () => {
    assert.deepEqual(resolver.resolveExpression('ElevationTokens.Level3', 'X'), {
      kind: 'dp',
      value: 6,
    });
    assert.deepEqual(resolver.resolveExpression('TypefaceTokens.Plain', 'X'), {
      kind: 'fontFamily',
      value: 'sans-serif',
    });
    assert.deepEqual(resolver.resolveExpression('TypefaceTokens.WeightMedium', 'X'), {
      kind: 'fontWeight',
      value: 500,
    });
    assert.deepEqual(resolver.resolveExpression('ColorLightTokens.Primary', 'X'), {
      kind: 'color',
      value: '#6750A4',
    });
    assert.deepEqual(resolver.resolveExpression('Primary', 'SelfTokens'), {
      kind: 'color',
      value: '#6750A4',
    });
  });

  it('returns references for cycles instead of looping', () => {
    assert.deepEqual(resolver.resolveExpression('CycleTokens.A', 'X'), {
      kind: 'reference',
      value: 'CycleTokens.A',
    });
  });

  it('keeps unknown expressions visible as raw', () => {
    assert.deepEqual(resolver.resolveExpression('DefaultTextStyle.copy(fontSize = 1.sp)', 'X'), {
      kind: 'raw',
      value: 'DefaultTextStyle.copy(fontSize = 1.sp)',
    });
  });
});
