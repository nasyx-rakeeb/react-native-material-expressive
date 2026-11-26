// Diagnostic only: generated from docs/evidence/day5/typography/compensation.json.
// These overrides are applied to the RN harness only, never to the shipped theme.
export type TextCompStrategy = 'none' | 'c1' | 'c2' | 'c3' | 'c4';

export interface TextCompOverride {
  sizeSp?: number;
  lineHeightSp?: number;
  letterSpacingSp?: number;
}

export const TEXT_COMPENSATIONS: Record<TextCompStrategy, Record<string, TextCompOverride>> = {
  none: {},
  c1: {
    'type-display-medium': { sizeSp: 44.952 },
    'type-display-medium-emphasized': { sizeSp: 44.952 },
  },
  c2: {
    'type-body-medium': { letterSpacingSp: 0.0059 },
    'type-body-small': { letterSpacingSp: 0.3663 },
    'type-display-large': { letterSpacingSp: -0.4485 },
    'type-display-medium': { sizeSp: 44.952, letterSpacingSp: 0.025 },
    'type-display-small': { letterSpacingSp: -0.1637 },
    'type-headline-medium': { letterSpacingSp: -0.2039 },
    'type-label-large': { letterSpacingSp: 0.0085 },
    'type-label-medium': { letterSpacingSp: 0.4184 },
    'type-title-large': { letterSpacingSp: -0.1979 },
    'type-title-small': { letterSpacingSp: 0.0085 },
    'type-body-medium-emphasized': { letterSpacingSp: 0.1503 },
    'type-body-small-emphasized': { letterSpacingSp: 0.3238 },
    'type-display-large-emphasized': { letterSpacingSp: -0.1526 },
    'type-display-medium-emphasized': { sizeSp: 44.952, letterSpacingSp: -0.0436 },
    'type-display-small-emphasized': { letterSpacingSp: -0.2324 },
    'type-headline-medium-emphasized': { letterSpacingSp: -0.1726 },
    'type-label-large-emphasized': { letterSpacingSp: -0.016 },
    'type-label-medium-emphasized': { letterSpacingSp: 0.3325 },
    'type-label-small-emphasized': { letterSpacingSp: 0.3701 },
    'type-title-large-emphasized': { letterSpacingSp: -0.1454 },
    'type-title-small-emphasized': { letterSpacingSp: -0.016 },
  },
  c3: {
    'type-body-medium': { letterSpacingSp: 0.0059 },
    'type-body-small': { letterSpacingSp: 0.3663 },
    'type-display-large': { letterSpacingSp: -0.4485 },
    'type-display-medium': { sizeSp: 44.952, letterSpacingSp: 0.025 },
    'type-display-small': { letterSpacingSp: -0.1637, lineHeightSp: 43.809524 },
    'type-headline-medium': {
      sizeSp: 27.809143,
      letterSpacingSp: -0.0062,
      lineHeightSp: 35.809524,
    },
    'type-label-large': { letterSpacingSp: 0.0085 },
    'type-label-medium': { letterSpacingSp: 0.4184 },
    'type-title-large': { sizeSp: 21.713905, letterSpacingSp: -0.0003, lineHeightSp: 27.809524 },
    'type-title-small': { letterSpacingSp: 0.0085 },
    'type-body-medium-emphasized': { letterSpacingSp: 0.1503 },
    'type-body-small-emphasized': { letterSpacingSp: 0.3238 },
    'type-display-large-emphasized': { letterSpacingSp: -0.1526 },
    'type-display-medium-emphasized': { sizeSp: 44.952, letterSpacingSp: -0.0436 },
    'type-display-small-emphasized': { letterSpacingSp: -0.2324, lineHeightSp: 43.809524 },
    'type-headline-medium-emphasized': {
      sizeSp: 27.809143,
      letterSpacingSp: 0.0298,
      lineHeightSp: 35.809524,
    },
    'type-label-large-emphasized': { letterSpacingSp: -0.016 },
    'type-label-medium-emphasized': { letterSpacingSp: 0.3325 },
    'type-label-small-emphasized': { letterSpacingSp: 0.3701 },
    'type-title-large-emphasized': {
      sizeSp: 21.713905,
      letterSpacingSp: 0.057,
      lineHeightSp: 27.809524,
    },
    'type-title-small-emphasized': { letterSpacingSp: -0.016 },
  },
  c4: {
    'type-body-medium': { letterSpacingSp: -0.0485 },
    'type-body-small': { letterSpacingSp: 0.2575 },
    'type-display-large': { letterSpacingSp: -0.5029 },
    'type-display-medium': { sizeSp: 44.952, letterSpacingSp: 0.025 },
    'type-display-small': { letterSpacingSp: -0.1637 },
    'type-headline-medium': { letterSpacingSp: -0.2583 },
    'type-label-large': { letterSpacingSp: -0.0459 },
    'type-label-medium': { letterSpacingSp: 0.364 },
    'type-title-large': { letterSpacingSp: -0.1979 },
    'type-title-small': { letterSpacingSp: -0.0459 },
    'type-body-medium-emphasized': { letterSpacingSp: 0.1503 },
    'type-body-small-emphasized': { letterSpacingSp: 0.215 },
    'type-display-large-emphasized': { letterSpacingSp: -0.1526 },
    'type-display-medium-emphasized': { sizeSp: 44.952, letterSpacingSp: -0.0436 },
    'type-display-small-emphasized': { letterSpacingSp: -0.178 },
    'type-headline-medium-emphasized': { letterSpacingSp: -0.1726 },
    'type-label-large-emphasized': { letterSpacingSp: -0.1248 },
    'type-label-medium-emphasized': { letterSpacingSp: 0.2237 },
    'type-label-small-emphasized': { letterSpacingSp: 0.2613 },
    'type-title-large-emphasized': { letterSpacingSp: -0.091 },
    'type-title-small-emphasized': { letterSpacingSp: -0.1248 },
  },
};
