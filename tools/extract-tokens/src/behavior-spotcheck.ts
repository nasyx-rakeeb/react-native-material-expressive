import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const evidenceDir = path.join(root, 'docs/evidence/day2');
const m3Dir = path.join(evidenceDir, 'm3');

interface TokenRecord {
  token: string;
  value: unknown;
  unit: string;
  source: string;
  sourceVersion: string;
  sourceSha256: string;
}

interface SpecFile {
  tokens: TokenRecord[];
}

interface M3Buttons {
  source: string;
  capturedAt: string;
  tokens: Record<string, { kind: string; value: number; unit: string }>;
}

interface Pick {
  category: 'component-size' | 'component-padding' | 'shape' | 'spring';
  composeToken: string;
  specFile: string;
  m3: { kind: 'button-token'; token: string } | { kind: 'text-row'; file: string; label: string };
}

const PICKS: Pick[] = [
  {
    category: 'component-size',
    composeToken: 'ButtonSmall.ContainerHeight',
    specFile: 'button-small.json',
    m3: { kind: 'button-token', token: 'md.comp.button.small.container.height' },
  },
  {
    category: 'component-padding',
    composeToken: 'ButtonSmall.LeadingSpace',
    specFile: 'button-small.json',
    m3: { kind: 'button-token', token: 'md.comp.button.small.leading-space' },
  },
  {
    category: 'component-padding',
    composeToken: 'ButtonSmall.IconLabelSpace',
    specFile: 'button-small.json',
    m3: { kind: 'button-token', token: 'md.comp.button.small.icon-label-space' },
  },
  {
    category: 'component-size',
    composeToken: 'ButtonMedium.ContainerHeight',
    specFile: 'button-medium.json',
    m3: { kind: 'button-token', token: 'md.comp.button.medium.container.height' },
  },
  {
    category: 'component-padding',
    composeToken: 'ButtonMedium.LeadingSpace',
    specFile: 'button-medium.json',
    m3: { kind: 'button-token', token: 'md.comp.button.medium.leading-space' },
  },
  {
    category: 'component-size',
    composeToken: 'ButtonMedium.IconSize',
    specFile: 'button-medium.json',
    m3: { kind: 'button-token', token: 'md.comp.button.medium.icon.size' },
  },
  {
    category: 'component-size',
    composeToken: 'ButtonLarge.ContainerHeight',
    specFile: 'button-large.json',
    m3: { kind: 'button-token', token: 'md.comp.button.large.container.height' },
  },
  {
    category: 'component-padding',
    composeToken: 'ButtonLarge.LeadingSpace',
    specFile: 'button-large.json',
    m3: { kind: 'button-token', token: 'md.comp.button.large.leading-space' },
  },
  {
    category: 'component-padding',
    composeToken: 'ButtonLarge.IconLabelSpace',
    specFile: 'button-large.json',
    m3: { kind: 'button-token', token: 'md.comp.button.large.icon-label-space' },
  },
  {
    category: 'component-size',
    composeToken: 'ButtonXLarge.ContainerHeight',
    specFile: 'button-x-large.json',
    m3: { kind: 'button-token', token: 'md.comp.button.xlarge.container.height' },
  },
  {
    category: 'component-padding',
    composeToken: 'ButtonXLarge.LeadingSpace',
    specFile: 'button-x-large.json',
    m3: { kind: 'button-token', token: 'md.comp.button.xlarge.leading-space' },
  },
  {
    category: 'component-size',
    composeToken: 'ButtonXSmall.ContainerHeight',
    specFile: 'button-x-small.json',
    m3: { kind: 'button-token', token: 'md.comp.button.xsmall.container.height' },
  },
  {
    category: 'component-padding',
    composeToken: 'ButtonXSmall.LeadingSpace',
    specFile: 'button-x-small.json',
    m3: { kind: 'button-token', token: 'md.comp.button.xsmall.leading-space' },
  },
  {
    category: 'component-padding',
    composeToken: 'ButtonXSmall.TrailingSpace',
    specFile: 'button-x-small.json',
    m3: { kind: 'button-token', token: 'md.comp.button.xsmall.trailing-space' },
  },
  {
    category: 'component-padding',
    composeToken: 'ButtonXSmall.IconLabelSpace',
    specFile: 'button-x-small.json',
    m3: { kind: 'button-token', token: 'md.comp.button.xsmall.icon-label-space' },
  },
  {
    category: 'shape',
    composeToken: 'Shape.CornerExtraSmall',
    specFile: 'tokens.json',
    m3: {
      kind: 'text-row',
      file: 'shape-corner-radius-scale.txt',
      label: 'Extra small corner value',
    },
  },
  {
    category: 'shape',
    composeToken: 'Shape.CornerMedium',
    specFile: 'tokens.json',
    m3: { kind: 'text-row', file: 'shape-corner-radius-scale.txt', label: 'Medium corner value' },
  },
  {
    category: 'shape',
    composeToken: 'Shape.CornerLarge',
    specFile: 'tokens.json',
    m3: { kind: 'text-row', file: 'shape-corner-radius-scale.txt', label: 'Large corner value' },
  },
  {
    category: 'spring',
    composeToken: 'StandardMotion.SpringFastSpatialDamping',
    specFile: 'tokens.json',
    m3: {
      kind: 'text-row',
      file: 'motion-easing-duration-tokens.txt',
      label: 'Motion spring fast spatial damping',
    },
  },
  {
    category: 'spring',
    composeToken: 'StandardMotion.SpringDefaultEffectsStiffness',
    specFile: 'tokens.json',
    m3: {
      kind: 'text-row',
      file: 'motion-easing-duration-tokens.txt',
      label: 'Motion spring default effects stiffness',
    },
  },
];

