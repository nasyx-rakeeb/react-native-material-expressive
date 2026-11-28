import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ASSETS = path.resolve(__dirname, '../../../assets');

function readFont(): Buffer {
  return fs.readFileSync(path.join(ASSETS, 'fonts/MaterialSymbolsOutlined.ttf'));
}

interface TableRecord {
  offset: number;
  length: number;
}

function readTables(font: Buffer): Record<string, TableRecord> {
  const numTables = font.readUInt16BE(4);
  const tables: Record<string, TableRecord> = {};
  for (let index = 0; index < numTables; index += 1) {
    const record = 12 + index * 16;
    const tag = font.toString('ascii', record, record + 4);
    tables[tag] = {
      offset: font.readUInt32BE(record + 8),
      length: font.readUInt32BE(record + 12),
    };
  }
  return tables;
}

interface FontAxis {
  tag: string;
  min: number;
  default: number;
  max: number;
}

function readAxes(font: Buffer, offset: number): FontAxis[] {
  const axesArrayOffset = font.readUInt16BE(offset + 4);
  const axisCount = font.readUInt16BE(offset + 8);
  const axisSize = font.readUInt16BE(offset + 10);
  const axes: FontAxis[] = [];
  for (let index = 0; index < axisCount; index += 1) {
    const axis = offset + axesArrayOffset + index * axisSize;
    axes.push({
      tag: font.toString('ascii', axis, axis + 4),
      min: font.readInt32BE(axis + 4) / 65536,
      default: font.readInt32BE(axis + 8) / 65536,
      max: font.readInt32BE(axis + 12) / 65536,
    });
  }
  return axes;
}

describe('bundled Material Symbols font', () => {
  it('is the 90-glyph subset with all four variable axes preserved', () => {
    const font = readFont();
    const tables = readTables(font);
    expect(font.readUInt16BE(tables.maxp!.offset + 4)).toBe(93);
    expect(readAxes(font, tables.fvar!.offset)).toEqual([
      { tag: 'FILL', min: 0, default: 0, max: 1 },
      { tag: 'GRAD', min: -50, default: 0, max: 200 },
      { tag: 'opsz', min: 20, default: 24, max: 48 },
      { tag: 'wght', min: 100, default: 400, max: 700 },
    ]);
  });

  it('stays small enough to justify a subset', () => {
    const size = readFont().byteLength;
    // Full upstream variable font: 10,744,832 B. The subset is 116,368 B.
    expect(size).toBe(116_368);
    expect(size).toBeLessThan(200_000);
  });

  it('ships the Apache-2.0 license and a hash-bearing NOTICE', () => {
    const license = fs.readFileSync(path.join(ASSETS, 'icons/LICENSE'), 'utf8');
    expect(license).toContain('Apache License');
    expect(license).toContain('Version 2.0, January 2004');

    const notice = fs.readFileSync(path.join(ASSETS, 'icons/NOTICE'), 'utf8');
    expect(notice).toContain('Copyright 2020 Google LLC');
    expect(notice).toContain('Apache License, Version 2.0');
    expect(notice).toContain('Not affiliated with or endorsed by Google.');

    const hash = createHash('sha256').update(readFont()).digest('hex');
    expect(notice).toContain(hash);
  });

  it('is copied into the gallery with the same bytes and license', () => {
    const library = readFont();
    const gallery = fs.readFileSync(
      path.resolve(
        __dirname,
        '../../../../../apps/gallery/assets/fonts/MaterialSymbolsOutlined.ttf',
      ),
    );
    expect(gallery.equals(library)).toBe(true);
    expect(
      fs.existsSync(
        path.resolve(
          __dirname,
          '../../../../../apps/gallery/assets/fonts/MaterialSymbols-LICENSE.txt',
        ),
      ),
    ).toBe(true);
  });
});
