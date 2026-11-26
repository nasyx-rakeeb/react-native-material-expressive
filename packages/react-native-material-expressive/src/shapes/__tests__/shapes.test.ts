import { readFileSync } from 'node:fs';
import path from 'node:path';

import { Corner } from '../Features';
import {
  geometryToSvgPath,
  interpolateGeometry,
  isMaterialShapeName,
  MATERIAL_SHAPE_NAMES,
  MaterialShapes,
  Morph,
  morphToGeometries,
  polygonToGeometry,
  resolveMorphEndpoints,
  resolvePolygon,
  resolveShapeGeometry,
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

  it('matches 50 Compose morphs at eleven progress values within 1e-4', () => {
    expect(golden.morphs).toHaveLength(50);
    for (const expectedMorph of golden.morphs) {
      const morph = new Morph(MaterialShapes[expectedMorph.from], MaterialShapes[expectedMorph.to]);
      expect(expectedMorph.samples).toHaveLength(11);
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
    const progressValues = [-0.5, -0.1, 0, 0.1, 0.25, 0.33, 0.5, 0.6, 0.75, 0.9, 1, 1.1, 1.5];
    for (const progress of progressValues) {
      const actual = interpolateGeometry(endpoints.start, endpoints.end, progress);
      const expected = morph.asCubics(progress).flatMap((cubic) => [...cubic.points]);
      expect(actual).toHaveLength(expected.length);
      for (let index = 0; index < expected.length; index++) {
        expectClose(actual[index]!, expected[index]!, `interpolate@${progress}[${index}]`);
      }
    }
  });

  it('extrapolates outside [0, 1] instead of clamping', () => {
    const start = [0, 0, 0, 0, 0, 0, 1, 1];
    const end = [1, 1, 1, 1, 1, 1, 2, 2];
    expect(interpolateGeometry(start, end, 1.5)).toEqual([1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 2.5, 2.5]);
    expect(interpolateGeometry(start, end, -0.5)).toEqual([
      -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5,
    ]);
  });

  it('rejects geometries with different cubic counts', () => {
    expect(() => interpolateGeometry([0, 0, 0, 0, 0, 0, 1, 1], [], 0.5)).toThrow(
      'Path geometries must have the same length',
    );
  });

  it('serialises scaled geometry as an absolute, closed SVG path', () => {
    const geometry = [0, 0, 0.25, 0, 0.75, 1, 1, 1];
    expect(geometryToSvgPath(geometry, 100, 50)).toBe('M0 0C25 0 75 50 100 50Z');
    expect(geometryToSvgPath([], 100, 50)).toBe('');
  });
});

describe('shape source resolution', () => {
  it('resolves names to the shared MaterialShapes polygons', () => {
    expect(isMaterialShapeName('Arch')).toBe(true);
    expect(isMaterialShapeName(MaterialShapes.Arch)).toBe(false);
    expect(resolvePolygon('Arch')).toBe(MaterialShapes.Arch);
    expect(resolvePolygon(MaterialShapes.Arch)).toBe(MaterialShapes.Arch);
  });

  it('rejects unknown Material shape names', () => {
    expect(() => resolvePolygon('NotAShape' as MaterialShapeName)).toThrow(
      'Unknown Material shape: NotAShape',
    );
  });

  it('caches shape geometry by polygon identity', () => {
    const first = resolveShapeGeometry('Arch');
    expect(resolveShapeGeometry(MaterialShapes.Arch)).toBe(first);
    expect(first).toHaveLength(MaterialShapes.Arch.cubics.length * 8);
  });

  it('caches morph endpoints by ordered polygon pair', () => {
    const first = resolveMorphEndpoints('Arch', 'Clover4Leaf');
    expect(resolveMorphEndpoints(MaterialShapes.Arch, MaterialShapes.Clover4Leaf)).toBe(first);
    expect(first.start).toHaveLength(first.end.length);
    expect(resolveMorphEndpoints('Clover4Leaf', 'Arch')).not.toBe(first);
  });
});
