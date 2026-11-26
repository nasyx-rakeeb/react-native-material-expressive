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
 * (androidx/graphics/shapes/PolygonMeasure.kt).
 */

import type { Cubic } from './Cubic';
import { Corner, type Feature } from './Features';
import { DISTANCE_EPSILON, distance, f32, type Point, positiveModulo } from './math';
import type { RoundedPolygon } from './RoundedPolygon';

export class ProgressableFeature {
  readonly progress: number;
  readonly feature: Feature;

  constructor(progress: number, feature: Feature) {
    this.progress = f32(progress);
    this.feature = feature;
  }
}

export interface Measurer {
  measureCubic(c: Cubic): number;
  findCubicCutPoint(c: Cubic, m: number): number;
}

export class LengthMeasurer implements Measurer {
  private readonly segments = 3;

  measureCubic(c: Cubic): number {
    return this.closestProgressTo(c, Number.POSITIVE_INFINITY).total;
  }

  findCubicCutPoint(c: Cubic, m: number): number {
    return this.closestProgressTo(c, m).progress;
  }

  private closestProgressTo(cubic: Cubic, threshold: number): { progress: number; total: number } {
    let total = 0;
    let remainder = threshold;
    let prev: Point = { x: cubic.anchor0X, y: cubic.anchor0Y };

    for (let i = 1; i <= this.segments; i++) {
      const progress = f32(i / this.segments);
      const point = cubic.pointOnCurve(progress);
      const segment = distance(f32(point.x - prev.x), f32(point.y - prev.y));

      if (segment >= remainder) {
        return {
          progress: f32(progress - f32(f32(1 - f32(remainder / segment)) / this.segments)),
          total: threshold,
        };
      }

      remainder = f32(remainder - segment);
      total = f32(total + segment);
      prev = point;
    }

    return { progress: 1, total };
  }
}

export class MeasuredCubic {
  readonly cubic: Cubic;
  readonly measuredSize: number;
  private readonly measurer: Measurer;
  startOutlineProgress: number;
  endOutlineProgress: number;

  constructor(
    measurer: Measurer,
    cubic: Cubic,
    startOutlineProgress: number,
    endOutlineProgress: number,
  ) {
    if (endOutlineProgress < startOutlineProgress) {
      throw new Error(
        'endOutlineProgress is expected to be equal or greater than startOutlineProgress',
      );
    }
    this.measurer = measurer;
    this.cubic = cubic;
    this.startOutlineProgress = f32(startOutlineProgress);
    this.endOutlineProgress = f32(endOutlineProgress);
    this.measuredSize = f32(measurer.measureCubic(cubic));
  }

  updateProgressRange(
    startOutlineProgress = this.startOutlineProgress,
    endOutlineProgress = this.endOutlineProgress,
  ): void {
    if (endOutlineProgress < startOutlineProgress) {
      throw new Error(
        'endOutlineProgress is expected to be equal or greater than startOutlineProgress',
      );
    }
    this.startOutlineProgress = f32(startOutlineProgress);
    this.endOutlineProgress = f32(endOutlineProgress);
  }

  cutAtProgress(cutOutlineProgress: number): [MeasuredCubic, MeasuredCubic] {
    const boundedCutOutlineProgress = Math.min(
      Math.max(cutOutlineProgress, this.startOutlineProgress),
      this.endOutlineProgress,
    );
    const outlineProgressSize = f32(this.endOutlineProgress - this.startOutlineProgress);
    const progressFromStart = f32(boundedCutOutlineProgress - this.startOutlineProgress);
    const relativeProgress = f32(progressFromStart / outlineProgressSize);
    const t = this.measurer.findCubicCutPoint(
      this.cubic,
      f32(relativeProgress * this.measuredSize),
    );
    if (t < 0 || t > 1) {
      throw new Error('Cubic cut point is expected to be between 0 and 1');
    }
    const [c1, c2] = this.cubic.split(t);
    return [
      new MeasuredCubic(this.measurer, c1, this.startOutlineProgress, boundedCutOutlineProgress),
      new MeasuredCubic(this.measurer, c2, boundedCutOutlineProgress, this.endOutlineProgress),
    ];
  }
}

export class MeasuredPolygon {
  private readonly measurer: Measurer;
  readonly features: readonly ProgressableFeature[];
  readonly cubics: readonly MeasuredCubic[];

