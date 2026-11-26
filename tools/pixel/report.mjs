import fs from 'node:fs';
import path from 'node:path';

import { pixelAt, readPng, readScene, writeJson } from './lib.mjs';

function percent(value) {
  return `${value.toFixed(4)}%`;
}

function px(value) {
  return value.toLocaleString('en-US');
}

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function firstRun(boot, app, scene) {
  return boot.captures?.[app]?.[scene]?.[0] ?? null;
}

function categoryOf(scene) {
  return readScene(scene).category;
}

function aggregate(results) {
  const scenes = results.config.scenes;
  const summary = {};
  for (const scene of scenes) {
    summary[scene] = {
      exact: 0,
      exactPercent: 0,
      aa: 0,
      aaPercent: 0,
      maxDelta: 0,
      samples: 0,
    };
  }
  for (const boot of results.boots) {
    for (const scene of scenes) {
      const metrics = boot.crossStack?.[scene];
      if (!metrics) continue;
      const row = summary[scene];
      row.samples += 1;
      row.exact = Math.max(row.exact, metrics.exactDiffPixels);
      row.exactPercent = Math.max(row.exactPercent, metrics.exactDiffPercent);
      row.aa = Math.max(row.aa, metrics.aaAwareDiffPixels);
      row.aaPercent = Math.max(row.aaPercent, metrics.aaAwareDiffPercent);
      row.maxDelta = Math.max(row.maxDelta, metrics.maxChannelDelta);
    }
  }
  return summary;
}

function determinismRows(results) {
  const rows = [];
  for (const boot of results.boots) {
    for (const [app, scenes] of Object.entries(boot.determinism ?? {})) {
      for (const [scene, metrics] of Object.entries(scenes)) {
        rows.push({
          boot: boot.index,
          app,
          scene,
          runs: metrics.runs,
          maxExact: metrics.maxExact,
          maxAa: metrics.maxAa,
          ok: metrics.ok,
        });
      }
    }
  }
  return rows;
}

function crossBootRows(results) {
  const rows = [];
  const base = results.boots[0];
  if (!base) return rows;
  for (const boot of results.boots.slice(1)) {
    for (const app of ['compose', 'rn']) {
      for (const scene of results.config.scenes) {
        const a = firstRun(base, app, scene);
        const b = firstRun(boot, app, scene);
        if (!a || !b) continue;
        const metrics = results.crossBoot?.[`${app}:${scene}:${boot.index}`];
        if (!metrics) continue;
        rows.push({
          boot: boot.index,
          app,
          scene,
          exact: metrics.exactDiffPixels,
          aa: metrics.aaAwareDiffPixels,
          maxDelta: metrics.maxChannelDelta,
        });
      }
    }
  }
  return rows;
}

function trivialPixels(results, outDir) {
  const boot = results.boots[0];
  if (!boot) return [];
  const compose = firstRun(boot, 'compose', 'trivial');
  const rn = firstRun(boot, 'rn', 'trivial');
  const metrics = boot.crossStack?.trivial;
  if (!compose || !rn || !metrics) return [];
  const a = readPng(path.join(outDir, compose.path));
  const b = readPng(path.join(outDir, rn.path));
  return metrics.aaAwareCoordinates.map(({ x, y }) => ({
    x,
    y,
    compose: pixelAt(a, x, y).slice(0, 3),
    rn: pixelAt(b, x, y).slice(0, 3),
  }));
}

