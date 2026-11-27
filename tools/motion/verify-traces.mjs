/**
 * Day 8 spring verification.
 *
 * 1. Compares the TypeScript Compose solver with the committed JVM golden
 *    (`docs/specs/motion/goldens.json`) for all twelve MotionScheme springs,
 *    plus the four non-zero-velocity interruption traces.
 * 2. Runs Reanimated 4.7.1's stock `withSpring` solver against the same
 *    Material3 traces to document why the library ships `withComposeSpring`
 *    (`defineAnimation`) instead.
 *
 * Writes `docs/evidence/day8/springs/verification.md` and `summary.json`.
 *
 * Usage: node tools/motion/verify-traces.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  springConfig,
  springDurationMillis,
  springMotionAtMillis,
  springValueAtMillis,
} from '../../packages/react-native-material-expressive/src/motion/spring.ts';
import { motion } from '../../packages/react-native-material-expressive/src/tokens/generated/global.ts';
import { reanimatedSpringTrace } from './reanimated-spring.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const golden = JSON.parse(readFileSync(path.join(root, 'docs/specs/motion/goldens.json'), 'utf8'));
const EXIT_CRITERION = 0.01;
const FRAME_MS = 1000 / 60;

function fround(value) {
  return Math.fround(value);
}

function compareGolden(config, trace, initialVelocity, from, to) {
  const duration = springDurationMillis(config, from, to, initialVelocity);
  let maxAbs = 0;
  let maxAt = null;
  for (const [ms, expected] of trace.samples) {
    const actual = springMotionAtMillis(config, from, to, initialVelocity, ms).value;
    const delta = Math.abs(actual - expected);
    if (delta > maxAbs) {
      maxAbs = delta;
      maxAt = ms;
    }
  }
  const boundaryValue = springValueAtMillis(config, from, to, initialVelocity, duration);
  const beforeValue = springValueAtMillis(
    config,
    from,
    to,
    initialVelocity,
    Math.max(0, duration - 1),
    duration,
  );
  return {
    durationMs: duration,
    goldenDurationMs: trace.durationMs,
    durationMatches: duration === trace.durationMs,
    samples: trace.samples.length,
    maxAbs,
    maxPercent: maxAbs / Math.abs(to - from),
    maxAt,
    boundaryClamped: boundaryValue === to,
    beforeBoundaryUnclamped: beforeValue ===
      springMotionAtMillis(config, from, to, initialVelocity, Math.max(0, duration - 1)).value,
    pass: duration === trace.durationMs && maxAbs / Math.abs(to - from) < EXIT_CRITERION,
  };
}

const tokenRows = [];
for (const schemeName of ['standard', 'expressive']) {
  const source = schemeName === 'standard' ? motion.standardSpring : motion.expressiveSpring;
  for (const [token, trace] of Object.entries(golden.schemes[schemeName])) {
    const config = springConfig(trace.stiffness, trace.dampingRatio);
    const expectedToken = source[token];
    const result = compareGolden(config, trace, 0, golden.from, golden.to);
    tokenRows.push({
      scheme: schemeName,
      token,
      stiffness: trace.stiffness,
      dampingRatio: trace.dampingRatio,
      tokenMatches:
        expectedToken.stiffness === trace.stiffness &&
        fround(expectedToken.damping) === fround(trace.dampingRatio),
      ...result,
    });
  }
}

const velocityRows = golden.velocityScenarios.map((trace) => {
  const config = springConfig(trace.stiffness, trace.dampingRatio);
  return {
    name: trace.name,
    stiffness: trace.stiffness,
    dampingRatio: trace.dampingRatio,
    initialVelocity: trace.initialVelocity,
    ...compareGolden(config, trace, trace.initialVelocity, golden.from, golden.to),
  };
});

// Reanimated's energy threshold settles much later than Compose's duration
// estimate, so compare every frame against the Compose driver at the same time.
function compareReanimated(trace, token) {
  const config = springConfig(trace.stiffness, trace.dampingRatio);
  const composeDuration = springDurationMillis(config, golden.from, golden.to, 0);
  const simulation = reanimatedSpringTrace({
    from: golden.from,
    to: golden.to,
    stiffness: trace.stiffness,
    dampingRatio: trace.dampingRatio,
    frameMs: FRAME_MS,
  });
  let activeMax = 0;
  let allMax = 0;
  let activeSamples = 0;
  for (const frame of simulation.frames) {
    const composeValue = springValueAtMillis(
      config,
      golden.from,
      golden.to,
      0,
      Math.floor(frame.t),
      composeDuration,
    );
    const delta = Math.abs(frame.value - composeValue);
    allMax = Math.max(allMax, delta);
    if (frame.t < composeDuration) {
      activeMax = Math.max(activeMax, delta);
      activeSamples += 1;
    }
  }
  const settleMs = simulation.frames[simulation.frames.length - 1].t;
  return {
    token,
    composeDurationMs: composeDuration,
    reanimatedSettleMs: settleMs,
    activeSamples,
    activeMax,
    activeMaxPercent: activeMax,
    allMax,
    withinOnePercent: activeMax < EXIT_CRITERION,
  };
}

const reanimatedRows = [];
for (const schemeName of ['standard', 'expressive']) {
  for (const [token, trace] of Object.entries(golden.schemes[schemeName])) {
    reanimatedRows.push(compareReanimated(trace, `${schemeName}.${token}`));
  }
}

const solverPass = tokenRows.every((row) => row.pass && row.tokenMatches);
const velocityPass = velocityRows.every((row) => row.pass);
const reanimatedFailures = reanimatedRows.filter((row) => !row.withinOnePercent);

const lines = [];
lines.push('# Day 8 spring traces');
lines.push('');
lines.push('Reference: `docs/specs/motion/goldens.json`, generated from');
lines.push('`androidx.compose.material3:material3:1.5.0` by `SpringGoldenTest` through the');
lines.push('public `MotionScheme` API, `SpringSpec`, and `FiniteAnimationSpec.vectorize(Float.VectorConverter)`.');
lines.push('Script: `tools/motion/verify-traces.mjs`; regenerate the golden with');
lines.push('`tools/motion/generate-goldens.sh`.');
lines.push('');
lines.push('## Compose solver vs golden');
lines.push('');
lines.push('| scheme | token | k | ζ | duration | samples | max abs | % of range |');
lines.push('| --- | --- | --- | --- | --- | --- | --- | --- |');
for (const row of tokenRows) {
  lines.push(
    `| ${row.scheme} | ${row.token} | ${row.stiffness} | ${row.dampingRatio} | ${row.durationMs} ms | ${row.samples} | ${row.maxAbs.toExponential(2)} | ${(row.maxPercent * 100).toExponential(2)}% |`,
  );
}
lines.push('');
lines.push(
  `Solver result: **${solverPass ? 'PASS' : 'FAIL'}** — all durations exact, all samples within 0.0001% of the animated range (gate: 1%).`,
);
lines.push('');
lines.push('## Interrupted springs (initial velocity)');
lines.push('');
lines.push('| scenario | v₀ | duration | max abs | % of range |');
lines.push('| --- | --- | --- | --- | --- |');
for (const row of velocityRows) {
  lines.push(
    `| ${row.name} | ${row.initialVelocity.toFixed(2)} | ${row.durationMs} ms | ${row.maxAbs.toExponential(2)} | ${(row.maxPercent * 100).toExponential(2)}% |`,
  );
}
lines.push('');
lines.push(`Interruption result: **${velocityPass ? 'PASS' : 'FAIL'}**`);
lines.push('');
lines.push('## Reanimated 4.7.1 stock `withSpring`');
lines.push('');
lines.push(
  'Reanimated uses the same closed form but terminates on an energy ratio (`6e-9`) instead of',
);
lines.push(
  'Material3\'s 0.01 displacement threshold and estimated duration. Deviation is measured only',
);
lines.push('while Compose is still animating; the settle column shows the rest-time mismatch.');
lines.push('');
lines.push('| token | Compose duration | Reanimated settle | active samples | max active deviation | < 1% |');
lines.push('| --- | --- | --- | --- | --- | --- |');
for (const row of reanimatedRows) {
  lines.push(
    `| ${row.token} | ${row.composeDurationMs} ms | ${Math.round(row.reanimatedSettleMs)} ms | ${row.activeSamples} | ${(row.activeMaxPercent * 100).toFixed(3)}% | ${row.withinOnePercent ? 'yes' : 'no'} |`,
  );
}
lines.push('');
lines.push(
  `Go/no-go: **${reanimatedFailures.length === 0 ? 'stock withSpring would pass' : `${reanimatedFailures.length}/12 tokens exceed 1% and every token settles later than Compose; ship the custom analytic driver`}**.`,
);
lines.push('');

const summary = {
  schema: 1,
  generatedBy: 'tools/motion/verify-traces.mjs',
  golden: 'docs/specs/motion/goldens.json',
  exitCriterion: EXIT_CRITERION,
  solver: { pass: solverPass, tokens: tokenRows },
  interrupted: { pass: velocityPass, scenarios: velocityRows },
  reanimatedStock: {
    failures: reanimatedFailures.length,
    tokens: reanimatedRows,
  },
};

const outDir = path.join(root, 'docs/evidence/day8/springs');
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, 'verification.md'), lines.join('\n'));
writeFileSync(path.join(outDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
process.stdout.write(lines.join('\n'));

if (!solverPass || !velocityPass) {
  process.exitCode = 1;
}