  constructor(
    measurer: Measurer,
    features: readonly ProgressableFeature[],
    cubics: readonly Cubic[],
    outlineProgress: readonly number[],
  ) {
    if (outlineProgress.length !== cubics.length + 1) {
      throw new Error('Outline progress size is expected to be the cubics size + 1');
    }
    if (outlineProgress[0] !== 0) {
      throw new Error('First outline progress value is expected to be zero');
    }
    if (outlineProgress[outlineProgress.length - 1] !== 1) {
      throw new Error('Last outline progress value is expected to be one');
    }
    this.measurer = measurer;
    this.features = features;

    const measuredCubics: MeasuredCubic[] = [];
    let startOutlineProgress = 0;
    for (let index = 0; index < cubics.length; index++) {
      if (f32(outlineProgress[index + 1]! - outlineProgress[index]!) > DISTANCE_EPSILON) {
        measuredCubics.push(
          new MeasuredCubic(
            measurer,
            cubics[index]!,
            startOutlineProgress,
            outlineProgress[index + 1]!,
          ),
        );
        startOutlineProgress = outlineProgress[index + 1]!;
      }
    }
    measuredCubics[measuredCubics.length - 1]!.updateProgressRange(undefined, 1);
    this.cubics = measuredCubics;
  }

  get size(): number {
    return this.cubics.length;
  }

  get(index: number): MeasuredCubic {
    return this.cubics[index]!;
  }

  cutAndShift(cuttingPoint: number): MeasuredPolygon {
    if (cuttingPoint < 0 || cuttingPoint > 1) {
      throw new Error('Cutting point is expected to be between 0 and 1');
    }
    if (cuttingPoint < DISTANCE_EPSILON) {
      return this;
    }

    const targetIndex = this.cubics.findIndex(
      (cubic) =>
        cuttingPoint >= cubic.startOutlineProgress && cuttingPoint <= cubic.endOutlineProgress,
    );
    if (targetIndex < 0) {
      throw new Error('Cutting point is outside the polygon');
    }
    const target = this.cubics[targetIndex]!;
    const [b1, b2] = target.cutAtProgress(cuttingPoint);

    const retCubics: Cubic[] = [b2.cubic];
    for (let i = 1; i < this.cubics.length; i++) {
      retCubics.push(this.cubics[(i + targetIndex) % this.cubics.length]!.cubic);
    }
    retCubics.push(b1.cubic);

    const retOutlineProgress: number[] = [];
    for (let index = 0; index < this.cubics.length + 2; index++) {
      if (index === 0) {
        retOutlineProgress.push(0);
      } else if (index === this.cubics.length + 1) {
        retOutlineProgress.push(1);
      } else {
        const cubicIndex = (targetIndex + index - 1) % this.cubics.length;
        retOutlineProgress.push(
          positiveModulo(f32(this.cubics[cubicIndex]!.endOutlineProgress - cuttingPoint), 1),
        );
      }
    }

    const newFeatures = this.features.map(
      (feature) =>
        new ProgressableFeature(
          positiveModulo(f32(feature.progress - cuttingPoint), 1),
          feature.feature,
        ),
    );

    return new MeasuredPolygon(this.measurer, newFeatures, retCubics, retOutlineProgress);
  }

  static measurePolygon(measurer: Measurer, polygon: RoundedPolygon): MeasuredPolygon {
    const cubics: Cubic[] = [];
    const featureToCubic: Array<[Feature, number]> = [];

    for (const feature of polygon.features) {
      for (let cubicIndex = 0; cubicIndex < feature.cubics.length; cubicIndex++) {
        if (feature instanceof Corner && cubicIndex === Math.floor(feature.cubics.length / 2)) {
          featureToCubic.push([feature, cubics.length]);
        }
        cubics.push(feature.cubics[cubicIndex]!);
      }
    }

    const measures: number[] = [0];
    let totalMeasure = 0;
    for (const cubic of cubics) {
      const measure = measurer.measureCubic(cubic);
      if (measure < 0) {
        throw new Error('Measured cubic is expected to be greater or equal to zero');
      }
      totalMeasure = f32(totalMeasure + measure);
      measures.push(totalMeasure);
    }

    const outlineProgress = measures.map((measure) => f32(measure / totalMeasure));

    const features: ProgressableFeature[] = [];
    for (const [feature, ix] of featureToCubic) {
      features.push(
        new ProgressableFeature(
          positiveModulo(f32(f32(outlineProgress[ix]! + outlineProgress[ix + 1]!) / 2), 1),
          feature,
        ),
      );
    }

    return new MeasuredPolygon(measurer, features, cubics, outlineProgress);
  }
}
