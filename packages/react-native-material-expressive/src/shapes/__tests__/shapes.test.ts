import { readFileSync } from 'node:fs';
import path from 'node:path';

import { Corner } from '../Features';
import {
  geometryToSvgPath,
  interpolateGeometry,
  MATERIAL_SHAPE_NAMES,
  MaterialShapes,
  Morph,
  morphToGeometries,
  polygonToGeometry,
  type MaterialShapeName,
} from '../index';

interface GoldenFeature {
  type: 'corner' | 'edge';
  convex: boolean;
  cubics: number;
}

interface GoldenShape {
  center: [number, number];
  features: GoldenFeature[];
  cubics: number[][];
}

interface GoldenMorphSample {
  progress: number;
  cubics: number[][];
}

interface GoldenMorph {
  from: MaterialShapeName;
  to: MaterialShapeName;
  samples: GoldenMorphSample[];
}

interface ShapeGolden {
  schema: number;
  shapeNames: MaterialShapeName[];
  shapes: Record<MaterialShapeName, GoldenShape>;
  morphs: GoldenMorph[];
}

const golden = JSON.parse(
  readFileSync(path.resolve(__dirname, '../../../../../docs/specs/shapes/goldens.json'), 'utf8'),
) as ShapeGolden;

function expectClose(actual: number, expected: number, label: string): void {
  const delta = Math.abs(actual - expected);
  if (delta > 1e-4) {
    throw new Error(`${label}: expected ${expected}, received ${actual} (delta ${delta})`);
  }
}

function expectCubics(actual: number[][], expected: number[][], label: string): void {
  expect(actual.length).toBe(expected.length);
  for (let cubicIndex = 0; cubicIndex < expected.length; cubicIndex++) {
    const actualCubic = actual[cubicIndex]!;
    const expectedCubic = expected[cubicIndex]!;
    expect(actualCubic.length).toBe(8);
    for (let pointIndex = 0; pointIndex < 8; pointIndex++) {
      expectClose(
        actualCubic[pointIndex]!,
        expectedCubic[pointIndex]!,
        `${label}[${cubicIndex}][${pointIndex}]`,
      );
    }
  }
}

describe('MaterialShapes golden geometry', () => {
  it('contains the 35 Material shape names in the reference order', () => {
    expect(golden.schema).toBe(1);
    expect(MATERIAL_SHAPE_NAMES).toEqual(golden.shapeNames);
    expect(golden.shapeNames).toHaveLength(35);
  });

  it('matches every Compose cubic and center within 1e-4', () => {
    for (const name of golden.shapeNames) {
      const shape = MaterialShapes[name];
      const expected = golden.shapes[name];
      expectClose(shape.centerX, expected.center[0], `${name}.centerX`);
      expectClose(shape.centerY, expected.center[1], `${name}.centerY`);
      expectCubics(
        shape.cubics.map((cubic) => [...cubic.points]),
        expected.cubics,
        name,
      );
    }
  });

  it('matches every Compose feature count, type, and convexity', () => {
    for (const name of golden.shapeNames) {
      const shape = MaterialShapes[name];
      const expected = golden.shapes[name];
      expect(shape.features.length).toBe(expected.features.length);
      shape.features.forEach((feature, featureIndex) => {
        const expectedFeature = expected.features[featureIndex]!;
        const isCorner = feature instanceof Corner;
        expect(isCorner ? 'corner' : 'edge').toBe(expectedFeature.type);
        if (isCorner) {
          expect(feature.convex).toBe(expectedFeature.convex);
        }
        expect(feature.cubics.length).toBe(expectedFeature.cubics);
      });
    }
  });

  it('matches 50 Compose morphs at five progress values within 1e-4', () => {
    expect(golden.morphs).toHaveLength(50);
    for (const expectedMorph of golden.morphs) {
      const morph = new Morph(MaterialShapes[expectedMorph.from], MaterialShapes[expectedMorph.to]);
      expect(expectedMorph.samples).toHaveLength(5);
      for (const sample of expectedMorph.samples) {
        expectCubics(
          morph.asCubics(sample.progress).map((cubic) => [...cubic.points]),
          sample.cubics,
          `${expectedMorph.from}->${expectedMorph.to}@${sample.progress}`,
        );
      }
    }
  });

  it('keeps every normalized shape inside the unit square', () => {
    for (const name of MATERIAL_SHAPE_NAMES) {
      const bounds = MaterialShapes[name].calculateBounds();
      expect(bounds[0]!).toBeGreaterThanOrEqual(-1e-4);
      expect(bounds[1]!).toBeGreaterThanOrEqual(-1e-4);
      expect(bounds[2]!).toBeLessThanOrEqual(1 + 1e-4);
      expect(bounds[3]!).toBeLessThanOrEqual(1 + 1e-4);
    }
  });
});

describe('path geometry', () => {
  it('flattens every polygon cubic in order', () => {
    const shape = MaterialShapes.Arch;
    const geometry = polygonToGeometry(shape);
    expect(geometry).toHaveLength(shape.cubics.length * 8);
    shape.cubics.forEach((cubic, index) => {
      expect(geometry.slice(index * 8, index * 8 + 8)).toEqual([...cubic.points]);
    });
  });

  it('precomputes morph endpoints and interpolates like Morph.asCubics', () => {
    const morph = new Morph(MaterialShapes.Arch, MaterialShapes.Clover4Leaf);
    const endpoints = morphToGeometries(morph);
    expect(endpoints.start).toHaveLength(endpoints.end.length);
    for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
      const actual = interpolateGeometry(endpoints.start, endpoints.end, progress);
      const expected = morph.asCubics(progress).flatMap((cubic) => [...cubic.points]);
      expect(actual).toHaveLength(expected.length);
      for (let index = 0; index < expected.length; index++) {
        expectClose(actual[index]!, expected[index]!, `interpolate@${progress}[${index}]`);
      }
    }
  });

  it('serialises scaled geometry as an absolute, closed SVG path', () => {
    const geometry = [0, 0, 0.25, 0, 0.75, 1, 1, 1];
    expect(geometryToSvgPath(geometry, 100, 50)).toBe('M0 0C25 0 75 50 100 50Z');
    expect(geometryToSvgPath([], 100, 50)).toBe('');
  });
});