function findCompose(records: TokenRecord[], token: string): TokenRecord {
  const record = records.find((candidate) => candidate.token === token);
  if (!record) {
    throw new Error(`missing Compose token ${token}`);
  }
  return record;
}

function numericCompose(record: TokenRecord): number {
  if (typeof record.value === 'number') {
    return record.value;
  }
  if (
    record.value &&
    typeof record.value === 'object' &&
    'topStart' in record.value &&
    typeof (record.value as { topStart: unknown }).topStart === 'number'
  ) {
    return (record.value as { topStart: number }).topStart;
  }
  throw new Error(`cannot compare non-numeric value for ${record.token}`);
}

function textRowValue(text: string, label: string): number {
  const lines = text.split(/\r?\n/);
  const index = lines.findIndex((line) => line.trim() === label);
  if (index < 1) {
    throw new Error(`m3 text row not found: ${label}`);
  }
  const previous = lines[index - 1]?.trim() ?? '';
  const match = /^(-?\d+(?:\.\d+)?)(?:dp)?$/.exec(previous);
  if (!match?.[1]) {
    throw new Error(`m3 value before "${label}" is not numeric: ${JSON.stringify(previous)}`);
  }
  return Number(match[1]);
}

const [buttonsText, shapeText, motionText] = await Promise.all([
  readFile(path.join(m3Dir, 'buttons-token-values.json'), 'utf8'),
  readFile(path.join(m3Dir, 'shape-corner-radius-scale.txt'), 'utf8'),
  readFile(path.join(m3Dir, 'motion-easing-duration-tokens.txt'), 'utf8'),
]);
const buttons = JSON.parse(buttonsText) as M3Buttons;
const textByFile = new Map([
  ['shape-corner-radius-scale.txt', shapeText],
  ['motion-easing-duration-tokens.txt', motionText],
]);

const specCache = new Map<string, TokenRecord[]>();
async function recordsFor(specFile: string): Promise<TokenRecord[]> {
  const cached = specCache.get(specFile);
  if (cached) {
    return cached;
  }
  const raw = JSON.parse(await readFile(path.join(root, 'docs/specs', specFile), 'utf8')) as
    SpecFile | { groups: Record<string, TokenRecord[]> };
  const records =
    'tokens' in raw && Array.isArray(raw.tokens)
      ? raw.tokens
      : Object.values((raw as { groups: Record<string, TokenRecord[]> }).groups).flat();
  specCache.set(specFile, records);
  return records;
}

interface Result {
  pick: Pick;
  compose: TokenRecord;
  composeValue: number;
  m3Value: number;
  m3Label: string;
  m3Evidence: string;
  match: boolean;
}

const results: Result[] = [];
for (const pick of PICKS) {
  const records = await recordsFor(pick.specFile);
  const compose = findCompose(records, pick.composeToken);
  const composeValue = numericCompose(compose);
  let m3Value: number;
  let m3Label: string;
  let m3Evidence: string;
  if (pick.m3.kind === 'button-token') {
    const token = buttons.tokens[pick.m3.token];
    if (!token) {
      throw new Error(`m3 button token not captured: ${pick.m3.token}`);
    }
    m3Value = token.value;
    m3Label = pick.m3.token;
    m3Evidence = `m3/buttons-token-values.json (${buttons.source})`;
  } else {
    const text = textByFile.get(pick.m3.file);
    if (!text) {
      throw new Error(`missing m3 text capture ${pick.m3.file}`);
    }
    m3Value = textRowValue(text, pick.m3.label);
    m3Label = pick.m3.label;
    m3Evidence = `m3/${pick.m3.file}`;
  }
  results.push({
    pick,
    compose,
    composeValue,
    m3Value,
    m3Label,
    m3Evidence,
    match: Math.abs(composeValue - m3Value) < 1e-9,
  });
}

