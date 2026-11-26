/*
 * Copyright 2023 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Ported from androidx.graphics:graphics-shapes 1.1.0
 * (androidx/graphics/shapes/FeatureMapping.kt, FloatMapping.kt).
 */

import { Corner, type Feature } from './Features';
import { DISTANCE_EPSILON, distanceSquared, f32, type Point, positiveModulo } from './math';
import type { ProgressableFeature } from './PolygonMeasure';

export type ProgressMapping = readonly [number, number];

export class DoubleMapper {
  private readonly sourceValues: readonly number[];
  private readonly targetValues: readonly number[];

  constructor(mappings: readonly ProgressMapping[]) {
    if (mappings.length === 0) {
      throw new Error('DoubleMapper requires at least one mapping');
    }
    this.sourceValues = mappings.map((mapping) => f32(mapping[0]));
    this.targetValues = mappings.map((mapping) => f32(mapping[1]));
    validateProgress(this.sourceValues);
    validateProgress(this.targetValues);
  }

  map(x: number): number {
    return linearMap(this.sourceValues, this.targetValues, f32(x));
  }

  mapBack(x: number): number {
    return linearMap(this.targetValues, this.sourceValues, f32(x));
  }

  static readonly Identity = new DoubleMapper([
    [0, 0],
    [0.5, 0.5],
  ]);
}

export function progressInRange(
  progress: number,
  progressFrom: number,
  progressTo: number,
): boolean {
  if (progressTo >= progressFrom) {
    return progress >= progressFrom && progress <= progressTo;
  }
  return progress >= progressFrom || progress <= progressTo;
}

export function linearMap(
  xValues: readonly number[],
  yValues: readonly number[],
  x: number,
): number {
  if (x < 0 || x > 1) {
    throw new Error(`Invalid progress: ${x}`);
  }
  const segmentStartIndex = xValues.findIndex((value, index) =>
    progressInRange(x, value, xValues[(index + 1) % xValues.length]!),
  );
  if (segmentStartIndex < 0) {
    throw new Error(`Invalid progress: ${x}`);
  }
  const segmentEndIndex = (segmentStartIndex + 1) % xValues.length;
  const segmentSizeX = positiveModulo(
    f32(xValues[segmentEndIndex]! - xValues[segmentStartIndex]!),
    1,
  );
  const segmentSizeY = positiveModulo(
    f32(yValues[segmentEndIndex]! - yValues[segmentStartIndex]!),
    1,
  );
  const positionInSegment =
    segmentSizeX < 0.001
      ? 0.5
      : f32(positiveModulo(f32(x - xValues[segmentStartIndex]!), 1) / segmentSizeX);
  return positiveModulo(
    f32(yValues[segmentStartIndex]! + f32(segmentSizeY * positionInSegment)),
    1,
  );
}

export function progressDistance(p1: number, p2: number): number {
  const difference = f32(Math.abs(f32(p1 - p2)));
  return Math.min(difference, f32(1 - difference));
}

export function validateProgress(p: readonly number[]): void {
  if (p.length === 0) {
    throw new Error('FloatMapping - Progress list is empty');
  }
  let prev = p[p.length - 1]!;
  let wraps = 0;
  for (const curr of p) {
    if (curr < 0 || curr >= 1) {
      throw new Error(`FloatMapping - Progress outside of range: ${p.join(', ')}`);
    }
    if (progressDistance(curr, prev) <= DISTANCE_EPSILON) {
      throw new Error(`FloatMapping - Progress repeats a value: ${p.join(', ')}`);
    }
    if (curr < prev) {
      wraps++;
      if (wraps > 1) {
        throw new Error(`FloatMapping - Progress wraps more than once: ${p.join(', ')}`);
      }
    }
    prev = curr;
  }
}

