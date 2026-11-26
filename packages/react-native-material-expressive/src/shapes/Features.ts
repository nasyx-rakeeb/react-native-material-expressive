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
 * (androidx/graphics/shapes/Features.kt).
 */

import type { Cubic } from './Cubic';
import { DISTANCE_EPSILON, type PointTransformer } from './math';

export abstract class Feature {
  readonly cubics: readonly Cubic[];

  protected constructor(cubics: readonly Cubic[]) {
    if (cubics.length === 0) {
      throw new Error('Features need at least one cubic.');
    }
    this.cubics = cubics;
  }

  abstract transformed(f: PointTransformer): Feature;

  abstract reversed(): Feature;

  abstract get isIgnorableFeature(): boolean;

  abstract get isEdge(): boolean;

  abstract get isConvexCorner(): boolean;

  abstract get isConcaveCorner(): boolean;

  static buildEdge(cubic: Cubic): Feature {
    return new Edge([cubic]);
  }

  static buildIgnorableFeature(cubics: readonly Cubic[]): Feature {
    return new Edge(cubics);
  }

  static buildConvexCorner(cubics: readonly Cubic[]): Feature {
    return new Corner(cubics, true);
  }

  static buildConcaveCorner(cubics: readonly Cubic[]): Feature {
    return new Corner(cubics, false);
  }
}

export class Edge extends Feature {
  constructor(cubics: readonly Cubic[]) {
    super(cubics);
  }

  override transformed(f: PointTransformer): Edge {
    return new Edge(this.cubics.map((cubic) => cubic.transformed(f)));
  }

  override reversed(): Edge {
    return new Edge([...this.cubics].reverse().map((cubic) => cubic.reverse()));
  }

  override get isIgnorableFeature(): boolean {
    return true;
  }

  override get isEdge(): boolean {
    return true;
  }

  override get isConvexCorner(): boolean {
    return false;
  }

  override get isConcaveCorner(): boolean {
    return false;
  }

  override toString(): string {
    return 'Edge';
  }
}

export class Corner extends Feature {
  readonly convex: boolean;

  constructor(cubics: readonly Cubic[], convex = true) {
    super(cubics);
    this.convex = convex;
  }

  override transformed(f: PointTransformer): Corner {
    return new Corner(
      this.cubics.map((cubic) => cubic.transformed(f)),
      this.convex,
    );
  }

  override reversed(): Corner {
    return new Corner(
      [...this.cubics].reverse().map((cubic) => cubic.reverse()),
      !this.convex,
    );
  }

  override get isIgnorableFeature(): boolean {
    return false;
  }

  override get isEdge(): boolean {
    return false;
  }

  override get isConvexCorner(): boolean {
    return this.convex;
  }

  override get isConcaveCorner(): boolean {
    return !this.convex;
  }

  override toString(): string {
    return `Corner: cubics=${this.cubics.map((cubic) => `[${cubic}]`).join(', ')} convex=${this.convex}`;
  }
}

export function isContinuous(feature: Feature): boolean {
  let prevCubic = feature.cubics[0]!;
  for (let index = 1; index < feature.cubics.length; index++) {
    const cubic = feature.cubics[index]!;
    if (
      Math.abs(cubic.anchor0X - prevCubic.anchor1X) > DISTANCE_EPSILON ||
      Math.abs(cubic.anchor0Y - prevCubic.anchor1Y) > DISTANCE_EPSILON
    ) {
      return false;
    }
    prevCubic = cubic;
  }
  return true;
}
