import type {
  ExtractedModel,
  ResolvedValue,
  ShapeGeometry,
  SpringSpec,
  TokenDeclaration,
  TokenFileSpec,
  TypographyStyle,
} from './types.js';

const FONT_FAMILIES: Record<string, string> = {
  Default: 'default',
  SansSerif: 'sans-serif',
  Serif: 'serif',
  Monospace: 'monospace',
  Cursive: 'cursive',
};

const FONT_WEIGHTS: Record<string, number> = {
  Thin: 100,
  ExtraLight: 200,
  Light: 300,
  Normal: 400,
  Medium: 500,
  SemiBold: 600,
  Bold: 700,
  ExtraBold: 800,
  Black: 900,
};

const GLOBAL_OBJECTS = new Set([
  'PaletteTokens',
  'ColorLightTokens',
  'ColorDarkTokens',
  'ShapeTokens',
  'ElevationTokens',
  'TypeScaleTokens',
  'TypefaceTokens',
  'MotionTokens',
  'StandardMotionTokens',
  'ExpressiveMotionTokens',
  'StateTokens',
]);

const COMPOSITE_OBJECTS = new Set(['TypographyTokens']);

const KEY_OBJECTS = new Set([
  'ColorSchemeKeyTokens',
  'ShapeKeyTokens',
  'TypographyKeyTokens',
  'MotionSchemeKeyTokens',
]);

function toCamelCase(value: string): string {
  return value.length === 0 ? value : `${value[0]?.toLowerCase() ?? ''}${value.slice(1)}`;
}

function parseNumber(raw: string): number | null {
  const match = /^(-?\d+(?:\.\d+)?)(?:[fF])?$/.exec(raw.trim());
  if (!match?.[1]) {
    return null;
  }
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

function parseDimension(raw: string, suffix: 'dp' | 'sp'): number | null {
  const match = new RegExp(`^(-?\\d+(?:\\.\\d+)?)\\.${suffix}$`).exec(raw.trim());
  if (!match?.[1]) {
    return null;
  }
  return Number(match[1]);
}

function parseColor(raw: string): string | null {
  const named =
    /^Color\(\s*red\s*=\s*(\d+)\s*,\s*green\s*=\s*(\d+)\s*,\s*blue\s*=\s*(\d+)\s*\)$/.exec(
      raw.trim(),
    );
  if (named) {
    const [, red, green, blue] = named;
    if (!red || !green || !blue) {
      return null;
    }
    const hex = (part: string): string =>
      Math.max(0, Math.min(255, Number(part)))
        .toString(16)
        .padStart(2, '0')
        .toUpperCase();
    return `#${hex(red)}${hex(green)}${hex(blue)}`;
  }

  const argb = /^Color\(\s*0x([0-9A-Fa-f]{8})\s*\)$/.exec(raw.trim());
  if (argb?.[1]) {
    return `#${argb[1].slice(2).toUpperCase()}`;
  }

  return null;
}

function parseCubicBezier(raw: string): [number, number, number, number] | null {
  const match =
    /^CubicBezierEasing\(\s*(-?\d+(?:\.\d+)?)[fF]?\s*,\s*(-?\d+(?:\.\d+)?)[fF]?\s*,\s*(-?\d+(?:\.\d+)?)[fF]?\s*,\s*(-?\d+(?:\.\d+)?)[fF]?\s*\)$/.exec(
      raw.trim(),
    );
  if (!match) {
    return null;
  }
  const values = match.slice(1).map((part) => Number(part));
  if (values.length !== 4 || values.some((value) => !Number.isFinite(value))) {
    return null;
  }
  return [values[0] ?? 0, values[1] ?? 0, values[2] ?? 0, values[3] ?? 0];
}

function parseDimensionArg(raw: string): number | null {
  return parseDimension(raw.trim(), 'dp');
}

function parseRoundedCornerShape(raw: string): ShapeGeometry | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('RoundedCornerShape(') || !trimmed.endsWith(')')) {
    return null;
  }
  const inner = trimmed.slice('RoundedCornerShape('.length, -1).trim();
  if (inner === '') {
    return null;
  }

  if (!inner.includes('=')) {
    const radius = parseDimensionArg(inner);
    if (radius === null) {
      return null;
    }
    return {
      type: 'rounded',
      topStart: radius,
      topEnd: radius,
      bottomEnd: radius,
      bottomStart: radius,
    };
  }

  const corners: Record<string, number> = { topStart: 0, topEnd: 0, bottomEnd: 0, bottomStart: 0 };
  const parts = inner.split(',');
  for (const part of parts) {
    const match = /^\s*(\w+)\s*=\s*(.+?)\s*$/.exec(part);
    if (!match?.[1] || !match[2]) {
      continue;
    }
    const radius = parseDimensionArg(match[2]);
    if (radius === null) {
      continue;
    }
    if (match[1] in corners) {
      corners[match[1]] = radius;
    }
  }

  return {
    type: 'rounded',
    topStart: corners.topStart ?? 0,
    topEnd: corners.topEnd ?? 0,
    bottomEnd: corners.bottomEnd ?? 0,
    bottomStart: corners.bottomStart ?? 0,
  };
}

