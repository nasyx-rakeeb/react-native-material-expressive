import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parseTokenSource } from './kotlinParser.js';
import { buildModel } from './values.js';
import { check, emit, summarize } from './generate.js';
import { SOURCES, TYPOGRAPHY_DEFAULTS } from './sources.js';
import type { TokenFileSpec } from './types.js';

const root = path.resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const vendor = path.join(root, 'tools/extract-tokens/vendor');
const extracted = path.join(vendor, 'extracted');
const checkMode = process.argv.includes('--check');

/**
 * Pinned expectations for `material3:1.5.0`. Changing the Compose pin means
 * revisiting these numbers in the same commit, which keeps parser regressions
 * from silently shrinking the spec set.
 */
const EXPECTED = {
  tokenFiles: 120,
  tokens: 2671,
  resolvedScalar: 2641,
  composite: 30,
  componentObjects: 104,
  typographyRoles: 30,
  colorRoles: 48,
} as const;

async function sha256(filePath: string): Promise<string> {
  return createHash('sha256')
    .update(await readFile(filePath))
    .digest('hex');
}

async function extractSources(): Promise<void> {
  await mkdir(extracted, { recursive: true });

  for (const source of SOURCES) {
    const jarName = `${source.artifact}-${source.version}-sources.jar`;
    const jarPath = path.join(vendor, jarName);
    let actual: string;
    try {
      actual = await sha256(jarPath);
    } catch {
      throw new Error(
        `missing ${jarName}. Run pnpm --filter @react-native-material-expressive/extract-tokens fetch.`,
      );
    }
    if (actual !== source.sha256) {
      throw new Error(
        `${jarName}: sha256 mismatch (expected ${source.sha256}, got ${actual}). Run pnpm --filter @react-native-material-expressive/extract-tokens fetch.`,
      );
    }

    const target = path.join(extracted, `${source.artifact}-${source.version}`);
    await rm(target, { recursive: true, force: true });
    await mkdir(target, { recursive: true });
    execFileSync('unzip', ['-oq', jarPath, '-d', target], { stdio: 'ignore' });
  }

  // The Android actual for defaultPlatformTextStyle() is not in the common
  // sources JAR. It lives in the multiplatform sources JAR; extract it so the
  // typography defaults are generated from source, not from memory.
  const defaultsJar = path.join(vendor, TYPOGRAPHY_DEFAULTS.fileName);
  let defaultsActual: string;
  try {
    defaultsActual = await sha256(defaultsJar);
  } catch {
    throw new Error(
      `missing ${TYPOGRAPHY_DEFAULTS.fileName}. Run pnpm --filter @react-native-material-expressive/extract-tokens fetch.`,
    );
  }
  if (defaultsActual !== TYPOGRAPHY_DEFAULTS.sha256) {
    throw new Error(
      `${TYPOGRAPHY_DEFAULTS.fileName}: sha256 mismatch (expected ${TYPOGRAPHY_DEFAULTS.sha256}, got ${defaultsActual}).`,
    );
  }
  const defaultsTarget = path.join(extracted, TYPOGRAPHY_DEFAULTS.targetName);
  await rm(defaultsTarget, { recursive: true, force: true });
  await mkdir(defaultsTarget, { recursive: true });
  execFileSync('unzip', ['-oq', defaultsJar, '-d', defaultsTarget], { stdio: 'ignore' });
}

async function loadTokenFiles(): Promise<TokenFileSpec[]> {
  const tokenDir = path.join(
    extracted,
    'material3-1.5.0',
    'commonMain/androidx/compose/material3/tokens',
  );
  const entries = await readdir(tokenDir, { withFileTypes: true });
  const names = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('Tokens.kt'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const files: TokenFileSpec[] = [];
  for (const name of names) {
    const absolute = path.join(tokenDir, name);
    const source = await readFile(absolute, 'utf8');
    const relativePath = `commonMain/androidx/compose/material3/tokens/${name}`;
    const file = parseTokenSource(source, relativePath);

    // Every record must point at the line that declares it. This catches
    // continuation-line accounting mistakes before specs are written.
    const lines = source.split(/\r?\n/);
    for (const token of file.tokens) {
      const line = lines[token.line - 1] ?? '';
      if (!new RegExp(`\\bval\\s+${token.name}\\b`).test(line)) {
        throw new Error(
          `${relativePath}:${token.line} does not declare ${token.name}: ${JSON.stringify(line)}`,
        );
      }
    }

    files.push(file);
  }
  return files;
}

function assertExpected(model: ReturnType<typeof buildModel>): void {
  const actual = {
    tokenFiles: model.counts.tokenFiles,
    tokens: model.counts.tokens,
    resolvedScalar: model.counts.resolvedScalar,
    composite: model.counts.composite,
    componentObjects: Object.keys(model.componentTokens).length,
    typographyRoles: Object.keys(model.global.typography).length,
    colorRoles: Object.keys(model.global.colorLight).length,
  };
  for (const [key, expected] of Object.entries(EXPECTED)) {
    const value = actual[key as keyof typeof actual];
    if (value !== expected) {
      throw new Error(
        `material3:1.5.0 expectation failed for ${key}: expected ${expected}, got ${value}. ` +
          'Update EXPECTED in tools/extract-tokens/src/main.ts only with a deliberate pin change.',
      );
    }
  }
  if (Object.keys(model.global.colorDark).length !== EXPECTED.colorRoles) {
    throw new Error('light and dark color role counts diverged');
  }
  if (model.counts.resolved + model.counts.raw !== model.counts.tokens) {
    throw new Error(
      `resolved + raw must equal tokens: ${model.counts.resolved} + ${model.counts.raw} != ${model.counts.tokens}`,
    );
  }
  if (
    model.counts.resolvedScalar + model.counts.composite + model.counts.raw !==
    model.counts.tokens
  ) {
    throw new Error('resolvedScalar + composite + raw must equal tokens');
  }
}

function printPaths(label: string, paths: string[]): void {
  for (const filePath of paths) {
    console.log(`  ${label} ${path.relative(root, filePath)}`);
  }
}

async function main(): Promise<void> {
  await extractSources();
  const files = await loadTokenFiles();
  const model = buildModel(files);
  assertExpected(model);

  if (checkMode) {
    const result = await check({ root, model });
    if (result.missing.length + result.changed.length + result.extra.length > 0) {
      console.error('spec drift detected:');
      printPaths('missing', result.missing);
      printPaths('changed', result.changed);
      printPaths('stale  ', result.extra);
      console.error(
        'Run pnpm --filter @react-native-material-expressive/extract-tokens extract and commit the result.',
      );
      process.exitCode = 1;
      return;
    }
    console.log('specs and generated TypeScript are up to date');
    return;
  }

  const { specDir, generatedDir, files: written } = await emit({ root, model });
  console.log(summarize(model));
  console.log(`component specs: ${written.length}`);
  console.log(`specs: ${path.relative(root, specDir)}`);
  console.log(`generated: ${path.relative(root, generatedDir)}`);
}

await main();