const matched = results.filter((result) => result.match).length;
const diverged = results.length - matched;
const rows = results.map((result, index) => {
  const status = result.match ? 'match' : '**diverged**';
  return `| ${index + 1} | ${result.pick.category} | \`${result.pick.composeToken}\` | ${result.composeValue}${result.compose.unit === 'shape' ? 'dp' : result.compose.unit === 'dp' ? 'dp' : ''} | \`${result.m3Label}\` | ${result.m3Value} | ${status} | \`${result.compose.source}\` | ${result.m3Evidence} |`;
});

const plan = {
  generatedBy: 'tools/extract-tokens/src/behavior-spotcheck.ts',
  date: '2026-11-25',
  seed: null,
  note: 'Coverage sample, not random: every expressive button size plus all three shared behavior categories.',
  picks: results.map((result) => ({
    category: result.pick.category,
    token: result.pick.composeToken,
    composeValue: result.composeValue,
    m3Label: result.m3Label,
    m3Value: result.m3Value,
    match: result.match,
    composeSource: result.compose.source,
    m3Evidence: result.m3Evidence,
  })),
  totals: { checked: results.length, matched, diverged },
};

const markdown = `# Day 2 behavior-critical spot-check (extended 20)

**Date:** 2026-11-25. **Result:** ${matched}/${results.length} matched, ${diverged} diverged. **Plan:** \`behavior-spotcheck-plan.json\`.

The original 20-value sample covered typography, color, shape (2), elevation, motion (3, including 2 standard springs), and state (2). It did **not** cover component sizes or paddings. This extension adds 20 behavior-critical values:

- **15 button size/padding values** across XS, S, M, L, and XL.
- **3 shape corner values** (extra small, medium, large).
- **2 standard spring values** (fast spatial damping, default effects stiffness).

It is a **coverage sample, not a random sample**: every expressive button size is represented, and the three shared behavior categories are represented. The goal is to catch a wrong size/padding before layout work, not to estimate a distribution.

## Results

| # | Category | Compose token | Compose | m3 token / row | m3 | Result | Compose source | m3 evidence |
|---:|---|---|---:|---|---:|---|---|---|
${rows.join('\n')}

## Divergences

${
  diverged === 0
    ? 'None.'
    : results
        .filter((result) => !result.match)
        .map(
          (result) =>
            `- \`${result.pick.composeToken}\`: Compose **${result.composeValue}** vs m3 **${result.m3Value}** (${result.m3Label}). Recorded as **U-22**; Compose 1.5.0 remains the 1.0 fidelity authority (Core Rule 1), but Day 11 Button must not claim m3 parity for the XS padding without resolving this.`,
        )
        .join('\n')
}

## Why this matters for Day 3+

- These are the values that set container heights, hit areas, icon/label gaps, and corner geometry. A color-only spot-check would not catch a wrong button height or a wrong XS padding.
- Shape and spring values were already represented in the original sample; this extension repeats them with different rows so the behavior set is self-contained.
- m3's token tables are a secondary source. Compose 1.5.0 wins on conflict; the divergence is logged rather than smoothed over.
- Button XS is the only divergent size set found. The m3 page's XS leading/trailing space is 12dp and icon-label space is 4dp; Compose 1.5.0's \`ButtonXSmallTokens\` uses 16dp and 8dp. Do not silently “fix” either side; resolve the intent on Day 11 with the Button behavior spec.

## Evidence

- \`m3/buttons-token-values.json\` — 67 \`md.comp.button.*\` length/number/shape values read from the rendered buttons specs page's embedded resolved token JSON (Chrome 158 headless, 2026-11-25).
- \`m3/buttons-specs.txt\` — visible text of the rendered buttons specs page.
- \`m3/shape-corner-radius-scale.txt\` — shape corner table.
- \`m3/motion-easing-duration-tokens.txt\` — standard spring table.
`;

await writeFile(
  path.join(evidenceDir, 'behavior-spotcheck-plan.json'),
  `${JSON.stringify(plan, null, 2)}\n`,
);
await writeFile(path.join(evidenceDir, 'SPOTCHECK-BEHAVIOR.md'), markdown);
console.log(`behavior spot-check: ${matched}/${results.length} matched, ${diverged} diverged`);
for (const result of results.filter((candidate) => !candidate.match)) {
  console.log(
    `  diverged ${result.pick.composeToken}: compose ${result.composeValue} vs m3 ${result.m3Value}`,
  );
}
