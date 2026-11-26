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
 * (androidx/graphics/shapes/RoundedPolygon.kt, Shapes.kt).
 */

import { CornerRounding } from './CornerRounding';
import { Cubic } from './Cubic';
import { Corner, Edge, type Feature } from './Features';
import {
  add,
  convex,
  DISTANCE_EPSILON,
  directionVector,
  distance,
  divide,
  dotProduct,
  f32,
  FLOAT_PI,
  getDistance,
  interpolate,
  interpolatePoint,
  multiply,
  type Point,
  type PointTransformer,
  radialToCartesian,
  rotate90,
  square,
  subtract,
  TWO_PI,
} from './math';

export interface RoundedPolygonVerticesOptions {
  rounding?: CornerRounding;
  perVertexRounding?: readonly CornerRounding[];
  centerX?: number;
  centerY?: number;
}

export class RoundedPolygon {
  readonly features: readonly Feature[];
  readonly center: Point;
  readonly cubics: readonly Cubic[];

  constructor(features: readonly Feature[], center: Point) {
    this.features = features;
    this.center = { x: f32(center.x), y: f32(center.y) };
    this.cubics = buildCubics(features, center);

    let prevCubic = this.cubics[this.cubics.length - 1]!;
    for (const cubic of this.cubics) {
      if (
        Math.abs(cubic.anchor0X - prevCubic.anchor1X) > DISTANCE_EPSILON ||
        Math.abs(cubic.anchor0Y - prevCubic.anchor1Y) > DISTANCE_EPSILON
      ) {
        throw new Error(
          'RoundedPolygon must be contiguous, with the anchor points of all curves matching the anchor points of the preceding and succeeding cubics',
        );
      }
      prevCubic = cubic;
    }
  }

  get centerX(): number {
    return this.center.x;
  }

  get centerY(): number {
    return this.center.y;
  }

  static fromNumVertices(
    numVertices: number,
    radius = 1,
    centerX = 0,
    centerY = 0,
    rounding: CornerRounding = CornerRounding.Unrounded,
    perVertexRounding?: readonly CornerRounding[],
  ): RoundedPolygon {
    return RoundedPolygon.fromVertices(
      verticesFromNumVerts(numVertices, f32(radius), f32(centerX), f32(centerY)),
      { rounding, perVertexRounding, centerX: f32(centerX), centerY: f32(centerY) },
    );
  }