function parseCallEnum(raw: string): number | null {
  const match = /^(?:ColorToken|ShapeToken|TypographyToken|MotionSchemeToken)\((\d+)\)$/.exec(
    raw.trim(),
  );
  return match?.[1] === undefined ? null : Number(match[1]);
}

function splitReference(raw: string): { object: string; token: string } | null {
  const match = /^([A-Za-z_]\w*)\.([A-Za-z_]\w*)$/.exec(raw.trim());
  if (!match?.[1] || !match[2]) {
    return null;
  }
  return { object: match[1], token: match[2] };
}

export class TokenResolver {
  private readonly declarations = new Map<string, Map<string, TokenDeclaration>>();

  private readonly cache = new Map<string, ResolvedValue>();

  private readonly resolving = new Set<string>();

  constructor(files: TokenFileSpec[]) {
    for (const file of files) {
      const tokens = new Map<string, TokenDeclaration>();
      for (const token of file.tokens) {
        tokens.set(token.name, token);
      }
      this.declarations.set(file.declarationName, tokens);
    }
  }

  resolveToken(objectName: string, tokenName: string): ResolvedValue {
    const key = `${objectName}.${tokenName}`;
    const cached = this.cache.get(key);
    if (cached) {
      return cached;
    }

    const declaration = this.declarations.get(objectName)?.get(tokenName);
    if (!declaration) {
      return { kind: 'reference', value: key };
    }

    if (this.resolving.has(key)) {
      return { kind: 'reference', value: key };
    }

    this.resolving.add(key);
    try {
      const value = this.resolveExpression(declaration.expression, objectName);
      this.cache.set(key, value);
      return value;
    } finally {
      this.resolving.delete(key);
    }
  }

