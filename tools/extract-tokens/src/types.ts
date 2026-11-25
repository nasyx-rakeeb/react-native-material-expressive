export interface TokenDeclaration {
  /** Compose property name, e.g. `ContainerColor`. */
  name: string;
  /** Declared Kotlin type, when present. */
  declaredType: string | null;
  /** Kotlin expression after `=` or `get() =`, whitespace-normalized. */
  expression: string;
  /** 1-based line of the `val` declaration. */
  line: number;
  isConst: boolean;
  isInline: boolean;
}

export interface TokenFileSpec {
  /** Basename, e.g. `FilledButtonTokens.kt`. */
  fileName: string;
  /** Path inside the sources JAR, e.g. `commonMain/.../tokens/FilledButtonTokens.kt`. */
  relativePath: string;
  packageName: string;
  declarationName: string;
  declarationKind: 'object' | 'class';
  /** Value of the `// VERSION:` marker, when present. */
  version: string | null;
  tokens: TokenDeclaration[];
}

export interface ShapeGeometry {
  type: 'rounded' | 'circle' | 'rectangle';
  topStart?: number;
  topEnd?: number;
  bottomEnd?: number;
  bottomStart?: number;
}

export type ResolvedValue =
  | { kind: 'dp'; value: number }
  | { kind: 'sp'; value: number }
  | { kind: 'number'; value: number }
  | { kind: 'color'; value: string }
  | { kind: 'colorRole'; value: string }
  | { kind: 'shapeKey'; value: string }
  | { kind: 'shape'; value: ShapeGeometry }
  | { kind: 'typographyRole'; value: string }
  | { kind: 'motionKey'; value: string }
  | { kind: 'fontFamily'; value: string }
  | { kind: 'fontWeight'; value: number }
  | { kind: 'cubicBezier'; value: [number, number, number, number] }
  | { kind: 'cornerSize'; value: number }
  | { kind: 'enum'; value: number }
  | { kind: 'reference'; value: string }
  | { kind: 'raw'; value: string };

export interface ExtractedModel {
  files: TokenFileSpec[];
  global: {
    colorLight: Record<string, string>;
    colorDark: Record<string, string>;
    palette: Record<string, string>;
    shape: Record<string, ShapeGeometry>;
    cornerSizes: Record<string, number>;
    elevation: Record<string, number>;
    typography: Record<string, TypographyStyle>;
    motion: {
      durations: Record<string, number>;
      easing: Record<string, [number, number, number, number]>;
      standardSpring: Record<string, SpringSpec>;
      expressiveSpring: Record<string, SpringSpec>;
    };
    state: Record<string, number>;
  };
  keyTokens: {
    color: string[];
    shape: string[];
    typography: string[];
    motion: string[];
  };
  allTokens: Record<string, Record<string, ResolvedValue>>;
  componentTokens: Record<string, Record<string, ResolvedValue>>;
  counts: {
    tokenFiles: number;
    tokens: number;
    /** All declarations, including composite typography styles. */
    resolved: number;
    /** Scalar declarations resolved to a typed value. */
    resolvedScalar: number;
    raw: number;
    composite: number;
  };
}

export interface TypographyStyle {
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
}

export interface SpringSpec {
  damping: number;
  stiffness: number;
}