  static fromVertices(
    vertices: readonly number[],
    options: RoundedPolygonVerticesOptions = {},
  ): RoundedPolygon {
    if (vertices.length < 6) {
      throw new Error('Polygons must have at least 3 vertices');
    }
    if (vertices.length % 2 === 1) {
      throw new Error('The vertices array should have even size');
    }
    const perVertexRounding = options.perVertexRounding;
    if (perVertexRounding && perVertexRounding.length * 2 !== vertices.length) {
      throw new Error(
        'perVertexRounding list should be either null or the same size as the number of vertices (vertices.size / 2)',
      );
    }

    const n = vertices.length / 2;
    const roundedCorners: RoundedCorner[] = [];
    for (let i = 0; i < n; i++) {
      const vtxRounding = perVertexRounding?.[i] ?? options.rounding ?? CornerRounding.Unrounded;
      const prevIndex = ((i + n - 1) % n) * 2;
      const nextIndex = ((i + 1) % n) * 2;
      roundedCorners.push(
        new RoundedCorner(
          { x: vertices[prevIndex]!, y: vertices[prevIndex + 1]! },
          { x: vertices[i * 2]!, y: vertices[i * 2 + 1]! },
          { x: vertices[nextIndex]!, y: vertices[nextIndex + 1]! },
          vtxRounding,
        ),
      );
    }

    const cutAdjusts: Array<[number, number]> = [];
    for (let ix = 0; ix < n; ix++) {
      const expectedRoundCut = f32(
        roundedCorners[ix]!.expectedRoundCut + roundedCorners[(ix + 1) % n]!.expectedRoundCut,
      );
      const expectedCut = f32(
        roundedCorners[ix]!.expectedCut + roundedCorners[(ix + 1) % n]!.expectedCut,
      );
      const vtxX = vertices[ix * 2]!;
      const vtxY = vertices[ix * 2 + 1]!;
      const nextVtxX = vertices[((ix + 1) % n) * 2]!;
      const nextVtxY = vertices[((ix + 1) % n) * 2 + 1]!;
      const sideSize = distance(vtxX - nextVtxX, vtxY - nextVtxY);

      if (expectedRoundCut > sideSize) {
        cutAdjusts.push([f32(sideSize / expectedRoundCut), 0]);
      } else if (expectedCut > sideSize) {
        cutAdjusts.push([
          1,
          f32(f32(sideSize - expectedRoundCut) / f32(expectedCut - expectedRoundCut)),
        ]);
      } else {
        cutAdjusts.push([1, 1]);
      }
    }

    const corners: Cubic[][] = [];
    for (let i = 0; i < n; i++) {
      const allowedCuts: number[] = [];
      for (let delta = 0; delta <= 1; delta++) {
        const [roundCutRatio, cutRatio] = cutAdjusts[(i + n - 1 + delta) % n]!;
        allowedCuts.push(
          f32(
            f32(roundedCorners[i]!.expectedRoundCut * roundCutRatio) +
              f32(
                f32(roundedCorners[i]!.expectedCut - roundedCorners[i]!.expectedRoundCut) *
                  cutRatio,
              ),
          ),
        );
      }
      corners.push(roundedCorners[i]!.getCubics(allowedCuts[0]!, allowedCuts[1]!));
    }

    const tempFeatures: Feature[] = [];
    for (let i = 0; i < n; i++) {
      const prevVtxIndex = (i + n - 1) % n;
      const nextVtxIndex = (i + 1) % n;
      const currVertex = { x: vertices[i * 2]!, y: vertices[i * 2 + 1]! };
      const prevVertex = {
        x: vertices[prevVtxIndex * 2]!,
        y: vertices[prevVtxIndex * 2 + 1]!,
      };
      const nextVertex = {
        x: vertices[nextVtxIndex * 2]!,
        y: vertices[nextVtxIndex * 2 + 1]!,
      };
      const isConvex = isConvexVertex(prevVertex, currVertex, nextVertex);
      tempFeatures.push(new Corner(corners[i]!, isConvex));
      tempFeatures.push(
        new Edge([
          Cubic.straightLine(
            corners[i]![corners[i]!.length - 1]!.anchor1X,
            corners[i]![corners[i]!.length - 1]!.anchor1Y,
            corners[(i + 1) % n]![0]!.anchor0X,
            corners[(i + 1) % n]![0]!.anchor0Y,
          ),
        ]),
      );
    }

    const center =
      options.centerX !== undefined && options.centerY !== undefined
        ? { x: options.centerX, y: options.centerY }
        : calculateCenter(vertices);
    return new RoundedPolygon(tempFeatures, center);
  }

  static fromFeatures(
    features: readonly Feature[],
    centerX?: number,
    centerY?: number,
  ): RoundedPolygon {
    if (features.length < 2) {
      throw new Error('Polygons must have at least 2 features');
    }
    const vertices: number[] = [];
    for (const feature of features) {
      for (const cubic of feature.cubics) {
        vertices.push(cubic.anchor0X, cubic.anchor0Y);
      }
    }
    const cX = centerX ?? calculateCenter(vertices).x;
    const cY = centerY ?? calculateCenter(vertices).y;
    return new RoundedPolygon(features, { x: cX, y: cY });
  }

  static circle(numVertices = 8, radius = 1, centerX = 0, centerY = 0): RoundedPolygon {
    if (numVertices < 3) {
      throw new Error('Circle must have at least three vertices');
    }
    radius = f32(radius);
    centerX = f32(centerX);
    centerY = f32(centerY);
    const theta = f32(FLOAT_PI / numVertices);
    const polygonRadius = f32(radius / f32(Math.cos(theta)));
    return RoundedPolygon.fromNumVertices(
      numVertices,
      polygonRadius,
      centerX,
      centerY,
      new CornerRounding(radius),
    );
  }

