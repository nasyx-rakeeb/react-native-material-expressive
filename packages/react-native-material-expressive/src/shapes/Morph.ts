/*
 * Copyright 2022 The Android Open Source Project
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
 * (androidx/graphics/shapes/Morph.kt).
 */

import { Cubic } from './Cubic';
import { featureMapper } from './FeatureMapping';
import { ANGLE_EPSILON, f32, interpolate, positiveModulo } from './math';
import { LengthMeasurer, MeasuredPolygon, type MeasuredCubic } from './PolygonMeasure';
import type { RoundedPolygon } from './RoundedPolygon';

export type CubicPair = readonly [Cubic, Cubic];

export class Morph {
  private readonly start: RoundedPolygon;
  private readonly end: RoundedPolygon;
  readonly morphMatch: readonly CubicPair[];

  constructor(start: RoundedPolygon, end: RoundedPolygon) {
    this.start = start;
    this.end = end;
    this.morphMatch = Morph.match(start, end);
  }

  calculateBounds(bounds: number[] = [0, 0, 0, 0], approximate = true): number[] {
    this.start.calculateBounds(bounds, approximate);
    const minX = bounds[0]!;
    const minY = bounds[1]!;
    const maxX = bounds[2]!;
    const maxY = bounds[3]!;
    this.end.calculateBounds(bounds, approximate);
    bounds[0] = Math.min(minX, bounds[0]!);
    bounds[1] = Math.min(minY, bounds[1]!);
    bounds[2] = Math.max(maxX, bounds[2]!);
    bounds[3] = Math.max(maxY, bounds[3]!);
    return bounds;
  }

  calculateMaxBounds(bounds: number[] = [0, 0, 0, 0]): number[] {
    this.start.calculateMaxBounds(bounds);
    const minX = bounds[0]!;
    const minY = bounds[1]!;
    const maxX = bounds[2]!;
    const maxY = bounds[3]!;
    this.end.calculateMaxBounds(bounds);
    bounds[0] = Math.min(minX, bounds[0]!);
    bounds[1] = Math.min(minY, bounds[1]!);
    bounds[2] = Math.max(maxX, bounds[2]!);
    bounds[3] = Math.max(maxY, bounds[3]!);
    return bounds;
  }

  asCubics(progress: number): Cubic[] {
    const p = f32(progress);
    const result: Cubic[] = [];
    let firstCubic: Cubic | null = null;
    let lastCubic: Cubic | null = null;

    for (const [start, end] of this.morphMatch) {
      const points = start.points.map((value, index) => interpolate(value, end.points[index]!, p));
      const cubic = new Cubic(points);
      if (!firstCubic) {
        firstCubic = cubic;
      }
      if (lastCubic) {
        result.push(lastCubic);
      }
      lastCubic = cubic;
    }

    if (lastCubic && firstCubic) {
      result.push(
        new Cubic(
          lastCubic.anchor0X,
          lastCubic.anchor0Y,
          lastCubic.control0X,
          lastCubic.control0Y,
          lastCubic.control1X,
          lastCubic.control1Y,
          firstCubic.anchor0X,
          firstCubic.anchor0Y,
        ),
      );
    }

    return result;
  }

  private static match(p1: RoundedPolygon, p2: RoundedPolygon): readonly CubicPair[] {
    const measuredPolygon1 = MeasuredPolygon.measurePolygon(new LengthMeasurer(), p1);
    const measuredPolygon2 = MeasuredPolygon.measurePolygon(new LengthMeasurer(), p2);

    const features1 = measuredPolygon1.features;
    const features2 = measuredPolygon2.features;
    const doubleMapper = featureMapper(features1, features2);

    const polygon2CutPoint = doubleMapper.map(0);
    const bs1 = measuredPolygon1;
    const bs2 = measuredPolygon2.cutAndShift(polygon2CutPoint);

    const result: CubicPair[] = [];
    let i1 = 0;
    let i2 = 0;
    let b1: MeasuredCubic | null = bs1.cubics[i1++] ?? null;
    let b2: MeasuredCubic | null = bs2.cubics[i2++] ?? null;

    while (b1 && b2) {
      const b1a = i1 === bs1.size ? 1 : b1.endOutlineProgress;
      const b2a =
        i2 === bs2.size
          ? 1
          : doubleMapper.mapBack(positiveModulo(f32(b2.endOutlineProgress + polygon2CutPoint), 1));
      const minb = Math.min(b1a, b2a);

      let seg1: MeasuredCubic;
      let newb1: MeasuredCubic | null;
      if (b1a > minb + ANGLE_EPSILON) {
        const [first, second] = b1.cutAtProgress(minb);
        seg1 = first;
        newb1 = second;
      } else {
        seg1 = b1;
        newb1 = bs1.cubics[i1++] ?? null;
      }

      let seg2: MeasuredCubic;
      let newb2: MeasuredCubic | null;
      if (b2a > minb + ANGLE_EPSILON) {
        const [first, second] = b2.cutAtProgress(
          positiveModulo(f32(doubleMapper.map(minb) - polygon2CutPoint), 1),
        );
        seg2 = first;
        newb2 = second;
      } else {
        seg2 = b2;
        newb2 = bs2.cubics[i2++] ?? null;
      }

      result.push([seg1.cubic, seg2.cubic]);
      b1 = newb1;
      b2 = newb2;
    }

    if (b1 !== null || b2 !== null) {
      throw new Error("Expected both Polygon's Cubic to be fully matched");
    }

    return result;
  }
}
