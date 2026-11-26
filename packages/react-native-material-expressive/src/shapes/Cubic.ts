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
 * (androidx/graphics/shapes/Cubic.kt).
 */

import {
  DISTANCE_EPSILON,
  directionVector,
  distance,
  dotProduct,
  dotProductXY,
  f32,
  interpolate,
  type Point,
  type PointTransformer,
  rotate90,
} from './math';

const ONE_THIRD = f32(1 / 3);
const TWO_THIRDS = f32(2 / 3);

/**
 * Holds the anchor and control point data for a single cubic Bezier curve.
 *
 * The point order is anchor0, control0, control1, anchor1, each as x/y pairs.
 */
export class Cubic {
  readonly points: readonly number[];

  constructor(points: readonly number[]);
  constructor(
    anchor0X: number,
    anchor0Y: number,
    control0X: number,
    control0Y: number,
    control1X: number,
    control1Y: number,
    anchor1X: number,
    anchor1Y: number,
  );
  constructor(pointsOrX: readonly number[] | number, ...rest: number[]) {
    const points =
      typeof pointsOrX === 'number' ? [pointsOrX, ...rest].map(f32) : pointsOrX.map(f32);
    if (points.length !== 8) {
      throw new Error('Points array size should be 8');
    }
    this.points = points;
  }

  get anchor0X(): number {
    return this.points[0]!;
  }

  get anchor0Y(): number {
    return this.points[1]!;
  }

  get control0X(): number {
    return this.points[2]!;
  }

  get control0Y(): number {
    return this.points[3]!;
  }

  get control1X(): number {
    return this.points[4]!;
  }

  get control1Y(): number {
    return this.points[5]!;
  }

  get anchor1X(): number {
    return this.points[6]!;
  }

  get anchor1Y(): number {
    return this.points[7]!;
  }

  pointOnCurve(t: number): Point {
    const u = f32(1 - t);
    const u2 = f32(u * u);
    const u3 = f32(u2 * u);
    const t2 = f32(t * t);
    const t3 = f32(t2 * t);
    const term1 = f32(f32(f32(3 * t) * u) * u);
    const term2 = f32(f32(f32(3 * t) * t) * u);
    return {
      x: f32(
        f32(
          f32(f32(this.anchor0X * u3) + f32(this.control0X * term1)) + f32(this.control1X * term2),
        ) + f32(this.anchor1X * t3),
      ),
      y: f32(
        f32(
          f32(f32(this.anchor0Y * u3) + f32(this.control0Y * term1)) + f32(this.control1Y * term2),
        ) + f32(this.anchor1Y * t3),
      ),
    };
  }

  zeroLength(): boolean {
    return (
      Math.abs(this.anchor0X - this.anchor1X) < DISTANCE_EPSILON &&
      Math.abs(this.anchor0Y - this.anchor1Y) < DISTANCE_EPSILON
    );
  }

  convexTo(next: Cubic): boolean {
    const prevVertex = { x: this.anchor0X, y: this.anchor0Y };
    const currVertex = { x: this.anchor1X, y: this.anchor1Y };
    const nextVertex = { x: next.anchor1X, y: next.anchor1Y };
    const current = {
      x: f32(currVertex.x - prevVertex.x),
      y: f32(currVertex.y - prevVertex.y),
    };
    const following = {
      x: f32(nextVertex.x - currVertex.x),
      y: f32(nextVertex.y - currVertex.y),
    };
    return f32(f32(current.x * following.y) - f32(current.y * following.x)) > 0;
  }