  static rectangle(
    width = 2,
    height = 2,
    rounding: CornerRounding = CornerRounding.Unrounded,
    perVertexRounding?: readonly CornerRounding[],
    centerX = 0,
    centerY = 0,
  ): RoundedPolygon {
    width = f32(width);
    height = f32(height);
    centerX = f32(centerX);
    centerY = f32(centerY);
    const left = f32(centerX - f32(width / 2));
    const top = f32(centerY - f32(height / 2));
    const right = f32(centerX + f32(width / 2));
    const bottom = f32(centerY + f32(height / 2));
    return RoundedPolygon.fromVertices([right, bottom, left, bottom, left, top, right, top], {
      rounding,
      perVertexRounding,
      centerX,
      centerY,
    });
  }

  static star(
    numVerticesPerRadius: number,
    radius = 1,
    innerRadius = 0.5,
    rounding: CornerRounding = CornerRounding.Unrounded,
    innerRounding?: CornerRounding,
    perVertexRounding?: readonly CornerRounding[],
    centerX = 0,
    centerY = 0,
  ): RoundedPolygon {
    radius = f32(radius);
    innerRadius = f32(innerRadius);
    centerX = f32(centerX);
    centerY = f32(centerY);
    if (radius <= 0 || innerRadius <= 0) {
      throw new Error('Star radii must both be greater than 0');
    }
    if (innerRadius >= radius) {
      throw new Error('innerRadius must be less than radius');
    }
    let pvRounding = perVertexRounding ? [...perVertexRounding] : undefined;
    if (!pvRounding && innerRounding) {
      pvRounding = [];
      for (let i = 0; i < numVerticesPerRadius; i++) {
        pvRounding.push(rounding, innerRounding);
      }
    }
    return RoundedPolygon.fromVertices(
      starVerticesFromNumVerts(numVerticesPerRadius, radius, innerRadius, centerX, centerY),
      { rounding, perVertexRounding: pvRounding, centerX, centerY },
    );
  }

  static pill(width = 2, height = 1, smoothing = 0, centerX = 0, centerY = 0): RoundedPolygon {
    if (!(width > 0 && height > 0)) {
      throw new Error('Pill shapes must have positive width and height');
    }
    const wHalf = width / 2;
    const hHalf = height / 2;
    return RoundedPolygon.fromVertices(
      [
        wHalf + centerX,
        hHalf + centerY,
        -wHalf + centerX,
        hHalf + centerY,
        -wHalf + centerX,
        -hHalf + centerY,
        wHalf + centerX,
        -hHalf + centerY,
      ],
      {
        rounding: new CornerRounding(Math.min(wHalf, hHalf), smoothing),
        centerX,
        centerY,
      },
    );
  }

  static pillStar(
    width = 2,
    height = 1,
    numVerticesPerRadius = 8,
    innerRadiusRatio = 0.5,
    rounding: CornerRounding = CornerRounding.Unrounded,
    innerRounding?: CornerRounding,
    perVertexRounding?: readonly CornerRounding[],
    vertexSpacing = 0.5,
    startLocation = 0,
    centerX = 0,
    centerY = 0,
  ): RoundedPolygon {
    if (!(width > 0 && height > 0)) {
      throw new Error('Pill shapes must have positive width and height');
    }
    if (!(innerRadiusRatio > 0 && innerRadiusRatio <= 1)) {
      throw new Error('innerRadius must be between 0 and 1');
    }
    let pvRounding = perVertexRounding ? [...perVertexRounding] : undefined;
    if (!pvRounding && innerRounding) {
      pvRounding = [];
      for (let i = 0; i < numVerticesPerRadius; i++) {
        pvRounding.push(rounding, innerRounding);
      }
    }
    return RoundedPolygon.fromVertices(
      pillStarVerticesFromNumVerts(
        numVerticesPerRadius,
        width,
        height,
        innerRadiusRatio,
        vertexSpacing,
        startLocation,
        centerX,
        centerY,
      ),
      { rounding, perVertexRounding: pvRounding, centerX, centerY },
    );
  }

  transformed(f: PointTransformer): RoundedPolygon {
    const center = f(this.center.x, this.center.y);
    return new RoundedPolygon(
      this.features.map((feature) => feature.transformed(f)),
      center,
    );
  }