export function featureMapper(
  features1: readonly ProgressableFeature[],
  features2: readonly ProgressableFeature[],
): DoubleMapper {
  const filteredFeatures1 = features1.filter((feature) => feature.feature instanceof Corner);
  const filteredFeatures2 = features2.filter((feature) => feature.feature instanceof Corner);
  return new DoubleMapper(doMapping(filteredFeatures1, filteredFeatures2));
}

interface DistanceVertex {
  readonly distance: number;
  readonly f1: ProgressableFeature;
  readonly f2: ProgressableFeature;
}

const IDENTITY_MAPPING: readonly ProgressMapping[] = [
  [0, 0],
  [0.5, 0.5],
];

export function doMapping(
  features1: readonly ProgressableFeature[],
  features2: readonly ProgressableFeature[],
): readonly ProgressMapping[] {
  const distanceVertexList: DistanceVertex[] = [];
  for (const f1 of features1) {
    for (const f2 of features2) {
      const d = featureDistSquared(f1.feature, f2.feature);
      if (Number.isFinite(d)) {
        distanceVertexList.push({ distance: d, f1, f2 });
      }
    }
  }
  distanceVertexList.sort((a, b) => a.distance - b.distance);

  if (distanceVertexList.length === 0) {
    return IDENTITY_MAPPING;
  }
  if (distanceVertexList.length === 1) {
    const { f1, f2 } = distanceVertexList[0]!;
    return [
      [f1.progress, f2.progress],
      [f32((f1.progress + 0.5) % 1), f32((f2.progress + 0.5) % 1)],
    ];
  }

  const helper = new MappingHelper();
  for (const vertex of distanceVertexList) {
    helper.addMapping(vertex.f1, vertex.f2);
  }
  return helper.mapping;
}

class MappingHelper {
  readonly mapping: ProgressMapping[] = [];
  private readonly usedF1 = new Set<ProgressableFeature>();
  private readonly usedF2 = new Set<ProgressableFeature>();

  addMapping(f1: ProgressableFeature, f2: ProgressableFeature): void {
    if (this.usedF1.has(f1) || this.usedF2.has(f2)) {
      return;
    }

    let low = 0;
    let high = this.mapping.length;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (this.mapping[mid]![0] < f1.progress) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    const insertionIndex = low;
    if (insertionIndex < this.mapping.length && this.mapping[insertionIndex]![0] === f1.progress) {
      throw new Error("There can't be two features with the same progress");
    }

    const n = this.mapping.length;
    if (n >= 1) {
      const before = this.mapping[(insertionIndex + n - 1) % n]!;
      const after = this.mapping[insertionIndex % n]!;
      if (
        progressDistance(f1.progress, before[0]) < DISTANCE_EPSILON ||
        progressDistance(f1.progress, after[0]) < DISTANCE_EPSILON ||
        progressDistance(f2.progress, before[1]) < DISTANCE_EPSILON ||
        progressDistance(f2.progress, after[1]) < DISTANCE_EPSILON
      ) {
        return;
      }
      if (n > 1 && !progressInRange(f2.progress, before[1], after[1])) {
        return;
      }
    }

    this.mapping.splice(insertionIndex, 0, [f1.progress, f2.progress]);
    this.usedF1.add(f1);
    this.usedF2.add(f2);
  }
}

export function featureDistSquared(f1: Feature, f2: Feature): number {
  if (f1 instanceof Corner && f2 instanceof Corner && f1.convex !== f2.convex) {
    return Number.POSITIVE_INFINITY;
  }
  const p1 = featureRepresentativePoint(f1);
  const p2 = featureRepresentativePoint(f2);
  return distanceSquared(f32(p1.x - p2.x), f32(p1.y - p2.y));
}

export function featureRepresentativePoint(feature: Feature): Point {
  const first = feature.cubics[0]!;
  const last = feature.cubics[feature.cubics.length - 1]!;
  return {
    x: f32(f32(first.anchor0X + last.anchor1X) / 2),
    y: f32(f32(first.anchor0Y + last.anchor1Y) / 2),
  };
}
