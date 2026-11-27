import { readFileSync } from 'node:fs';
import path from 'node:path';

import { resolveM3Theme } from '../../theme/resolveTheme';
import { motion } from '../../tokens/generated/global';
import { REDUCED_EFFECTS_FADE_MS, resolveMotionTiming } from '../motionTiming';
import {
  expressiveMotionScheme,
  resolveMotionScheme,
  standardMotionScheme,
  type MotionSpringToken,
} from '../MotionScheme';
import {
  DefaultSpringVisibilityThreshold,
  springConfig,
  springDurationMillis,
  springMotionAtMillis,
  springValueAtMillis,
} from '../spring';

interface Trace {
  durationMs: number;
  initialVelocity?: number;
  stiffness?: number;
  dampingRatio?: number;
  samples: [number, number][];
}

interface Golden {
  schema: number;
  source: string;
  from: number;
  to: number;
  schemes: Record<'standard' | 'expressive', Record<MotionSpringToken, Trace>>;
  velocityScenarios: (Trace & { name: string; stiffness: number; dampingRatio: number })[];
}

const golden = JSON.parse(
  readFileSync(path.resolve(__dirname, '../../../../../docs/specs/motion/goldens.json'), 'utf8'),
) as Golden;

const TRACE_TOLERANCE = 1e-6;
const EXIT_CRITERION = 0.01;

function expectTraceClose(
  config: ReturnType<typeof springConfig>,
  trace: Trace,
  label: string,
  initialVelocity = 0,
): number {
  const duration = springDurationMillis(config, golden.from, golden.to, initialVelocity);
  if (duration !== trace.durationMs) {
    throw new Error(`${label}: duration ${duration} != Compose ${trace.durationMs}`);
  }

  let worst = 0;
  for (const [ms, expected] of trace.samples) {
    const actual = springMotionAtMillis(config, golden.from, golden.to, initialVelocity, ms).value;
    const delta = Math.abs(actual - expected);
    worst = Math.max(worst, delta);
    if (delta > TRACE_TOLERANCE) {
      throw new Error(`${label} @${ms}ms: expected ${expected}, received ${actual}`);
    }
  }
  return worst;
}

describe('Compose spring golden', () => {
  const schemes = {
    standard: standardMotionScheme,
    expressive: expressiveMotionScheme,
  } as const;

  it('matches all twelve Material3 1.5.0 MotionScheme traces', () => {
    let worst = 0;
    const rows: string[] = [];
    for (const name of ['standard', 'expressive'] as const) {
      const tokens = golden.schemes[name];
      for (const token of Object.keys(tokens) as MotionSpringToken[]) {
        const trace = tokens[token];
        const source = name === 'standard' ? motion.standardSpring : motion.expressiveSpring;
        const expected = source[token];

        // Verify the published token table and the resolved scheme agree with
        // the values observed through Compose's public MotionScheme API.
        expect(trace.stiffness).toBeCloseTo(expected.stiffness, 4);
        expect(trace.dampingRatio).toBeCloseTo(expected.damping, 6);
        const resolved = schemes[name].spring(token);
        expect(resolved.stiffness).toBe(trace.stiffness);
        expect(Math.fround(resolved.dampingRatio)).toBe(Math.fround(trace.dampingRatio as number));

        const delta = expectTraceClose(
          springConfig(trace.stiffness as number, trace.dampingRatio as number),
          trace,
          `${name}.${token}`,
        );
        worst = Math.max(worst, delta);
        rows.push(`${name}.${token}: ${trace.durationMs}ms, max ${delta.toExponential(2)}`);
      }
    }
    // The Day 8 exit criterion is 1% of the animated range.
    expect(worst).toBeLessThanOrEqual(EXIT_CRITERION);
    expect(worst).toBeLessThan(TRACE_TOLERANCE);
    expect(rows).toHaveLength(12);
  });

  it('matches interrupted springs with non-zero initial velocity', () => {
    for (const trace of golden.velocityScenarios) {
      const config = springConfig(trace.stiffness, trace.dampingRatio);
      const velocity = trace.initialVelocity as number;
      expectTraceClose(config, trace, trace.name, velocity);
      // An interrupting spring must not have the same duration as a rest spring.
      expect(trace.durationMs).not.toBe(springDurationMillis(config, golden.from, golden.to, 0));
    }
  });

  it('clamps to the target at the estimated duration', () => {
    const config = springConfig(700, 0.9);
    const duration = springDurationMillis(config, 0, 1, 0);
    expect(springValueAtMillis(config, 0, 1, 0, duration - 1)).toBe(
      springMotionAtMillis(config, 0, 1, 0, duration - 1).value,
    );
    expect(springValueAtMillis(config, 0, 1, 0, duration)).toBe(1);
    expect(springValueAtMillis(config, 0, 1, 0, duration + 16)).toBe(1);
  });

  it('uses Compose spring constants', () => {
    expect(DefaultSpringVisibilityThreshold).toBe(0.01);
    expect(motion.standardSpring.defaultSpatial).toEqual({ damping: 0.9, stiffness: 700 });
    expect(motion.expressiveSpring.fastSpatial).toEqual({ damping: 0.6, stiffness: 800 });
  });
});

describe('MotionScheme', () => {
  it('resolves every kind/speed pair', () => {
    expect(standardMotionScheme.spec('spatial')).toBe(
      standardMotionScheme.spring('defaultSpatial'),
    );
    expect(standardMotionScheme.spec('spatial', 'fast')).toBe(
      standardMotionScheme.spring('fastSpatial'),
    );
    expect(standardMotionScheme.spec('effects', 'slow')).toBe(
      standardMotionScheme.spring('slowEffects'),
    );
    expect(expressiveMotionScheme.spec('effects')).toBe(
      expressiveMotionScheme.spring('defaultEffects'),
    );
  });

  it('defaults to expressive and accepts explicit schemes', () => {
    expect(resolveMotionScheme(undefined)).toBe(expressiveMotionScheme);
    expect(resolveMotionScheme('standard')).toBe(standardMotionScheme);
    expect(resolveMotionScheme('expressive')).toBe(expressiveMotionScheme);
    expect(resolveMotionScheme(standardMotionScheme)).toBe(standardMotionScheme);
  });

  it('is wired through the theme', () => {
    expect(resolveM3Theme({}).motionScheme).toBe(expressiveMotionScheme);
    expect(resolveM3Theme({ motionScheme: 'standard' }).motionScheme).toBe(standardMotionScheme);
    expect(resolveM3Theme({ motionScheme: standardMotionScheme }).motionScheme).toBe(
      standardMotionScheme,
    );
  });
});

describe('reduce-motion mapping', () => {
  const config = springConfig(700, 0.9);

  it('uses the configured spring when motion is allowed', () => {
    expect(resolveMotionTiming('spatial', false, config)).toEqual({
      type: 'spring',
      config,
    });
    expect(resolveMotionTiming('effects', false, config)).toEqual({
      type: 'spring',
      config,
    });
  });

  it('makes spatial motion instant and effects fade over 100 ms', () => {
    expect(resolveMotionTiming('spatial', true, config)).toEqual({ type: 'instant' });
    expect(resolveMotionTiming('effects', true, config)).toEqual({
      type: 'fade',
      durationMs: 100,
    });
    expect(REDUCED_EFFECTS_FADE_MS).toBe(100);
  });
});