  normalized(): RoundedPolygon {
    const bounds = this.calculateBounds();
    const width = f32(bounds[2]! - bounds[0]!);
    const height = f32(bounds[3]! - bounds[1]!);
    const side = Math.max(width, height);
    const offsetX = f32(f32(f32(side - width) / 2) - bounds[0]!);
    const offsetY = f32(f32(f32(side - height) / 2) - bounds[1]!);
    return this.transformed((x, y) => ({
      x: f32(f32(x + offsetX) / side),
      y: f32(f32(y + offsetY) / side),
    }));
  }

  calculateBounds(bounds: number[] = [0, 0, 0, 0], approximate = true): number[] {
    if (bounds.length < 4) {
      throw new Error('Required bounds size of 4');
    }
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    let maxX = Number.MIN_VALUE;
    let maxY = Number.MIN_VALUE;
    for (const cubic of this.cubics) {
      cubic.calculateBounds(bounds, approximate);
      minX = Math.min(minX, bounds[0]!);
      minY = Math.min(minY, bounds[1]!);
      maxX = Math.max(maxX, bounds[2]!);
      maxY = Math.max(maxY, bounds[3]!);
    }
    bounds[0] = minX;
    bounds[1] = minY;
    bounds[2] = maxX;
    bounds[3] = maxY;
    return bounds;
  }

  calculateMaxBounds(bounds: number[] = [0, 0, 0, 0]): number[] {
    if (bounds.length < 4) {
      throw new Error('Required bounds size of 4');
    }
    let maxDistSquared = 0;
    for (const cubic of this.cubics) {
      const anchorDistance =
        (cubic.anchor0X - this.centerX) ** 2 + (cubic.anchor0Y - this.centerY) ** 2;
      const middlePoint = cubic.pointOnCurve(0.5);
      const middleDistance =
        (middlePoint.x - this.centerX) ** 2 + (middlePoint.y - this.centerY) ** 2;
      maxDistSquared = Math.max(maxDistSquared, anchorDistance, middleDistance);
    }
    const distanceToBound = Math.sqrt(maxDistSquared);
    bounds[0] = this.centerX - distanceToBound;
    bounds[1] = this.centerY - distanceToBound;
    bounds[2] = this.centerX + distanceToBound;
    bounds[3] = this.centerY + distanceToBound;
    return bounds;
  }

  toString(): string {
    return `[RoundedPolygon. Cubics = ${this.cubics.join(', ')} || Features = ${this.features.join(
      ', ',
    )} || Center = (${this.centerX}, ${this.centerY})]`;
  }
}