  /**
   * Fills [bounds] with left, top, right, bottom.
   */
  calculateBounds(bounds: number[] = [0, 0, 0, 0], approximate = false): number[] {
    if (bounds.length < 4) {
      throw new Error('Required bounds size of 4');
    }
    if (this.zeroLength()) {
      bounds[0] = this.anchor0X;
      bounds[1] = this.anchor0Y;
      bounds[2] = this.anchor0X;
      bounds[3] = this.anchor0Y;
      return bounds;
    }

    let minX = Math.min(this.anchor0X, this.anchor1X);
    let minY = Math.min(this.anchor0Y, this.anchor1Y);
    let maxX = Math.max(this.anchor0X, this.anchor1X);
    let maxY = Math.max(this.anchor0Y, this.anchor1Y);

    if (approximate) {
      bounds[0] = Math.min(minX, Math.min(this.control0X, this.control1X));
      bounds[1] = Math.min(minY, Math.min(this.control0Y, this.control1Y));
      bounds[2] = Math.max(maxX, Math.max(this.control0X, this.control1X));
      bounds[3] = Math.max(maxY, Math.max(this.control0Y, this.control1Y));
      return bounds;
    }

    const xa = f32(
      f32(
        f32(f32(-this.anchor0X + f32(3 * this.control0X)) - f32(3 * this.control1X)) +
          this.anchor1X,
      ),
    );
    const xb = f32(f32(f32(2 * this.anchor0X) - f32(4 * this.control0X)) + f32(2 * this.control1X));
    const xc = f32(-this.anchor0X + this.control0X);

    if (Math.abs(xa) < DISTANCE_EPSILON) {
      if (xb !== 0) {
        const t = f32(f32(2 * xc) / f32(-2 * xb));
        if (t >= 0 && t <= 1) {
          const value = this.pointOnCurve(t).x;
          if (value < minX) minX = value;
          if (value > maxX) maxX = value;
        }
      }
    } else {
      const xs = f32(f32(xb * xb) - f32(f32(4 * xa) * xc));
      if (xs >= 0) {
        const t1 = f32(f32(-xb + f32(Math.sqrt(xs))) / f32(2 * xa));
        if (t1 >= 0 && t1 <= 1) {
          const value = this.pointOnCurve(t1).x;
          if (value < minX) minX = value;
          if (value > maxX) maxX = value;
        }
        const t2 = f32(f32(-xb - f32(Math.sqrt(xs))) / f32(2 * xa));
        if (t2 >= 0 && t2 <= 1) {
          const value = this.pointOnCurve(t2).x;
          if (value < minX) minX = value;
          if (value > maxX) maxX = value;
        }
      }
    }

    const ya = f32(
      f32(
        f32(f32(-this.anchor0Y + f32(3 * this.control0Y)) - f32(3 * this.control1Y)) +
          this.anchor1Y,
      ),
    );
    const yb = f32(f32(f32(2 * this.anchor0Y) - f32(4 * this.control0Y)) + f32(2 * this.control1Y));
    const yc = f32(-this.anchor0Y + this.control0Y);

    if (Math.abs(ya) < DISTANCE_EPSILON) {
      if (yb !== 0) {
        const t = f32(f32(2 * yc) / f32(-2 * yb));
        if (t >= 0 && t <= 1) {
          const value = this.pointOnCurve(t).y;
          if (value < minY) minY = value;
          if (value > maxY) maxY = value;
        }
      }
    } else {
      const ys = f32(f32(yb * yb) - f32(f32(4 * ya) * yc));
      if (ys >= 0) {
        const t1 = f32(f32(-yb + f32(Math.sqrt(ys))) / f32(2 * ya));
        if (t1 >= 0 && t1 <= 1) {
          const value = this.pointOnCurve(t1).y;
          if (value < minY) minY = value;
          if (value > maxY) maxY = value;
        }
        const t2 = f32(f32(-yb - f32(Math.sqrt(ys))) / f32(2 * ya));
        if (t2 >= 0 && t2 <= 1) {
          const value = this.pointOnCurve(t2).y;
          if (value < minY) minY = value;
          if (value > maxY) maxY = value;
        }
      }
    }

    bounds[0] = minX;
    bounds[1] = minY;
    bounds[2] = maxX;
    bounds[3] = maxY;
    return bounds;
  }