  resolveExpression(expression: string, currentObject: string): ResolvedValue {
    const raw = expression.trim();

    const dp = parseDimension(raw, 'dp');
    if (dp !== null) {
      return { kind: 'dp', value: dp };
    }

    const sp = parseDimension(raw, 'sp');
    if (sp !== null) {
      return { kind: 'sp', value: sp };
    }

    const number = parseNumber(raw);
    if (number !== null) {
      return { kind: 'number', value: number };
    }

    const color = parseColor(raw);
    if (color) {
      return { kind: 'color', value: color };
    }

    const cubicBezier = parseCubicBezier(raw);
    if (cubicBezier) {
      return { kind: 'cubicBezier', value: cubicBezier };
    }

    const roundedShape = parseRoundedCornerShape(raw);
    if (roundedShape) {
      return { kind: 'shape', value: roundedShape };
    }

    if (raw === 'CircleShape') {
      return { kind: 'shape', value: { type: 'circle' } };
    }
    if (raw === 'RectangleShape') {
      return { kind: 'shape', value: { type: 'rectangle' } };
    }

    const cornerSize = /^CornerSize\(\s*(-?\d+(?:\.\d+)?)\.dp\s*\)$/.exec(raw);
    if (cornerSize?.[1]) {
      return { kind: 'cornerSize', value: Number(cornerSize[1]) };
    }

    const callEnum = parseCallEnum(raw);
    if (callEnum !== null) {
      return { kind: 'enum', value: callEnum };
    }

    const fontFamily = /^FontFamily\.([A-Za-z]\w*)$/.exec(raw);
    if (fontFamily?.[1]) {
      return { kind: 'fontFamily', value: FONT_FAMILIES[fontFamily[1]] ?? 'default' };
    }

    const fontWeight = /^FontWeight\.([A-Za-z]\w*)$/.exec(raw);
    if (fontWeight?.[1]) {
      const weight = FONT_WEIGHTS[fontWeight[1]];
      if (weight !== undefined) {
        return { kind: 'fontWeight', value: weight };
      }
    }

    const reference = splitReference(raw);
    if (reference) {
      const { object, token } = reference;

      if (object === 'ColorSchemeKeyTokens') {
        return { kind: 'colorRole', value: token };
      }
      if (object === 'ShapeKeyTokens') {
        return { kind: 'shapeKey', value: token };
      }
      if (object === 'TypographyKeyTokens') {
        return { kind: 'typographyRole', value: token };
      }
      if (object === 'MotionSchemeKeyTokens') {
        return { kind: 'motionKey', value: token };
      }

      if (
        object === 'PaletteTokens' ||
        object === 'ColorLightTokens' ||
        object === 'ColorDarkTokens'
      ) {
        const resolved = this.resolveToken(object, token);
        return resolved.kind === 'color' ? resolved : { kind: 'raw', value: raw };
      }

      if (object === 'ElevationTokens') {
        const resolved = this.resolveToken(object, token);
        return resolved.kind === 'dp' ? resolved : { kind: 'raw', value: raw };
      }

      if (object === 'TypefaceTokens') {
        return this.resolveToken(object, token);
      }

      if (object === 'TypeScaleTokens') {
        return this.resolveToken(object, token);
      }

      if (object === 'ShapeTokens') {
        return this.resolveToken(object, token);
      }

      return { kind: 'reference', value: `${object}.${token}` };
    }

    // A bare identifier can refer to another property in the same object.
    // Compose 1.5.0 uses this once: `SurfaceTint = Primary` in both color files.
    if (this.declarations.get(currentObject)?.has(raw)) {
      return this.resolveToken(currentObject, raw);
    }

    return { kind: 'raw', value: raw };
  }
}

function expectKind<K extends ResolvedValue['kind']>(
  value: ResolvedValue,
  kind: K,
  context: string,
): Extract<ResolvedValue, { kind: K }> {
  if (value.kind !== kind) {
    throw new Error(`${context}: expected ${kind}, got ${value.kind} (${JSON.stringify(value)})`);
  }
  return value as Extract<ResolvedValue, { kind: K }>;
}

function buildTypography(
  resolver: TokenResolver,
  files: TokenFileSpec[],
): Record<string, TypographyStyle> {
  const typeScale = files.find((file) => file.declarationName === 'TypeScaleTokens');
  if (!typeScale) {
    throw new Error('TypeScaleTokens not found');
  }

  const groups = new Map<string, Map<string, TokenDeclaration>>();
  for (const token of typeScale.tokens) {
    const match = /^(.*)(Font|Size|LineHeight|Tracking|Weight)$/.exec(token.name);
    if (!match?.[1] || !match[2]) {
      continue;
    }
    let group = groups.get(match[1]);
    if (!group) {
      group = new Map();
      groups.set(match[1], group);
    }
    group.set(match[2], token);
  }

  const result: Record<string, TypographyStyle> = {};
  for (const [role, group] of groups) {
    const fontToken = group.get('Font');
    const sizeToken = group.get('Size');
    const lineHeightToken = group.get('LineHeight');
    const trackingToken = group.get('Tracking');
    const weightToken = group.get('Weight');
    if (!fontToken || !sizeToken || !lineHeightToken || !trackingToken || !weightToken) {
      throw new Error(`incomplete type scale role ${role}`);
    }

    const fontFamily = expectKind(
      resolver.resolveExpression(fontToken.expression, 'TypeScaleTokens'),
      'fontFamily',
      `${role}.Font`,
    );
    const fontSize = expectKind(
      resolver.resolveExpression(sizeToken.expression, 'TypeScaleTokens'),
      'sp',
      `${role}.Size`,
    );
    const lineHeight = expectKind(
      resolver.resolveExpression(lineHeightToken.expression, 'TypeScaleTokens'),
      'sp',
      `${role}.LineHeight`,
    );
    const letterSpacing = expectKind(
      resolver.resolveExpression(trackingToken.expression, 'TypeScaleTokens'),
      'sp',
      `${role}.Tracking`,
    );
    const fontWeight = expectKind(
      resolver.resolveExpression(weightToken.expression, 'TypeScaleTokens'),
      'fontWeight',
      `${role}.Weight`,
    );

    result[toCamelCase(role)] = {
      fontFamily: fontFamily.value,
      fontWeight: fontWeight.value,
      fontSize: fontSize.value,
      lineHeight: lineHeight.value,
      letterSpacing: letterSpacing.value,
    };
  }

  return result;
}

