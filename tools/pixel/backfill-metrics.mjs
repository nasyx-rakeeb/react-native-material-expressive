#!/usr/bin/env node
/**
 * Recompute the threshold-independent diff metrics for stored runs.
 *
 * The gate's AA-aware count is threshold-dependent (pixelmatch 0.1). This
 * backfill reads the captured PNG pairs, recomputes raw max/mean channel delta,
 * the Δ > 2 outside anti-aliased edges count, and the flat-fill count, then
 * regenerates each report.html. It does not change any capture or gate result.
 */
import fs from 'node:fs';
import path from 'node:path';

import { comparePng, readPng, ROOT, writeJson } from './lib.mjs';
import { renderReport } from './report.mjs';

function findResults(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      found.push(...findResults(full));
    } else if (entry === 'results.json') {
      found.push(full);
    }
  }
  return found;
}

const files = findResults(path.join(ROOT, 'docs/evidence')).sort();
let updated = 0;
let skipped = 0;

for (const file of files) {
  const dir = path.dirname(file);
  const results = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!results.config?.scenes || !results.boots) {
    skipped += 1;
    continue;
  }

  let recomputed = 0;
  for (const boot of results.boots) {
    for (const scene of results.config.scenes) {
      const compose = boot.captures?.compose?.[scene]?.[0];
      const rn = boot.captures?.rn?.[scene]?.[0];
      if (!compose || !rn) continue;
      const composePath = path.join(dir, compose.path);
      const rnPath = path.join(dir, rn.path);
      if (!fs.existsSync(composePath) || !fs.existsSync(rnPath)) {
        console.warn(`  skip missing captures: ${path.relative(ROOT, dir)} ${scene}`);
        continue;
      }
      const a = readPng(composePath);
      const b = readPng(rnPath);
      const metrics = comparePng(a, b);
      boot.crossStack ??= {};
      boot.crossStack[scene] = { ...boot.crossStack[scene], ...metrics };
      recomputed += 1;
    }
  }

  if (recomputed === 0) {
    skipped += 1;
    continue;
  }

  writeJson(file, results);
  if (fs.existsSync(path.join(dir, 'report.html'))) {
    renderReport(results, dir);
  }
  updated += 1;
  console.log(
    `${path.relative(ROOT, file)}: ${recomputed} comparisons` +
      (fs.existsSync(path.join(dir, 'report.html')) ? ' + report' : ''),
  );
}

console.log(`updated ${updated} results, skipped ${skipped}`);
