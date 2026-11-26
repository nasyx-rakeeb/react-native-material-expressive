/**
 * Renderer-agnostic path geometry for the shape renderers.
 *
 * This file is original project code (MIT). The shape engine it reads from is
 * derived from AndroidX and keeps its Apache-2.0 headers; see `NOTICE`.
 */

import type { Cubic } from './Cubic';
import type { Morph } from './Morph';
import type { RoundedPolygon } from './RoundedPolygon';

/**
 * A renderer-agnostic closed path made of cubic Bézier segments.
 *
 * Layout: `[anchor0X, anchor0Y, control0X, control0Y, control1X, control1Y,
 * anchor1X, anchor1Y, ...]`, one 8-number tuple per cubic. Coordinates are
 * normalised to the unit square, matching `RoundedPolygon.normalized()`.
 */
export type PathGeometry = readonly number[];

const COORDINATE_PRECISION = 1000;

function flattenCubics(cubics: readonly Cubic[]): number[] {
  const points: number[] = [];
  for (const cubic of cubics) {
    points.push(...cubic.points);
  }
  return points;
}

/** Flattens a rounded polygon's cubics into renderer-agnostic geometry. */
export function polygonToGeometry(polygon: RoundedPolygon): PathGeometry {
  return flattenCubics(polygon.cubics);
}

/**
 * Precomputes the two endpoint geometries of a morph.
 *
 * Interpolating the endpoint coordinates linearly is equivalent to
 * `Morph.asCubics(progress)`, but keeps the per-frame work to plain arithmetic
 * that can run on the UI thread without the shape engine or its classes.
 */
export function morphToGeometries(morph: Morph): {
  start: PathGeometry;
  end: PathGeometry;
} {
  const start = flattenCubics(morph.asCubics(0));
  const end = flattenCubics(morph.asCubics(1));
  if (start.length !== end.length) {
    throw new Error('Morph endpoints must have the same cubic count');
  }
  return { start, end };
}

/** Linearly interpolates two endpoint geometries at `progress` in `[0, 1]`. */
export function interpolateGeometry(
  start: PathGeometry,
  end: PathGeometry,
  progress: number,
): number[] {
  'worklet';
  if (start.length !== end.length) {
    throw new Error('Path geometries must have the same length');
  }
  const t = progress < 0 ? 0 : progress > 1 ? 1 : progress;
  const result = new Array<number>(start.length);
  for (let index = 0; index < start.length; index++) {
    const from = start[index]!;
    result[index] = from + (end[index]! - from) * t;
  }
  return result;
}

function formatCoordinate(value: number): string {
  'worklet';
  const rounded = Math.round(value * COORDINATE_PRECISION) / COORDINATE_PRECISION;
  return String(rounded === 0 ? 0 : rounded);
}

/**
 * Serialises normalised geometry to an SVG path at `width` × `height` pixels.
 *
 * The result uses absolute coordinates and closes the path. It is intentionally
 * built with string concatenation: this function runs once per animated frame.
 */
export function geometryToSvgPath(geometry: PathGeometry, width: number, height: number): string {
  'worklet';
  if (geometry.length < 8) {
    return '';
  }
  const scaleX = width;
  const scaleY = height;
  let d = `M${formatCoordinate(geometry[0]! * scaleX)} ${formatCoordinate(geometry[1]! * scaleY)}`;
  for (let index = 0; index < geometry.length; index += 8) {
    d +=
      `C${formatCoordinate(geometry[index + 2]! * scaleX)} ${formatCoordinate(geometry[index + 3]! * scaleY)} ` +
      `${formatCoordinate(geometry[index + 4]! * scaleX)} ${formatCoordinate(geometry[index + 5]! * scaleY)} ` +
      `${formatCoordinate(geometry[index + 6]! * scaleX)} ${formatCoordinate(geometry[index + 7]! * scaleY)}`;
  }
  return `${d}Z`;
}