  split(t: number): [Cubic, Cubic] {
    const u = f32(1 - t);
    const pointOnCurve = this.pointOnCurve(t);
    const u2 = f32(u * u);
    const t2 = f32(t * t);
    const ut2 = f32(f32(2 * u) * t);
    return [
      new Cubic(
        this.anchor0X,
        this.anchor0Y,
        f32(f32(this.anchor0X * u) + f32(this.control0X * t)),
        f32(f32(this.anchor0Y * u) + f32(this.control0Y * t)),
        f32(f32(f32(this.anchor0X * u2) + f32(this.control0X * ut2)) + f32(this.control1X * t2)),
        f32(f32(f32(this.anchor0Y * u2) + f32(this.control0Y * ut2)) + f32(this.control1Y * t2)),
        pointOnCurve.x,
        pointOnCurve.y,
      ),
      new Cubic(
        pointOnCurve.x,
        pointOnCurve.y,
        f32(f32(f32(this.control0X * u2) + f32(this.control1X * ut2)) + f32(this.anchor1X * t2)),
        f32(f32(f32(this.control0Y * u2) + f32(this.control1Y * ut2)) + f32(this.anchor1Y * t2)),
        f32(f32(this.control1X * u) + f32(this.anchor1X * t)),
        f32(f32(this.control1Y * u) + f32(this.anchor1Y * t)),
        this.anchor1X,
        this.anchor1Y,
      ),
    ];
  }

  reverse(): Cubic {
    return new Cubic(
      this.anchor1X,
      this.anchor1Y,
      this.control1X,
      this.control1Y,
      this.control0X,
      this.control0Y,
      this.anchor0X,
      this.anchor0Y,
    );
  }

  transformed(f: PointTransformer): Cubic {
    const a0 = f(this.anchor0X, this.anchor0Y);
    const c0 = f(this.control0X, this.control0Y);
    const c1 = f(this.control1X, this.control1Y);
    const a1 = f(this.anchor1X, this.anchor1Y);
    return new Cubic(a0.x, a0.y, c0.x, c0.y, c1.x, c1.y, a1.x, a1.y);
  }

  static straightLine(x0: number, y0: number, x1: number, y1: number): Cubic {
    return new Cubic(
      x0,
      y0,
      interpolate(x0, x1, ONE_THIRD),
      interpolate(y0, y1, ONE_THIRD),
      interpolate(x0, x1, TWO_THIRDS),
      interpolate(y0, y1, TWO_THIRDS),
      x1,
      y1,
    );
  }

  static circularArc(
    centerX: number,
    centerY: number,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
  ): Cubic {
    const p0d = directionVector(f32(x0 - centerX), f32(y0 - centerY));
    const p1d = directionVector(f32(x1 - centerX), f32(y1 - centerY));
    const rotatedP0 = rotate90(p0d);
    const rotatedP1 = rotate90(p1d);
    const isClockwise = dotProductXY(rotatedP0, f32(x1 - centerX), f32(y1 - centerY)) >= 0;
    const cosa = dotProduct(p0d, p1d);
    if (cosa > 0.999) {
      return Cubic.straightLine(x0, y0, x1, y1);
    }
    const sqrtDifference = f32(
      f32(Math.sqrt(f32(2 * f32(1 - cosa)))) - f32(Math.sqrt(f32(1 - f32(cosa * cosa)))),
    );
    const k =
      f32(
        f32(f32(f32(distance(f32(x0 - centerX), f32(y0 - centerY)) * 4) / 3) * sqrtDifference) /
          f32(1 - cosa),
      ) * (isClockwise ? 1 : -1);
    return new Cubic(
      x0,
      y0,
      f32(x0 + f32(rotatedP0.x * k)),
      f32(y0 + f32(rotatedP0.y * k)),
      f32(x1 - f32(rotatedP1.x * k)),
      f32(y1 - f32(rotatedP1.y * k)),
      x1,
      y1,
    );
  }

  static empty(x0: number, y0: number): Cubic {
    return new Cubic(x0, y0, x0, y0, x0, y0, x0, y0);
  }
}
