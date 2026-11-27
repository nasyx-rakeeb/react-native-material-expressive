import { motion } from '../tokens/generated/global';
import { springConfig, type SpringConfig } from './spring';

export type MotionSchemeName = 'standard' | 'expressive';
export type MotionSpeed = 'default' | 'fast' | 'slow';
export type MotionKind = 'spatial' | 'effects';
export type MotionSpringToken =
  | 'defaultSpatial'
  | 'fastSpatial'
  | 'slowSpatial'
  | 'defaultEffects'
  | 'fastEffects'
  | 'slowEffects';

export interface MotionScheme {
  readonly name: MotionSchemeName;
  readonly springs: Readonly<Record<MotionSpringToken, SpringConfig>>;
  /** Resolve one of the six `MotionSchemeKeyTokens` springs. */
  spring(token: MotionSpringToken): SpringConfig;
  /** Resolve by kind and speed, e.g. `spec('spatial', 'fast')`. */
  spec(kind: MotionKind, speed?: MotionSpeed): SpringConfig;
}

const SPRING_TOKENS: readonly MotionSpringToken[] = [
  'defaultSpatial',
  'fastSpatial',
  'slowSpatial',
  'defaultEffects',
  'fastEffects',
  'slowEffects',
];

function createMotionScheme(
  name: MotionSchemeName,
  tokens: typeof motion.standardSpring | typeof motion.expressiveSpring,
): MotionScheme {
  const springs = Object.freeze(
    Object.fromEntries(
      SPRING_TOKENS.map((token) => [
        token,
        springConfig(tokens[token].stiffness, tokens[token].damping),
      ]),
    ) as Record<MotionSpringToken, SpringConfig>,
  );

  return Object.freeze({
    name,
    springs,
    spring: (token: MotionSpringToken) => springs[token],
    spec: (kind: MotionKind, speed: MotionSpeed = 'default') =>
      springs[`${speed}${kind === 'spatial' ? 'Spatial' : 'Effects'}`],
  });
}

/** Compose `MotionScheme.standard()`. */
export const standardMotionScheme: MotionScheme = createMotionScheme(
  'standard',
  motion.standardSpring,
);

/** Compose `MotionScheme.expressive()`, the default for the expressive theme. */
export const expressiveMotionScheme: MotionScheme = createMotionScheme(
  'expressive',
  motion.expressiveSpring,
);

export function resolveMotionScheme(
  scheme: MotionSchemeName | MotionScheme | undefined,
): MotionScheme {
  if (scheme === 'standard') {
    return standardMotionScheme;
  }
  if (scheme === 'expressive' || scheme === undefined) {
    return expressiveMotionScheme;
  }
  return scheme;
}

/** Compose motion duration tokens, in milliseconds. */
export const MotionDurations = motion.durations;

/** Compose cubic-bezier motion easing tokens, as `[x1, y1, x2, y2]`. */
export const MotionEasing = motion.easing;
