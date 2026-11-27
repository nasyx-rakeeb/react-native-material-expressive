#!/usr/bin/env node
/**
 * Motion-kind gate.
 *
 * Every component that animates must:
 *   1. declare each animated property as `spatial` or `effects` in
 *      `docs/specs/interaction/behavior.md` (the "Motion kinds" table);
 *   2. pass a literal `kind` to `useSpring` / `useTimedValue`, or use the
 *      kind-specific `useSpatialSpring` / `useEffectsSpring` wrapper;
 *   3. never call `withTiming` / `withSpring` directly.
 *
 * The declared kinds must equal the kinds used by the component's hooks, so a
 * spatial animation cannot hide behind an `effects` declaration (or the
 * reverse).
 *
 * Run `node tools/motion-kind/check.mjs --self-test` to prove the analyzer
 * fails on an undeclared animation.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const SPEC_FILE = path.join(ROOT, 'docs/specs/interaction/behavior.md');
const SOURCE_DIR = path.join(ROOT, 'packages/react-native-material-expressive/src');
const SKIP_DIRS = new Set(['__tests__', 'motion', 'utils', 'theme', 'color', 'tokens', 'native']);
const RAW_ANIMATIONS = new Set(['withTiming', 'withSpring']);
const KINDS = new Set(['spatial', 'effects']);

function stripTicks(value) {
  return value.replace(/^`|`$/g, '').trim();
}

function parseSpec(text) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === '## Motion kinds');
  if (start === -1) {
    throw new Error('docs/specs/interaction/behavior.md: missing "## Motion kinds" section');
  }
  const rows = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (line.startsWith('## ')) break;
    if (!line.startsWith('|')) continue;
    const cells = line
      .slice(1, line.endsWith('|') ? -1 : undefined)
      .split('|')
      .map((cell) => cell.trim());
    if (cells.length < 4) continue;
    if (cells[0] === 'Component' || /^-+$/.test(cells[0].replaceAll(':', ''))) continue;
    rows.push({
      component: stripTicks(cells[0]),
      property: stripTicks(cells[1]),
      kind: stripTicks(cells[2]),
      source: cells[3],
    });
  }
  if (rows.length === 0) {
    throw new Error('docs/specs/interaction/behavior.md: "Motion kinds" table is empty');
  }
  const components = new Map();
  for (const row of rows) {
    if (!KINDS.has(row.kind)) {
      throw new Error(
        `docs/specs/interaction/behavior.md: ${row.component}.${row.property} has kind "${row.kind}", expected spatial or effects`,
      );
    }
    const entry = components.get(row.component) ?? {
      properties: new Map(),
      kinds: new Set(),
      sources: new Set(),
    };
    entry.properties.set(row.property, row.kind);
    entry.kinds.add(row.kind);
    entry.sources.add(row.source);
    components.set(row.component, entry);
  }
  return components;
}

function findCallEnd(text, openIndex) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = openIndex; index < text.length; index += 1) {
    const char = text[index];
    if (quote !== null) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === "'" || char === '"' || char === '`') {
      quote = char;
      continue;
    }
    if (char === '(') {
      depth += 1;
    } else if (char === ')') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function extractKinds(callText, name, file) {
  if (name === 'useSpatialSpring') return new Set(['spatial']);
  if (name === 'useEffectsSpring') return new Set(['effects']);

  const kindMatch = /(?:^|[,{]\s*)kind\s*:\s*([^,}]+)/m.exec(callText);
  if (!kindMatch) {
    throw new Error(`${file}: ${name}(...) must declare kind: 'spatial' | 'effects'`);
  }
  const expression = kindMatch[1];
  const literals = [...expression.matchAll(/'([^']*)'|"([^"]*)"/g)].map(
    (match) => match[1] ?? match[2],
  );
  if (literals.length === 0) {
    throw new Error(
      `${file}: ${name}(...) kind must be a literal 'spatial' or 'effects', got "${expression.trim()}"`,
    );
  }
  for (const literal of literals) {
    if (!KINDS.has(literal)) {
      throw new Error(`${file}: ${name}(...) kind literal "${literal}" is not spatial or effects`);
    }
  }
  return new Set(literals);
}

function analyzeSource(text, file) {
  const kinds = new Set();
  const errors = [];
  const pattern =
    /\b(useSpring|useTimedValue|useSpatialSpring|useEffectsSpring|withTiming|withSpring)\s*\(/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const name = match[1];
    const openIndex = match.index + match[0].length - 1;
    const endIndex = findCallEnd(text, openIndex);
    if (endIndex === -1) {
      errors.push(`${file}: unterminated ${name}(...) call`);
      continue;
    }
    const callText = text.slice(openIndex, endIndex + 1);
    if (RAW_ANIMATIONS.has(name)) {
      errors.push(
        `${file}: raw ${name}(...) is not allowed; use useSpring/useTimedValue with a declared kind`,
      );
      continue;
    }
    try {
      for (const kind of extractKinds(callText, name, file)) {
        kinds.add(kind);
      }
    } catch (error) {
      errors.push(error.message);
    }
    pattern.lastIndex = endIndex + 1;
  }
  return { kinds, errors };
}

function sourceFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.') || SKIP_DIRS.has(entry)) continue;
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...sourceFiles(full));
    } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
      files.push(full);
    }
  }
  return files;
}

function check({ specFile = SPEC_FILE, sourceDir = SOURCE_DIR, verbose = true } = {}) {
  const declared = parseSpec(readFileSync(specFile, 'utf8'));
  const errors = [];
  const seen = new Set();

  for (const file of sourceFiles(sourceDir)) {
    const relative = path.relative(ROOT, file);
    const text = readFileSync(file, 'utf8');
    const { kinds, errors: sourceErrors } = analyzeSource(text, relative);
    errors.push(...sourceErrors);
    if (kinds.size === 0) continue;

    const component = path.basename(file).replace(/\.(tsx|ts)$/, '');
    seen.add(component);
    const entry = declared.get(component);
    if (!entry) {
      errors.push(
        `${relative}: ${component} animates but has no row in docs/specs/interaction/behavior.md "Motion kinds"`,
      );
      continue;
    }
    for (const kind of kinds) {
      if (!entry.kinds.has(kind)) {
        errors.push(
          `${relative}: ${component} animates with kind "${kind}" but the spec declares only ${[...entry.kinds].join(', ')}`,
        );
      }
    }
    for (const kind of entry.kinds) {
      if (!kinds.has(kind)) {
        errors.push(
          `${relative}: ${component} spec declares "${kind}" but no hook call uses that kind`,
        );
      }
    }
  }

  for (const [component, entry] of declared) {
    if (!seen.has(component)) {
      errors.push(
        `docs/specs/interaction/behavior.md: ${component} has motion-kind rows but no animated source file`,
      );
    }
    if (entry.properties.size === 0) {
      errors.push(`docs/specs/interaction/behavior.md: ${component} has no animated property`);
    }
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`motion-kind: ${error}`);
    }
    return { ok: false, errors };
  }

  if (verbose) {
    const propertyKinds = [...declared.values()].flatMap((entry) => [...entry.properties.values()]);
    const spatial = propertyKinds.filter((kind) => kind === 'spatial').length;
    const effects = propertyKinds.filter((kind) => kind === 'effects').length;
    console.log(
      `motion-kind ok: ${declared.size} components, ${propertyKinds.length} properties (spatial=${spatial}, effects=${effects})`,
    );
  }
  return { ok: true, errors: [] };
}

function selfTest() {
  const cases = [
    {
      name: 'effects tween',
      text: `const x = useTimedValue(1, { kind: 'effects', durationMs: 15 });`,
      kinds: ['effects'],
      errors: 0,
    },
    {
      name: 'spatial spring',
      text: `const x = useSpring(1, { kind: 'spatial', speed: 'fast' });`,
      kinds: ['spatial'],
      errors: 0,
    },
    {
      name: 'conditional focus ring',
      text: `const x = useSpring(1, { kind: visible ? 'spatial' : 'effects' });`,
      kinds: ['spatial', 'effects'],
      errors: 0,
    },
    {
      name: 'missing kind',
      text: `const x = useTimedValue(1, { durationMs: 15 });`,
      kinds: [],
      errors: 1,
    },
    {
      name: 'invalid kind',
      text: `const x = useTimedValue(1, { kind: 'spatialish' });`,
      kinds: [],
      errors: 1,
    },
    {
      name: 'raw animation',
      text: `value.value = withTiming(1, { duration: 15 });`,
      kinds: [],
      errors: 1,
    },
  ];
  const failures = [];
  for (const test of cases) {
    const { kinds, errors } = analyzeSource(test.text, `self-test/${test.name}.tsx`);
    const actualKinds = [...kinds].sort();
    const expectedKinds = [...test.kinds].sort();
    if (errors.length !== test.errors) {
      failures.push(`${test.name}: expected ${test.errors} errors, got ${errors.length}`);
    }
    if (JSON.stringify(actualKinds) !== JSON.stringify(expectedKinds)) {
      failures.push(
        `${test.name}: expected kinds ${expectedKinds.join(',')}, got ${actualKinds.join(',')}`,
      );
    }
  }
  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`motion-kind self-test: ${failure}`);
    }
    return false;
  }
  console.log(`motion-kind self-test ok: ${cases.length} analyzer cases`);
  return true;
}

if (process.argv.includes('--self-test')) {
  process.exit(selfTest() ? 0 : 1);
}

try {
  const result = check();
  process.exit(result.ok ? 0 : 1);
} catch (error) {
  console.error(`motion-kind: ${error.message}`);
  process.exit(1);
}