function buildCubics(features: readonly Feature[], center: Point): Cubic[] {
  const cubics: Cubic[] = [];
  let firstCubic: Cubic | null = null;
  let lastCubic: Cubic | null = null;
  let firstFeatureSplitStart: Cubic[] | null = null;
  let firstFeatureSplitEnd: Cubic[] | null = null;

  if (features.length > 0 && features[0]!.cubics.length === 3) {
    const centerCubic = features[0]!.cubics[1]!;
    const [start, end] = centerCubic.split(0.5);
    firstFeatureSplitStart = [features[0]!.cubics[0]!, start];
    firstFeatureSplitEnd = [end, features[0]!.cubics[2]!];
  }

  for (let i = 0; i <= features.length; i++) {
    let featureCubics: readonly Cubic[];
    if (i === 0 && firstFeatureSplitEnd) {
      featureCubics = firstFeatureSplitEnd;
    } else if (i === features.length) {
      if (firstFeatureSplitStart) {
        featureCubics = firstFeatureSplitStart;
      } else {
        break;
      }
    } else {
      featureCubics = features[i]!.cubics;
    }

    for (const cubic of featureCubics) {
      if (!cubic.zeroLength()) {
        if (lastCubic) {
          cubics.push(lastCubic);
        }
        lastCubic = cubic;
        if (!firstCubic) {
          firstCubic = cubic;
        }
      } else if (lastCubic) {
        const points: number[] = [...lastCubic.points];
        points[6] = cubic.anchor1X;
        points[7] = cubic.anchor1Y;
        lastCubic = new Cubic(points);
      }
    }
  }

  if (lastCubic && firstCubic) {
    cubics.push(
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
  } else {
    cubics.push(
      new Cubic(center.x, center.y, center.x, center.y, center.x, center.y, center.x, center.y),
    );
  }
  return cubics;
}

function isConvexVertex(previous: Point, current: Point, next: Point): boolean {
  return convex(previous, current, next);
}

function calculateCenter(vertices: readonly number[]): Point {
  let cumulativeX = 0;
  let cumulativeY = 0;
  let index = 0;
  while (index < vertices.length) {
    cumulativeX = f32(cumulativeX + vertices[index++]!);
    cumulativeY = f32(cumulativeY + vertices[index++]!);
  }
  const count = f32(vertices.length / 2);
  return {
    x: f32(cumulativeX / count),
    y: f32(cumulativeY / count),
  };
}

function verticesFromNumVerts(
  numVertices: number,
  radius: number,
  centerX: number,
  centerY: number,
): number[] {
  const result: number[] = [];
  for (let i = 0; i < numVertices; i++) {
    const vertex = add(radialToCartesian(radius, f32(f32(f32(FLOAT_PI / numVertices) * 2) * i)), {
      x: centerX,
      y: centerY,
    });
    result.push(vertex.x, vertex.y);
  }
  return result;
}

function starVerticesFromNumVerts(
  numVerticesPerRadius: number,
  radius: number,
  innerRadius: number,
  centerX: number,
  centerY: number,
): number[] {
  const result: number[] = [];
  for (let i = 0; i < numVerticesPerRadius; i++) {
    let vertex = radialToCartesian(radius, f32(f32(f32(FLOAT_PI / numVerticesPerRadius) * 2) * i));
    result.push(f32(vertex.x + centerX), f32(vertex.y + centerY));
    vertex = radialToCartesian(
      innerRadius,
      f32(f32(FLOAT_PI / numVerticesPerRadius) * f32(2 * i + 1)),
    );
    result.push(f32(vertex.x + centerX), f32(vertex.y + centerY));
  }
  return result;
}

function pillStarVerticesFromNumVerts(
  numVerticesPerRadius: number,
  width: number,
  height: number,
  innerRadius: number,
  vertexSpacing: number,
  startLocation: number,
  centerX: number,
  centerY: number,
): number[] {
  const endcapRadius = Math.min(width, height);
  const vSegLen = Math.max(height - width, 0);
  const hSegLen = Math.max(width - height, 0);
  const vSegHalf = vSegLen / 2;
  const hSegHalf = hSegLen / 2;
  const circlePerimeter = TWO_PI * endcapRadius * interpolate(innerRadius, 1, vertexSpacing);
  const perimeter = 2 * hSegLen + 2 * vSegLen + circlePerimeter;

  const sections = new Array<number>(11);
  sections[0] = 0;
  sections[1] = vSegLen / 2;
  sections[2] = sections[1]! + circlePerimeter / 4;
  sections[3] = sections[2]! + hSegLen;
  sections[4] = sections[3]! + circlePerimeter / 4;
  sections[5] = sections[4]! + vSegLen;
  sections[6] = sections[5]! + circlePerimeter / 4;
  sections[7] = sections[6]! + hSegLen;
  sections[8] = sections[7]! + circlePerimeter / 4;
  sections[9] = sections[8]! + vSegLen / 2;
  sections[10] = perimeter;

  const tPerVertex = perimeter / (2 * numVerticesPerRadius);
  let inner = false;
  let currSecIndex = 0;
  let secStart = 0;
  let secEnd = sections[1]!;
  let t = startLocation * perimeter;
  const result = new Array<number>(numVerticesPerRadius * 4);
  let arrayIndex = 0;
  const rectBR = { x: hSegHalf, y: vSegHalf };
  const rectBL = { x: -hSegHalf, y: vSegHalf };
  const rectTL = { x: -hSegHalf, y: -vSegHalf };
  const rectTR = { x: hSegHalf, y: -vSegHalf };

  for (let i = 0; i < numVerticesPerRadius * 2; i++) {
    const boundedT = t % perimeter;
    if (boundedT < secStart) {
      currSecIndex = 0;
    }
    while (boundedT >= sections[(currSecIndex + 1) % sections.length]!) {
      currSecIndex = (currSecIndex + 1) % sections.length;
      secStart = sections[currSecIndex]!;
      secEnd = sections[(currSecIndex + 1) % sections.length]!;
    }

    const tInSection = boundedT - secStart;
    const tProportion = tInSection / (secEnd - secStart);
    const currRadius = inner ? endcapRadius * innerRadius : endcapRadius;
    let vertex: Point;
    switch (currSecIndex) {
      case 0:
        vertex = { x: currRadius, y: tProportion * vSegHalf };
        break;
      case 1:
        vertex = add(radialToCartesian(currRadius, (tProportion * FLOAT_PI) / 2), rectBR);
        break;
      case 2:
        vertex = { x: hSegHalf - tProportion * hSegLen, y: currRadius };
        break;
      case 3:
        vertex = add(
          radialToCartesian(currRadius, FLOAT_PI / 2 + (tProportion * FLOAT_PI) / 2),
          rectBL,
        );
        break;
      case 4:
        vertex = { x: -currRadius, y: vSegHalf - tProportion * vSegLen };
        break;
      case 5:
        vertex = add(
          radialToCartesian(currRadius, FLOAT_PI + (tProportion * FLOAT_PI) / 2),
          rectTL,
        );
        break;
      case 6:
        vertex = { x: -hSegHalf + tProportion * hSegLen, y: -currRadius };
        break;
      case 7:
        vertex = add(
          radialToCartesian(currRadius, FLOAT_PI * 1.5 + (tProportion * FLOAT_PI) / 2),
          rectTR,
        );
        break;
      default:
        vertex = { x: currRadius, y: -vSegHalf + tProportion * vSegHalf };
        break;
    }
    result[arrayIndex++] = vertex.x + centerX;
    result[arrayIndex++] = vertex.y + centerY;
    t += tPerVertex;
    inner = !inner;
  }
  return result;
}

class RoundedCorner {
  readonly p0: Point;
  readonly p1: Point;
  readonly p2: Point;
  readonly rounding: CornerRounding;
  readonly d1: Point;
  readonly d2: Point;
  readonly cornerRadius: number;
  readonly smoothing: number;
  readonly cosAngle: number;
  readonly sinAngle: number;
  readonly expectedRoundCut: number;
  center: Point = { x: 0, y: 0 };

  constructor(p0: Point, p1: Point, p2: Point, rounding: CornerRounding) {
    this.p0 = p0;
    this.p1 = p1;
    this.p2 = p2;
    this.rounding = rounding;
    const v01 = subtract(p0, p1);
    const v21 = subtract(p2, p1);
    const d01 = getDistance(v01);
    const d21 = getDistance(v21);
    if (d01 > 0 && d21 > 0) {
      this.d1 = divide(v01, d01);
      this.d2 = divide(v21, d21);
      this.cornerRadius = rounding.radius;
      this.smoothing = rounding.smoothing;
      this.cosAngle = dotProduct(this.d1, this.d2);
      this.sinAngle = f32(Math.sqrt(f32(1 - square(this.cosAngle))));
      this.expectedRoundCut =
        this.sinAngle > 1e-3
          ? f32(f32(this.cornerRadius * f32(this.cosAngle + 1)) / this.sinAngle)
          : 0;
    } else {
      this.d1 = { x: 0, y: 0 };
      this.d2 = { x: 0, y: 0 };
      this.cornerRadius = 0;
      this.smoothing = 0;
      this.cosAngle = 0;
      this.sinAngle = 0;
      this.expectedRoundCut = 0;
    }
  }

  get expectedCut(): number {
    return f32(f32(1 + this.smoothing) * this.expectedRoundCut);
  }

  getCubics(allowedCut0: number, allowedCut1 = allowedCut0): Cubic[] {
    const allowedCut = Math.min(allowedCut0, allowedCut1);
    if (
      this.expectedRoundCut < DISTANCE_EPSILON ||
      allowedCut < DISTANCE_EPSILON ||
      this.cornerRadius < DISTANCE_EPSILON
    ) {
      this.center = this.p1;
      return [Cubic.straightLine(this.p1.x, this.p1.y, this.p1.x, this.p1.y)];
    }

    const actualRoundCut = Math.min(allowedCut, this.expectedRoundCut);
    const actualSmoothing0 = this.calculateActualSmoothingValue(allowedCut0);
    const actualSmoothing1 = this.calculateActualSmoothingValue(allowedCut1);
    const actualR = f32(f32(this.cornerRadius * actualRoundCut) / this.expectedRoundCut);
    const centerDistance = f32(Math.sqrt(f32(square(actualR) + square(actualRoundCut))));
    const direction = directionVector(
      f32(f32(this.d1.x + this.d2.x) / 2),
      f32(f32(this.d1.y + this.d2.y) / 2),
    );
    this.center = add(this.p1, multiply(direction, centerDistance));
    const circleIntersection0 = add(this.p1, multiply(this.d1, actualRoundCut));
    const circleIntersection2 = add(this.p1, multiply(this.d2, actualRoundCut));
    const flanking0 = this.computeFlankingCurve(
      actualRoundCut,
      actualSmoothing0,
      this.p1,
      this.p0,
      circleIntersection0,
      circleIntersection2,
      this.center,
      actualR,
    );
    const flanking2 = this.computeFlankingCurve(
      actualRoundCut,
      actualSmoothing1,
      this.p1,
      this.p2,
      circleIntersection2,
      circleIntersection0,
      this.center,
      actualR,
    ).reverse();
    return [
      flanking0,
      Cubic.circularArc(
        this.center.x,
        this.center.y,
        flanking0.anchor1X,
        flanking0.anchor1Y,
        flanking2.anchor0X,
        flanking2.anchor0Y,
      ),
      flanking2,
    ];
  }

  private calculateActualSmoothingValue(allowedCut: number): number {
    if (allowedCut > this.expectedCut) {
      return this.smoothing;
    }
    if (allowedCut > this.expectedRoundCut) {
      return f32(
        f32(this.smoothing * f32(allowedCut - this.expectedRoundCut)) /
          f32(this.expectedCut - this.expectedRoundCut),
      );
    }
    return 0;
  }

  private computeFlankingCurve(
    actualRoundCut: number,
    actualSmoothingValues: number,
    corner: Point,
    sideStart: Point,
    circleSegmentIntersection: Point,
    otherCircleSegmentIntersection: Point,
    circleCenter: Point,
    actualR: number,
  ): Cubic {
    const sideDirection = directionVector(f32(sideStart.x - corner.x), f32(sideStart.y - corner.y));
    const curveStart = add(
      corner,
      multiply(multiply(sideDirection, actualRoundCut), f32(1 + actualSmoothingValues)),
    );
    const p = interpolatePoint(
      circleSegmentIntersection,
      divide(add(circleSegmentIntersection, otherCircleSegmentIntersection), 2),
      actualSmoothingValues,
    );
    const curveEnd = add(
      circleCenter,
      multiply(directionVector(f32(p.x - circleCenter.x), f32(p.y - circleCenter.y)), actualR),
    );
    const circleTangent = rotate90(subtract(curveEnd, circleCenter));
    const anchorEnd =
      this.lineIntersection(sideStart, sideDirection, curveEnd, circleTangent) ??
      circleSegmentIntersection;
    const anchorStart = divide(add(curveStart, multiply(anchorEnd, 2)), 3);
    return new Cubic(
      curveStart.x,
      curveStart.y,
      anchorStart.x,
      anchorStart.y,
      anchorEnd.x,
      anchorEnd.y,
      curveEnd.x,
      curveEnd.y,
    );
  }

  private lineIntersection(p0: Point, d0: Point, p1: Point, d1: Point): Point | null {
    const rotatedD1 = rotate90(d1);
    const den = dotProduct(d0, rotatedD1);
    if (Math.abs(den) < DISTANCE_EPSILON) {
      return null;
    }
    const num = dotProduct(subtract(p1, p0), rotatedD1);
    if (Math.abs(den) < f32(DISTANCE_EPSILON * Math.abs(num))) {
      return null;
    }
    const k = f32(num / den);
    return add(p0, multiply(d0, k));
  }
}
