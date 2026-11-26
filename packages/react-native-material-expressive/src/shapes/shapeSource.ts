/**
 * Resolves the public shape inputs (`MaterialShapeName | RoundedPolygon`) to
 * polygons and caches the renderer-agnostic geometry derived from them.
 *
 * This file is original project code (MIT).
 */

import { MaterialShapes, type MaterialShapeName } from './MaterialShapes';
import { Morph } from './Morph';
import { morphToGeometries, polygonToGeometry, type PathGeometry } from './pathGeometry';
import type { RoundedPolygon } from './RoundedPolygon';

/** A Material shape name or a caller-built rounded polygon. */
export type ShapeSource = MaterialShapeName | RoundedPolygon;

/** The two precomputed endpoint geometries of a morph. */
export interface MorphEndpoints {
  readonly start: PathGeometry;
  readonly end: PathGeometry;
}

const geometryCache = new WeakMap<RoundedPolygon, PathGeometry>();
const morphCache = new WeakMap<RoundedPolygon, WeakMap<RoundedPolygon, MorphEndpoints>>();

/** True when `source` is a `MaterialShapes` key rather than a polygon object. */
export function isMaterialShapeName(source: ShapeSource): source is MaterialShapeName {
  return typeof source === 'string';
}

/**
 * Returns the `RoundedPolygon` for a name, or the caller's polygon unchanged.
 *
 * Named shapes resolve to the module-level `MaterialShapes` instances, so the
 * caches below stay effective across renders and components.
 */
export function resolvePolygon(source: ShapeSource): RoundedPolygon {
  if (typeof source === 'string') {
    const polygon = MaterialShapes[source];
    if (polygon === undefined) {
      throw new Error(`Unknown Material shape: ${source}`);
    }
    return polygon;
  }
  return source;
}

/** Returns the normalised unit-square geometry for a shape. */
export function resolveShapeGeometry(source: ShapeSource): PathGeometry {
  const polygon = resolvePolygon(source);
  const cached = geometryCache.get(polygon);
  if (cached !== undefined) {
    return cached;
  }
  const geometry = polygonToGeometry(polygon);
  geometryCache.set(polygon, geometry);
  return geometry;
}

/**
 * Returns the morph endpoint geometries for a pair of shapes.
 *
 * `Morph` construction runs the feature mapper and polygon measurer, so the
 * result is cached by polygon identity. Named shapes are shared instances and
 * hit the cache after the first render.
 */
export function resolveMorphEndpoints(from: ShapeSource, to: ShapeSource): MorphEndpoints {
  const start = resolvePolygon(from);
  const end = resolvePolygon(to);

  let byEnd = morphCache.get(start);
  if (byEnd === undefined) {
    byEnd = new WeakMap<RoundedPolygon, MorphEndpoints>();
    morphCache.set(start, byEnd);
  }

  const cached = byEnd.get(end);
  if (cached !== undefined) {
    return cached;
  }

  const endpoints = morphToGeometries(new Morph(start, end));
  byEnd.set(end, endpoints);
  return endpoints;
}
