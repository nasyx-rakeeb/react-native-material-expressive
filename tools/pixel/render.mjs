import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderReport } from './report.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const outDir = path.resolve(ROOT, process.argv[2] ?? 'docs/evidence/day3');
const resultsPath = path.join(outDir, 'results.json');

if (!fs.existsSync(resultsPath)) {
  throw new Error(`missing ${resultsPath}`);
}

const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
const report = renderReport(results, outDir);
process.stdout.write(`rendered ${report.htmlPath}\n`);
process.stdout.write(`rendered ${report.mdPath}\n`);
