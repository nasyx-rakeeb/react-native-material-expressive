import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

interface SpecRecord {
  token: string;
  value: unknown;
  unit: string;
  source: string;
  sourceVersion: string;
  sourceSha256: string;
}

interface TokensSpec {
  groups: Record<string, SpecRecord[]>;
}

interface TypographyRole {
  role: string;
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  sources: Record<string, string>;
  sourceVersion: string;
  sourceSha256: string;
}

interface TypographySpec {
  roles: TypographyRole[];
}

interface Candidate {
  category: string;
  token: string;
  value: unknown;
  unit: string;
  source: string;
  sourceVersion: string;
  sourceSha256: string;
}

const root = path.resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const seed = process.env.SPOTCHECK_SEED ?? 'm3e-day2-2026-11-25';
const outPath = path.join(root, 'docs/evidence/day2/spotcheck-plan.json');

/** Deterministic PRNG so the published sample can be regenerated exactly. */
function mulberry32(seedValue: number): () => number {
  let state = seedValue >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick(candidates: Candidate[], count: number, random: () => number): Candidate[] {
  const pool = [...candidates].sort((a, b) => a.token.localeCompare(b.token));
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    const current = pool[index];
    const other = pool[swap];
    if (current && other) {
      pool[index] = other;
      pool[swap] = current;
    }
  }
  return pool.slice(0, count);
}

function fromRecord(category: string, record: SpecRecord): Candidate {
  return {
    category,
    token: record.token,
    value: record.value,
    unit: record.unit,
    source: record.source,
    sourceVersion: record.sourceVersion,
    sourceSha256: record.sourceSha256,
  };
}

function isSymmetricShape(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const shape = value as Record<string, unknown>;
  if (shape.type === 'circle' || shape.type === 'rectangle') {
    return true;
  }
  return (
    shape.type === 'rounded' &&
    shape.topStart === shape.topEnd &&
    shape.topEnd === shape.bottomEnd &&
    shape.bottomEnd === shape.bottomStart
  );
}

async function main(): Promise<void> {
  const tokens = JSON.parse(
    await readFile(path.join(root, 'docs/specs/tokens.json'), 'utf8'),
  ) as TokensSpec;
  const typography = JSON.parse(
    await readFile(path.join(root, 'docs/specs/typography.json'), 'utf8'),
  ) as TypographySpec;

  const group = (name: string): SpecRecord[] => {
    const records = tokens.groups[name];
    if (!records) {
      throw new Error(`tokens.json has no group ${name}`);
    }
    return records;
  };

  const typographyCandidates: Candidate[] = typography.roles.flatMap((role) =>
    (['fontSize', 'lineHeight', 'letterSpacing', 'fontWeight'] as const).map((field) => ({
      category: 'typography',
      token: `Typography.${role.role}.${field}`,
      value: role[field],
      unit: field === 'fontWeight' ? 'font-weight' : 'sp',
      source: role.sources[field] ?? '',
      sourceVersion: role.sourceVersion,
      sourceSha256: role.sourceSha256,
    })),
  );

  const colorCandidates = [
    ...group('ColorLightTokens').map((record) => fromRecord('color-light', record)),
    ...group('ColorDarkTokens').map((record) => fromRecord('color-dark', record)),
  ];

  const shapeCandidates = [
    ...group('ShapeTokens')
      .filter((record) => record.unit === 'shape' && isSymmetricShape(record.value))
      .map((record) => fromRecord('shape', record)),
    ...group('ShapeTokens')
      .filter((record) => record.unit === 'corner-size')
      .map((record) => fromRecord('shape', record)),
  ];

  const elevationCandidates = group('ElevationTokens').map((record) =>
    fromRecord('elevation', record),
  );

  const motionCandidates = [
    ...group('MotionTokens').map((record) => fromRecord('motion', record)),
    ...group('StandardMotionTokens').map((record) => fromRecord('motion', record)),
  ];

  const stateCandidates = group('StateTokens').map((record) => fromRecord('state', record));

  const random = mulberry32(hashSeed(seed));
  const picks = [
    ...pick(typographyCandidates, 6, random),
    ...pick(colorCandidates, 6, random),
    ...pick(shapeCandidates, 2, random),
    ...pick(elevationCandidates, 1, random),
    ...pick(motionCandidates, 3, random),
    ...pick(stateCandidates, 2, random),
  ];

  if (picks.length !== 20) {
    throw new Error(`expected 20 picks, got ${picks.length}`);
  }

  const plan = {
    generatedBy: 'tools/extract-tokens/src/spotcheck.ts',
    seed,
    date: '2026-11-25',
    reference: 'https://m3.material.io',
    sampling: {
      typography: `${typographyCandidates.length} role/property pairs, pick 6`,
      color: `${colorCandidates.length} light+dark roles, pick 6`,
      shape: `${shapeCandidates.length} symmetric shape/corner values, pick 2`,
      elevation: `${elevationCandidates.length} levels, pick 1`,
      motion: `${motionCandidates.length} duration/easing/standard-spring values, pick 3`,
      state: `${stateCandidates.length} state opacities, pick 2`,
    },
    picks,
  };

  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, `${JSON.stringify(plan, null, 2)}\n`, 'utf8');
  console.log(`seed: ${seed}`);
  for (const candidate of picks) {
    console.log(
      `${candidate.category.padEnd(12)} ${candidate.token} = ${JSON.stringify(candidate.value)} (${candidate.source})`,
    );
  }
  console.log(`plan: ${path.relative(root, outPath)}`);
}

await main();