function buildSprings(
  resolver: TokenResolver,
  objectName: 'StandardMotionTokens' | 'ExpressiveMotionTokens',
): Record<string, SpringSpec> {
  const result: Record<string, SpringSpec> = {};
  for (const tokenName of [
    'DefaultSpatial',
    'FastSpatial',
    'SlowSpatial',
    'DefaultEffects',
    'FastEffects',
    'SlowEffects',
  ]) {
    const damping = expectKind(
      resolver.resolveToken(objectName, `Spring${tokenName}Damping`),
      'number',
      `${objectName}.${tokenName}.Damping`,
    );
    const stiffness = expectKind(
      resolver.resolveToken(objectName, `Spring${tokenName}Stiffness`),
      'number',
      `${objectName}.${tokenName}.Stiffness`,
    );
    result[toCamelCase(tokenName)] = { damping: damping.value, stiffness: stiffness.value };
  }
  return result;
}

export function buildModel(files: TokenFileSpec[]): ExtractedModel {
  const resolver = new TokenResolver(files);

  const palette: Record<string, string> = {};
  const paletteFile = files.find((file) => file.declarationName === 'PaletteTokens');
  if (!paletteFile) {
    throw new Error('PaletteTokens not found');
  }
  for (const token of paletteFile.tokens) {
    const color = expectKind(
      resolver.resolveToken('PaletteTokens', token.name),
      'color',
      token.name,
    );
    palette[toCamelCase(token.name)] = color.value;
  }

  const colorLight: Record<string, string> = {};
  const colorDark: Record<string, string> = {};
  for (const [fileName, target] of [
    ['ColorLightTokens', colorLight],
    ['ColorDarkTokens', colorDark],
  ] as const) {
    const file = files.find((candidate) => candidate.declarationName === fileName);
    if (!file) {
      throw new Error(`${fileName} not found`);
    }
    for (const token of file.tokens) {
      const color = expectKind(resolver.resolveToken(fileName, token.name), 'color', token.name);
      target[toCamelCase(token.name)] = color.value;
    }
  }

  const shape: Record<string, ShapeGeometry> = {};
  const cornerSizes: Record<string, number> = {};
  const shapeFile = files.find((file) => file.declarationName === 'ShapeTokens');
  if (!shapeFile) {
    throw new Error('ShapeTokens not found');
  }
  for (const token of shapeFile.tokens) {
    const value = resolver.resolveToken('ShapeTokens', token.name);
    if (value.kind === 'shape') {
      shape[toCamelCase(token.name)] = value.value;
    } else if (value.kind === 'cornerSize') {
      cornerSizes[toCamelCase(token.name)] = value.value;
    }
  }

  const elevation: Record<string, number> = {};
  const elevationFile = files.find((file) => file.declarationName === 'ElevationTokens');
  if (!elevationFile) {
    throw new Error('ElevationTokens not found');
  }
  for (const token of elevationFile.tokens) {
    const dp = expectKind(resolver.resolveToken('ElevationTokens', token.name), 'dp', token.name);
    elevation[toCamelCase(token.name)] = dp.value;
  }

  const typography = buildTypography(resolver, files);

  const durations: Record<string, number> = {};
  const easing: Record<string, [number, number, number, number]> = {};
  const motionFile = files.find((file) => file.declarationName === 'MotionTokens');
  if (!motionFile) {
    throw new Error('MotionTokens not found');
  }
  for (const token of motionFile.tokens) {
    if (token.name.startsWith('Duration')) {
      const value = expectKind(
        resolver.resolveToken('MotionTokens', token.name),
        'number',
        token.name,
      );
      durations[toCamelCase(token.name.slice('Duration'.length))] = value.value;
    } else if (token.name.startsWith('Easing')) {
      const value = expectKind(
        resolver.resolveToken('MotionTokens', token.name),
        'cubicBezier',
        token.name,
      );
      easing[toCamelCase(token.name.slice('Easing'.length, -'CubicBezier'.length))] = value.value;
    }
  }

  const state: Record<string, number> = {};
  const stateFile = files.find((file) => file.declarationName === 'StateTokens');
  if (!stateFile) {
    throw new Error('StateTokens not found');
  }
  for (const token of stateFile.tokens) {
    const match = /^(Dragged|Focus|Hover|Pressed)StateLayerOpacity$/.exec(token.name);
    if (!match?.[1]) {
      continue;
    }
    const value = expectKind(
      resolver.resolveToken('StateTokens', token.name),
      'number',
      token.name,
    );
    state[toCamelCase(match[1])] = value.value;
  }

  const keyTokens = {
    color:
      files
        .find((file) => file.declarationName === 'ColorSchemeKeyTokens')
        ?.tokens.map((token) => token.name) ?? [],
    shape:
      files
        .find((file) => file.declarationName === 'ShapeKeyTokens')
        ?.tokens.map((token) => token.name) ?? [],
    typography:
      files
        .find((file) => file.declarationName === 'TypographyKeyTokens')
        ?.tokens.map((token) => token.name) ?? [],
    motion:
      files
        .find((file) => file.declarationName === 'MotionSchemeKeyTokens')
        ?.tokens.map((token) => token.name) ?? [],
  };

  const allTokens: Record<string, Record<string, ResolvedValue>> = {};
  const componentTokens: Record<string, Record<string, ResolvedValue>> = {};
  let tokenCount = 0;
  let resolvedScalarCount = 0;
  let rawCount = 0;
  let compositeCount = 0;

  for (const file of files) {
    tokenCount += file.tokens.length;
    const tokens: Record<string, ResolvedValue> = {};
    const isComposite = COMPOSITE_OBJECTS.has(file.declarationName);
    for (const token of file.tokens) {
      const value = resolver.resolveToken(file.declarationName, token.name);
      tokens[token.name] = value;
      if (isComposite) {
        compositeCount += 1;
      } else if (value.kind === 'raw') {
        rawCount += 1;
      } else {
        resolvedScalarCount += 1;
      }
    }
    allTokens[file.declarationName] = tokens;

    if (GLOBAL_OBJECTS.has(file.declarationName) || isComposite) {
      continue;
    }
    if (KEY_OBJECTS.has(file.declarationName)) {
      continue;
    }

    componentTokens[file.declarationName] = tokens;
  }

  return {
    files,
    global: {
      colorLight,
      colorDark,
      palette,
      shape,
      cornerSizes,
      elevation,
      typography,
      motion: {
        durations,
        easing,
        standardSpring: buildSprings(resolver, 'StandardMotionTokens'),
        expressiveSpring: buildSprings(resolver, 'ExpressiveMotionTokens'),
      },
      state,
    },
    keyTokens,
    allTokens,
    componentTokens,
    counts: {
      tokenFiles: files.length,
      tokens: tokenCount,
      // `resolved` counts every declaration. The 30 TypographyTokens entries
      // are resolved as composite TextStyles, so they are not "raw".
      resolved: resolvedScalarCount + compositeCount,
      resolvedScalar: resolvedScalarCount,
      raw: rawCount,
      composite: compositeCount,
    },
  };
}