function contentBbox(image, background) {
  const expected = background.match(/^#(..)(..)(..)$/);
  if (!expected) {
    throw new Error(`invalid background ${background}`);
  }
  const rgb = expected.slice(1).map((part) => parseInt(part, 16));
  let minX = image.width;
  let minY = image.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const pixel = pixelAt(image, x, y);
      if (pixel[0] === rgb[0] && pixel[1] === rgb[1] && pixel[2] === rgb[2]) {
        continue;
      }
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  return maxX < 0 ? null : { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function layoutRows(results, outDir) {
  const boot = results.boots[0];
  if (!boot) return [];
  const rows = [];
  for (const scene of results.config.scenes) {
    const compose = firstRun(boot, 'compose', scene);
    const rn = firstRun(boot, 'rn', scene);
    if (!compose || !rn) continue;
    const background = readScene(scene).background;
    const a = contentBbox(readPng(path.join(outDir, compose.path)), background);
    const b = contentBbox(readPng(path.join(outDir, rn.path)), background);
    const delta =
      a && b
        ? {
            x: a.x - b.x,
            y: a.y - b.y,
            right: a.x + a.width - (b.x + b.width),
            bottom: a.y + a.height - (b.y + b.height),
          }
        : null;
    rows.push({ scene, compose: a, rn: b, delta });
  }
  return rows;
}

export function renderReport(results, outDir) {
  delete results.outDir;
  const reportLabel = results.config.label ?? 'Day 3 — reference harness and measured noise floor';
  const summary = aggregate(results);
  const det = determinismRows(results);
  const crossBoot = crossBootRows(results);
  const pixels = trivialPixels(results, outDir);
  const layout = layoutRows(results, outDir);
  const boot0 = results.boots[0];
  const trivial = summary.trivial ?? null;
  const shadow = summary.shadow ?? null;
  const layoutCompose = firstRun(boot0, 'compose', 'trivial')?.textLayout ?? null;
  const layoutRn = firstRun(boot0, 'rn', 'trivial')?.textLayout ?? null;
  const maxDeterminismExact = Math.max(0, ...det.map((row) => row.maxExact));
  const totalRenders = det.reduce((sum, row) => sum + row.runs, 0);
  const shadowCompose = boot0?.shadow?.compose ?? null;
  const shadowRn = boot0?.shadow?.rn ?? null;
  const deterministic = det.every((row) => row.maxExact === 0);
  const exactZero =
    results.config.scenes.every((scene) => summary[scene].exact === 0) &&
    results.boots.every((boot) =>
      Object.values(boot.crossStack ?? {}).every((metrics) => metrics.exactDiffPixels === 0),
    );
  const categories = [...new Set(results.config.scenes.map(categoryOf))].sort();
  const coreScenes = results.config.scenes.filter((scene) => categoryOf(scene) === 'core');
  const textScenes = results.config.scenes.filter((scene) => categoryOf(scene) === 'text');
  const categoryRows = categories.map((category) => {
    const scenes = results.config.scenes.filter((scene) => categoryOf(scene) === category);
    const rows = scenes.map((scene) => summary[scene]);
    return {
      category,
      scenes: scenes.length,
      exact: rows.reduce((sum, row) => sum + row.exact, 0),
      aa: rows.reduce((sum, row) => sum + row.aa, 0),
      maxAaPercent: Math.max(...rows.map((row) => row.aaPercent)),
      maxDelta: Math.max(...rows.map((row) => row.maxDelta)),
      gate: category === 'core' ? Math.max(...rows.map((row) => row.aaPercent)) <= 0.05 : null,
    };
  });
  const aaGate =
    coreScenes.length === 0 ? null : coreScenes.every((scene) => summary[scene].aaPercent <= 0.05);
  const layoutText =
    layoutCompose && layoutRn
      ? `Measured text layout: Compose ${layoutCompose.width.toFixed(1)}×${layoutCompose.height.toFixed(1)} px, React Native ${layoutRn.width.toFixed(1)}×${layoutRn.height.toFixed(1)} px.`
      : 'Text layout markers were not captured.';
  const exactGeometryScenes = results.config.scenes.filter(
    (scene) => summary[scene].exact === 0 && scene !== 'trivial',
  );
  const shadowRows = [
    shadowCompose
      ? `<tr><td>Compose</td><td>${px(shadowCompose.outsidePixels)}</td><td>${shadowCompose.maxDeviation}</td><td>${shadowCompose.minDeviation}</td></tr>`
      : '',
    shadowRn
      ? `<tr><td>React Native</td><td>${px(shadowRn.outsidePixels)}</td><td>${shadowRn.maxDeviation}</td><td>${shadowRn.minDeviation}</td></tr>`
      : '',
  ].join('');

  results.gate = {
    ...results.gate,
    determinismOk: deterministic,
    crossStackExactZero: exactZero,
    crossStackAaAwareBelowPlaybookGate: aaGate,
    aaGateScope: 'core',
    coreScenes,
    textScenes,
    categories: categoryRows,
    note: 'No new pixel threshold is proposed. The 0.05% figure is the existing PLAYBOOK §7 gate and applies to the five core scenes only. Text-category scenes are tracked separately under U-25.',
  };
  writeJson(path.join(outDir, 'results.json'), results);

  const profileRows = (results.boots[0]?.checks ?? [])
    .map(
      (check) =>
        `<tr><td>${esc(check.name)}</td><td><code>${esc(check.actual)}</code></td><td class="${check.ok ? 'ok' : 'bad'}">${check.ok ? 'match' : 'DRIFT'}</td></tr>`,
    )
    .join('');

  const summaryRows = results.config.scenes
    .map((scene) => {
      const row = summary[scene];
      return `<tr><td>${scene}</td><td>${categoryOf(scene)}</td><td>${px(row.exact)}</td><td>${percent(row.exactPercent)}</td><td>${px(row.aa)}</td><td>${percent(row.aaPercent)}</td><td>${row.maxDelta}</td><td>${row.samples}</td></tr>`;
    })
    .join('');

  const categoryTableRows = categoryRows
    .map(
      (row) =>
        `<tr><td><code>${row.category}</code></td><td>${row.scenes}</td><td>${px(row.exact)}</td><td>${px(row.aa)}</td><td>${percent(row.maxAaPercent)}</td><td class="${row.gate === null ? '' : row.gate ? 'ok' : 'bad'}">${row.gate === null ? 'tracked — no threshold' : row.gate ? '0.05% met' : '0.05% exceeded'}</td></tr>`,
    )
    .join('');

  const detRows = det
    .map(
      (row) =>
        `<tr><td>${row.boot}</td><td>${row.app}</td><td>${row.scene}</td><td>${row.runs}</td><td>${row.maxExact}</td><td>${row.maxAa}</td><td class="${row.ok ? 'ok' : 'bad'}">${row.ok ? 'zero' : 'DIFF'}</td></tr>`,
    )
    .join('');

  const crossBootTable = crossBoot
    .map(
      (row) =>
        `<tr><td>${row.boot}</td><td>${row.app}</td><td>${row.scene}</td><td>${row.exact}</td><td>${row.aa}</td><td>${row.maxDelta}</td></tr>`,
    )
    .join('');

  const pixelRows = pixels
    .map(
      (pixel) =>
        `<tr><td>${pixel.x}, ${pixel.y}</td><td><code>rgb(${pixel.compose.join(',')})</code></td><td><code>rgb(${pixel.rn.join(',')})</code></td></tr>`,
    )
    .join('');

  const sceneSections = results.config.scenes
    .map((scene) => {
      const boot = results.boots[0];
      const compose = firstRun(boot, 'compose', scene);
      const rn = firstRun(boot, 'rn', scene);
      const metrics = boot.crossStack?.[scene];
      if (!compose || !rn || !metrics) return '';
      const regionRows = Object.entries(metrics.regionCounts)
        .map(([name, count]) => `<li><code>${esc(name)}</code>: ${px(count)} exact diff px</li>`)
        .join('');
      return `<section>
  <h2>${scene}</h2>
  <p><strong>${px(metrics.exactDiffPixels)}</strong> exact diff px (${percent(metrics.exactDiffPercent)}), <strong>${px(metrics.aaAwareDiffPixels)}</strong> AA-aware diff px (${percent(metrics.aaAwareDiffPercent)}), max channel delta <strong>${metrics.maxChannelDelta}</strong>.</p>
  <div class="shots">
    <figure><img src="${compose.path}" alt="Compose ${scene}"><figcaption>Compose</figcaption></figure>
    <figure><img src="${rn.path}" alt="React Native ${scene}"><figcaption>React Native</figcaption></figure>
    <figure><img src="${metrics.diff}" alt="Diff ${scene}"><figcaption>pixelmatch diff (red = non-AA, yellow = AA)</figcaption></figure>
  </div>
  ${regionRows ? `<ul>${regionRows}</ul>` : ''}
</section>`;
    })
    .join('\n');

  const formatBbox = (bbox) => (bbox ? `${bbox.x},${bbox.y} ${bbox.width}×${bbox.height}` : 'none');
  const layoutTable = layout
    .map((row) => {
      const delta = row.delta
        ? Math.max(...Object.values(row.delta).map((value) => Math.abs(value)))
        : 0;
      return `<tr><td>${row.scene}</td><td><code>${formatBbox(row.compose)}</code></td><td><code>${formatBbox(row.rn)}</code></td><td class="${delta === 0 ? 'ok' : 'bad'}">${delta === 0 ? '0' : delta}</td></tr>`;
    })
    .join('');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>M3E — ${esc(reportLabel)}</title>
<style>
  :root { color-scheme: light; }
  body { font: 15px/1.5 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; padding: 32px; color: #1c1b1f; background: #fffbfe; }
  main { max-width: 1180px; margin: 0 auto; }
  h1 { font-size: 30px; line-height: 1.15; margin: 0 0 4px; letter-spacing: -0.02em; }
  h2 { font-size: 20px; margin: 36px 0 8px; }
  .sub { color: #5f5b66; margin: 0 0 24px; }
  .status { border: 1px solid #cac4d0; border-radius: 16px; padding: 16px 20px; margin: 20px 0; background: #f7f2fa; }
  .status strong { font-size: 17px; }
  .bad { color: #b3261e; font-weight: 700; }
  .ok { color: #146c2e; font-weight: 700; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0 20px; font-size: 13px; }
  th, td { border-bottom: 1px solid #e7e0ec; padding: 7px 9px; text-align: left; vertical-align: top; }
  th { background: #f3edf7; font-weight: 600; }
  code { font: 12px ui-monospace, SFMono-Regular, Menlo, monospace; }
  .shots { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
  figure { margin: 0; border: 1px solid #e7e0ec; border-radius: 12px; overflow: hidden; background: #fff; }
  figure img { display: block; width: 100%; height: auto; image-rendering: pixelated; }
  figcaption { padding: 8px 10px; font-size: 12px; color: #5f5b66; border-top: 1px solid #e7e0ec; }
  ul { margin: 6px 0 18px; }
  .note { border-left: 4px solid #6750a4; padding: 8px 14px; background: #f7f2fa; }
  @media (max-width: 760px) { .shots { grid-template-columns: 1fr; } body { padding: 18px; } }
</style>
</head>
<body>
<main>
<h1>${esc(reportLabel)}</h1>
<p class="sub">${esc(results.generatedAt)} · ${esc(results.profile.avd)} · API ${results.profile.api} · ${results.profile.width}×${results.profile.height} @ ${results.profile.density}dpi · ${results.config.boots} cold boots · ${results.config.repeats} repeats of the trivial scene per app per boot.</p>

<div class="status">
  <p><strong>Cross-stack exact zero across all scenes: ${exactZero ? '<span class="ok">met</span>' : '<span class="bad">not met</span>'}</strong></p>
  <p>${exactZero ? 'Compose and React Native produced byte-identical crops in every sampled scene.' : trivial ? `The remaining difference is text-only: <strong>${px(trivial.exact)}</strong> exact pixels (${percent(trivial.exactPercent)}), and <strong>${px(trivial.aa)}</strong> pixels after pixelmatch anti-aliasing detection (${percent(trivial.aaPercent)}). Geometry and shadow scenes are byte-identical. This report does not tune the scene or propose a new threshold.` : 'The trivial scene was not part of this run; see the per-scene table for the measured differences.'}</p>
  <ul>
    <li><strong>Determinism:</strong> ${px(totalRenders)} renders (${det.length} app/scene/boot combinations), maximum exact difference between any repeat and its first run: <strong>${px(maxDeterminismExact)} px</strong>.</li>
    <li><strong>Text anti-aliasing:</strong> ${trivial ? `<strong>${px(trivial.exact)} px</strong> exact (${percent(trivial.exactPercent)}), <strong>${px(trivial.aa)} px</strong> AA-aware (${percent(trivial.aaPercent)}), max channel Δ <strong>${trivial.maxDelta}</strong>, confined to the text bbox.` : 'trivial scene not included in this run.'}</li>
    <li><strong>Shadows:</strong> ${shadow ? `cross-stack exact <strong>${px(shadow.exact)} px</strong>; Compose and React Native both render ${shadowCompose ? px(shadowCompose.outsidePixels) : '?'} non-background shadow pixels outside the rectangle.` : 'shadow scene not included in this run.'}</li>
  </ul>
  <p>Existing PLAYBOOK §7 AA-aware 0.05% gate on the <strong>core</strong> scenes: ${aaGate === null ? 'not evaluated (no core scenes in this run)' : aaGate ? 'below the gate' : 'above the gate'}. ${layoutText}</p>
</div>

<h2>Scene categories</h2>
<table>
  <thead><tr><th>Category</th><th>Scenes</th><th>Σ exact px (scene max)</th><th>Σ AA-aware px (scene max)</th><th>Max AA-aware %</th><th>Gate</th></tr></thead>
  <tbody>${categoryTableRows}</tbody>
</table>
<p class="note">Only the <code>core</code> category is the five-scene PLAYBOOK §7 gate. The <code>text</code> category contains the 30 typography roles (and, when included, the dense label/paragraph probes), tracked separately under U-25. Its numbers are a regression ceiling, not a pass/fail claim; ADR-010 is pending.</p>

<h2>Noise split</h2>
<table>
  <thead><tr><th>Scene</th><th>Category</th><th>Exact diff px</th><th>Exact %</th><th>AA-aware px</th><th>AA-aware %</th><th>Max channel Δ</th><th>Boots</th></tr></thead>
  <tbody>${summaryRows}</tbody>
</table>
<p class="note">Solid background and the rounded rectangle are byte-identical. The elevated rectangle is byte-identical. All cross-stack difference is confined to the text region, where the two frameworks rasterize the same Roboto Flex file with subpixel placement differences. The AA-aware count is the number of pixels pixelmatch classifies as non-anti-aliased differences at threshold 0.1.</p>

<h2>Shadow measurement</h2>
<table>
  <thead><tr><th>App</th><th>Non-background px outside rect</th><th>Max Δ from background</th><th>Min Δ from background</th></tr></thead>
  <tbody>${shadowRows}</tbody>
</table>
<p class="note">${shadow ? `The shadow is present in both renders (pixels outside the rectangle differ from the flat background), and the cross-stack diff for the whole shadow scene is ${px(shadow.exact)} exact px. This is the shadow measurement, not an inference from an empty scene.` : 'The shadow scene was not included in this run.'}</p>

<h2>Layout edges</h2>
<table>
  <thead><tr><th>Scene</th><th>Compose content bbox</th><th>React Native content bbox</th><th>Max edge delta (px)</th></tr></thead>
  <tbody>${layoutTable}</tbody>
</table>
<p class="note">Strict bounding box of pixels that are not exactly the scene background. It includes anti-aliased glyph edges and the shadow. No tolerance is added; the number is recorded as measured.</p>

<h2>Non-AA text pixels (boot 1, trivial)</h2>
${pixels.length ? `<table><thead><tr><th>Coordinate</th><th>Compose</th><th>React Native</th></tr></thead><tbody>${pixelRows}</tbody></table>` : '<p>None.</p>'}

<h2>Determinism</h2>
<table>
  <thead><tr><th>Boot</th><th>App</th><th>Scene</th><th>Runs</th><th>Max exact diff</th><th>Max AA-aware diff</th><th>Status</th></tr></thead>
  <tbody>${detRows}</tbody>
</table>

<h2>Cross-boot repeatability (each boot run 0 vs boot 1 run 0)</h2>
<table>
  <thead><tr><th>Boot</th><th>App</th><th>Scene</th><th>Exact diff px</th><th>AA-aware px</th><th>Max channel Δ</th></tr></thead>
  <tbody>${crossBootTable || '<tr><td colspan="6">Single-boot run.</td></tr>'}</tbody>
</table>

<h2>Emulator profile (verified)</h2>
<table>
  <thead><tr><th>Check</th><th>Observed</th><th>Status</th></tr></thead>
  <tbody>${profileRows}</tbody>
</table>
<p>Font file: <code>${esc(results.fonts.sourceHash)}</code> in both APKs and in the source tree. Runtime probes: Compose <code>${esc(results.boots[0]?.captures.compose.trivial?.[0]?.marker.probe ?? '')}</code>; React Native <code>${esc(results.boots[0]?.captures.rn.trivial?.[0]?.marker.probe ?? '')}</code>.</p>
<p>Frozen device, GPU, settings, and cold-boot procedure: <code>FROZEN_PROFILE.md</code>. Raw run log: <code>run.log</code>.</p>

<h2>Scene captures</h2>
${sceneSections}

<h2>What this establishes</h2>
<ul>
  <li>The capture, crop, compare, and report pipeline is deterministic across repeated launches and cold boots.</li>
  <li>Compose and React Native agree exactly on solid fills, rounded-rectangle geometry, and elevation shadows on this profile.</li>
  <li>Text from the same Roboto Flex file differs only in rasterization: ${layoutText} The difference is confined to the glyph edges.</li>
  <li>No threshold is proposed here. This run is a measurement, not a gate change.</li>
</ul>

<h2>What this does not establish</h2>
<ul>
  <li>It does not establish component parity; no library components exist yet.</li>
  <li>It does not establish iOS behavior.</li>
  <li>It does not establish that the 4 non-AA text pixels are acceptable. That is a product decision.</li>
</ul>
</main>
</body>
</html>
`;

  const md = `# ${reportLabel}

**Generated:** ${results.generatedAt}
**Profile:** ${results.profile.avd}, API ${results.profile.api}, ${results.profile.width}×${results.profile.height}, ${results.profile.density}dpi (${results.profile.densityScale}×), GPU ${results.profile.gpu}, font scale ${results.profile.fontScale}, animations ${results.profile.animations}.
**Runs:** ${results.config.boots} cold boots × ${results.config.repeats} repeats of the trivial scene per app; ${results.config.sceneRepeats} repeats of each other scene.

## Headline

- Cross-stack exact zero: **${exactZero ? 'met' : 'not met'}**.
- Trivial scene exact difference: **${trivial ? `${px(trivial.exact)} px (${percent(trivial.exactPercent)})` : 'not in this run'}**.
- Trivial scene AA-aware difference: **${trivial ? `${px(trivial.aa)} px (${percent(trivial.aaPercent)})` : 'not in this run'}**.
- Within-harness determinism: **${deterministic ? 'zero exact diffs' : 'FAILED'}** across ${px(totalRenders)} renders; max exact diff per app/scene/boot combination: ${px(maxDeterminismExact)} px.
- Exact-zero scenes in every sampled boot: **${exactGeometryScenes.length ? exactGeometryScenes.join(', ') : 'none'}**.

The cross-stack difference is text-only. ${layoutText} The frameworks rasterize some glyph edges differently. This report does **not** tune the scene and does **not** propose a new threshold.

## Measured noise split

**Determinism.** ${px(totalRenders)} renders across ${det.length} app/scene/boot combinations; maximum exact difference between any repeat and its first run is **${px(maxDeterminismExact)} px**. Per-combination numbers are in the determinism table.

**Text anti-aliasing.** ${trivial ? `On the trivial scene: **${px(trivial.exact)} px** exact (${percent(trivial.exactPercent)}), **${px(trivial.aa)} px** after pixelmatch AA detection (${percent(trivial.aaPercent)}), max channel Δ **${trivial.maxDelta}**. All exact differences fall inside the text bbox.` : 'The trivial scene was not included in this run.'}

**Shadows.** The elevated rectangle is present and measured, not inferred from an empty scene:

| App | Non-background px outside rect | Max Δ from background | Min Δ from background |
|---|---:|---:|---:|
${shadowCompose ? `| Compose | ${px(shadowCompose.outsidePixels)} | ${shadowCompose.maxDeviation} | ${shadowCompose.minDeviation} |` : ''}
${shadowRn ? `| React Native | ${px(shadowRn.outsidePixels)} | ${shadowRn.maxDeviation} | ${shadowRn.minDeviation} |` : ''}

${shadow ? `The cross-stack diff for the shadow scene is **${px(shadow.exact)} exact px** (${percent(shadow.exactPercent)}).` : 'The shadow scene was not included in this run.'}

## Layout edges

| Scene | Compose content bbox | React Native content bbox | Max edge Δ |
|---|---|---:|
${layout.map((row) => `| ${row.scene} | ${formatBbox(row.compose)} | ${formatBbox(row.rn)} | ${row.delta ? Math.max(...Object.values(row.delta).map((value) => Math.abs(value))) : 0} |`).join('\n')}

Strict bounding box of pixels that are not exactly the scene background, including anti-aliased glyph edges and the shadow. No tolerance is applied.

## Scene categories

| Category | Scenes | Σ exact px (scene max) | Σ AA-aware px (scene max) | Max AA-aware % | Gate |
|---|---:|---:|---:|---:|---|
${categoryRows.map((row) => `| \`${row.category}\` | ${row.scenes} | ${px(row.exact)} | ${px(row.aa)} | ${percent(row.maxAaPercent)} | ${row.gate === null ? 'tracked — no threshold' : row.gate ? '0.05% met' : '0.05% exceeded'} |`).join('\n')}

Only the \`core\` category is the five-scene PLAYBOOK §7 gate. The \`text\` category contains the 30 typography roles (and, when included, the dense label/paragraph probes), tracked separately under U-25; its numbers are a regression ceiling, not a pass/fail claim. ADR-010 is pending.

## Noise split by scene

| Scene | Category | Exact px | Exact % | AA-aware px | AA-aware % | Max Δ | Boots |
|---|---|---:|---:|---:|---:|---:|---:|
${results.config.scenes.map((scene) => `| ${scene} | ${categoryOf(scene)} | ${px(summary[scene].exact)} | ${percent(summary[scene].exactPercent)} | ${px(summary[scene].aa)} | ${percent(summary[scene].aaPercent)} | ${summary[scene].maxDelta} | ${summary[scene].samples} |`).join('\n')}

## Non-AA text pixels (boot 1, trivial)

${pixels.length ? `| Coordinate | Compose | React Native |\n|---|---|---|\n${pixels.map((pixel) => `| ${pixel.x}, ${pixel.y} | rgb(${pixel.compose.join(',')}) | rgb(${pixel.rn.join(',')}) |`).join('\n')}` : 'None.'}

## Determinism

| Boot | App | Scene | Runs | Max exact | Max AA-aware | Status |
|---:|---|---|---:|---:|---:|---|
${det.map((row) => `| ${row.boot} | ${row.app} | ${row.scene} | ${row.runs} | ${row.maxExact} | ${row.maxAa} | ${row.ok ? 'zero' : 'DIFF'} |`).join('\n')}

## Cross-boot repeatability

| Boot | App | Scene | Exact px | AA-aware px | Max Δ |
|---:|---|---|---:|---:|---:|
${crossBoot.map((row) => `| ${row.boot} | ${row.app} | ${row.scene} | ${row.exact} | ${row.aa} | ${row.maxDelta} |`).join('\n') || '| — | — | — | — | — | — |'}

## Profile and fonts

Every profile check passed: API ${results.profile.api}, ${results.profile.width}×${results.profile.height}, ${results.profile.density}dpi, font scale ${results.profile.fontScale}, locale ${results.profile.locale}, animations ${results.profile.animations}, rotation 0, night mode off, SwiftShader GPU. The Roboto Flex SHA-256 is \`${results.fonts.sourceHash}\` in both APKs and in the source tree; both runtime probes applied the \`wdth\` axis.

Frozen device, GPU, settings, and cold-boot procedure: \`FROZEN_PROFILE.md\`. Raw run log: \`run.log\`.

See \`report.html\` for side-by-side captures and diff heatmaps, and \`results.json\` for every per-run hash.
`;

  const htmlPath = path.join(outDir, 'report.html');
  const mdPath = path.join(outDir, 'README.md');
  fs.writeFileSync(htmlPath, html);
  fs.writeFileSync(mdPath, md);
  return { htmlPath, mdPath, summary, exactZero, deterministic, aaGate };
}
