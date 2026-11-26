/*
 * Copyright 2024 The Android Open Source Project
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
 * Ported from androidx.compose.material3:material3 1.5.0
 * (commonMain/androidx/compose/material3/MaterialShapes.kt).
 */

import { CornerRounding } from './CornerRounding';
import { type Point, rotateDegrees } from './math';
import { RoundedPolygon } from './RoundedPolygon';

interface PointNRound {
  readonly o: Point;
  readonly r: CornerRounding;
}

const f32 = Math.fround;
const FLOAT_PI = f32(Math.PI);

const cornerRound15 = new CornerRounding(0.15);
const cornerRound20 = new CornerRounding(0.2);
const cornerRound30 = new CornerRounding(0.3);
const cornerRound50 = new CornerRounding(0.5);
const cornerRound100 = new CornerRounding(1);

/**
 * Mirrors androidx.compose.ui.graphics.Matrix.rotateZ, which computes the angle in Float64 and
 * then applies the resulting Float32 matrix to each point.
 */
function matrixRotate(degrees: number): (x: number, y: number) => Point {
  const radians = degrees * 0.017453292519943295;
  const sin = f32(Math.sin(radians));
  const cos = f32(Math.cos(radians));
  return (x, y) => ({
    x: f32(f32(x * cos) + f32(y * -sin)),
    y: f32(f32(x * sin) + f32(y * cos)),
  });
}

const rotateNeg45 = matrixRotate(-45);
const rotateNeg90 = matrixRotate(-90);
const rotateNeg135 = matrixRotate(-135);
const scale = (scaleX: number, scaleY: number) => {
  const sx = f32(scaleX);
  const sy = f32(scaleY);
  return (x: number, y: number): Point => ({
    x: f32(x * sx),
    y: f32(y * sy),
  });
};

function pnr(o: Point, r: CornerRounding = CornerRounding.Unrounded): PointNRound {
  // Kotlin shape definitions use Float literals; round the JS number literals at the boundary.
  return { o: { x: f32(o.x), y: f32(o.y) }, r };
}

/**
 * Kotlin's shape code computes in Float32. Rounding the intermediate values keeps the port's
 * floating-point behavior (including near-collinear corner classification) aligned with Compose.
 */
function toRadians(degrees: number): number {
  return f32(f32(f32(degrees / 360) * 2) * FLOAT_PI);
}

function doRepeat(
  points: readonly PointNRound[],
  reps: number,
  center: Point,
  mirroring: boolean,
): PointNRound[] {
  if (mirroring) {
    const result: PointNRound[] = [];
    const angles = points.map((p) => {
      const x = f32(p.o.x - center.x);
      const y = f32(p.o.y - center.y);
      return f32(f32(f32(Math.atan2(y, x)) * 180) / FLOAT_PI);
    });
    const distances = points.map((p) => {
      const x = f32(p.o.x - center.x);
      const y = f32(p.o.y - center.y);
      return f32(Math.sqrt(f32(f32(x * x) + f32(y * y))));
    });
    const actualReps = reps * 2;
    const sectionAngle = f32(360 / actualReps);
    for (let it = 0; it < actualReps; it++) {
      for (let index = 0; index < points.length; index++) {
        const i = it % 2 === 0 ? index : points.length - 1 - index;
        if (i > 0 || it % 2 === 0) {
          const rawAngle = f32(
            f32(sectionAngle * it) +
              (it % 2 === 0
                ? angles[i]!
                : f32(f32(sectionAngle - angles[i]!) + f32(2 * angles[0]!))),
          );
          const a = toRadians(rawAngle);
          const finalPoint = {
            x: f32(f32(f32(Math.cos(a)) * distances[i]!) + center.x),
            y: f32(f32(f32(Math.sin(a)) * distances[i]!) + center.y),
          };
          result.push(pnr(finalPoint, points[i]!.r));
        }
      }
    }
    return result;
  }

  const result: PointNRound[] = [];
  const np = points.length;
  for (let it = 0; it < np * reps; it++) {
    const point = rotateDegrees(points[it % np]!.o, (Math.floor(it / np) * 360) / reps, center);
    result.push(pnr(point, points[it % np]!.r));
  }
  return result;
}

function customPolygon(
  points: readonly PointNRound[],
  reps: number,
  center: Point = { x: 0.5, y: 0.5 },
  mirroring = false,
): RoundedPolygon {
  const actualPoints = doRepeat(points, reps, center, mirroring);
  const vertices: number[] = [];
  const perVertexRounding: CornerRounding[] = [];
  for (const point of actualPoints) {
    vertices.push(point.o.x, point.o.y);
    perVertexRounding.push(point.r);
  }
  return RoundedPolygon.fromVertices(vertices, {
    perVertexRounding,
    centerX: center.x,
    centerY: center.y,
  });
}

function circleShape(): RoundedPolygon {
  return RoundedPolygon.circle(10);
}

function squareShape(): RoundedPolygon {
  return RoundedPolygon.rectangle(1, 1, cornerRound30);
}

function slantedShape(): RoundedPolygon {
  return customPolygon(
    [
      pnr({ x: 0.926, y: 0.97 }, new CornerRounding(0.189, 0.811)),
      pnr({ x: -0.021, y: 0.967 }, new CornerRounding(0.187, 0.057)),
    ],
    2,
  );
}

function archShape(): RoundedPolygon {
  return RoundedPolygon.fromNumVertices(4, 1, 0, 0, CornerRounding.Unrounded, [
    cornerRound100,
    cornerRound100,
    cornerRound20,
    cornerRound20,
  ]).transformed(rotateNeg135);
}

function fanShape(): RoundedPolygon {
  return customPolygon(
    [
      pnr({ x: 1.004, y: 1.0 }, new CornerRounding(0.148, 0.417)),
      pnr({ x: 0.0, y: 1.0 }, new CornerRounding(0.151)),
      pnr({ x: 0.0, y: -0.003 }, new CornerRounding(0.148)),
      pnr({ x: 0.978, y: 0.02 }, new CornerRounding(0.803)),
    ],
    1,
  );
}

function arrowShape(): RoundedPolygon {
  return customPolygon(
    [
      pnr({ x: 0.5, y: 0.892 }, new CornerRounding(0.313)),
      pnr({ x: -0.216, y: 1.05 }, new CornerRounding(0.207)),
      pnr({ x: 0.499, y: -0.16 }, new CornerRounding(0.215, 1.0)),
      pnr({ x: 1.225, y: 1.06 }, new CornerRounding(0.211)),
    ],
    1,
  );
}

function semiCircleShape(): RoundedPolygon {
  return RoundedPolygon.rectangle(1.6, 1, CornerRounding.Unrounded, [
    cornerRound20,
    cornerRound20,
    cornerRound100,
    cornerRound100,
  ]);
}

function ovalShape(): RoundedPolygon {
  return RoundedPolygon.circle().transformed(scale(1, 0.64)).transformed(rotateNeg45);
}

function pillShape(): RoundedPolygon {
  return customPolygon(
    [
      pnr({ x: 0.961, y: 0.039 }, new CornerRounding(0.426)),
      pnr({ x: 1.001, y: 0.428 }),
      pnr({ x: 1.0, y: 0.609 }, new CornerRounding(1.0)),
    ],
    2,
    { x: 0.5, y: 0.5 },
    true,
  );
}

function triangleShape(): RoundedPolygon {
  return RoundedPolygon.fromNumVertices(3, 1, 0, 0, cornerRound20).transformed(rotateNeg90);
}

function diamondShape(): RoundedPolygon {
  return customPolygon(
    [
      pnr({ x: 0.5, y: 1.096 }, new CornerRounding(0.151, 0.524)),
      pnr({ x: 0.04, y: 0.5 }, new CornerRounding(0.159)),
    ],
    2,
  );
}

function clamShellShape(): RoundedPolygon {
  return customPolygon(
    [
      pnr({ x: 0.171, y: 0.841 }, new CornerRounding(0.159)),
      pnr({ x: -0.02, y: 0.5 }, new CornerRounding(0.14)),
      pnr({ x: 0.17, y: 0.159 }, new CornerRounding(0.159)),
    ],
    2,
  );
}

function pentagonShape(): RoundedPolygon {
  return customPolygon(
    [
      pnr({ x: 0.5, y: -0.009 }, new CornerRounding(0.172)),
      pnr({ x: 1.03, y: 0.365 }, new CornerRounding(0.164)),
      pnr({ x: 0.828, y: 0.97 }, new CornerRounding(0.169)),
    ],
    1,
    { x: 0.5, y: 0.5 },
    true,
  );
}

function gemShape(): RoundedPolygon {
  return customPolygon(
    [
      pnr({ x: 0.499, y: 1.023 }, new CornerRounding(0.241, 0.778)),
      pnr({ x: -0.005, y: 0.792 }, new CornerRounding(0.208)),
      pnr({ x: 0.073, y: 0.258 }, new CornerRounding(0.228)),
      pnr({ x: 0.433, y: 0.0 }, new CornerRounding(0.491)),
    ],
    1,
    { x: 0.5, y: 0.5 },
    true,
  );
}

function sunnyShape(): RoundedPolygon {
  return RoundedPolygon.star(8, 1, 0.8, cornerRound15);
}

function verySunnyShape(): RoundedPolygon {
  return customPolygon(
    [
      pnr({ x: 0.5, y: 1.08 }, new CornerRounding(0.085)),
      pnr({ x: 0.358, y: 0.843 }, new CornerRounding(0.085)),
    ],
    8,
  );
}

function cookie4Shape(): RoundedPolygon {
  return customPolygon(
    [
      pnr({ x: 1.237, y: 1.236 }, new CornerRounding(0.258)),
      pnr({ x: 0.5, y: 0.918 }, new CornerRounding(0.233)),
    ],
    4,
  );
}

function cookie6Shape(): RoundedPolygon {
  return customPolygon(
    [
      pnr({ x: 0.723, y: 0.884 }, new CornerRounding(0.394)),
      pnr({ x: 0.5, y: 1.099 }, new CornerRounding(0.398)),
    ],
    6,
  );
}

function cookie7Shape(): RoundedPolygon {
  return RoundedPolygon.star(7, 1, 0.75, cornerRound50).transformed(rotateNeg90);
}

function cookie9Shape(): RoundedPolygon {
  return RoundedPolygon.star(9, 1, 0.8, cornerRound50).transformed(rotateNeg90);
}

function cookie12Shape(): RoundedPolygon {
  return RoundedPolygon.star(12, 1, 0.8, cornerRound50).transformed(rotateNeg90);
}

function ghostishShape(): RoundedPolygon {
  return customPolygon(
    [
      pnr({ x: 0.5, y: 0 }, new CornerRounding(1.0)),
      pnr({ x: 1, y: 0 }, new CornerRounding(1.0)),
      pnr({ x: 1, y: 1.14 }, new CornerRounding(0.254, 0.106)),
      pnr({ x: 0.575, y: 0.906 }, new CornerRounding(0.253)),
    ],
    1,
    { x: 0.5, y: 0.5 },
    true,
  );
}

function clover4Shape(): RoundedPolygon {
  return customPolygon(
    [pnr({ x: 0.5, y: 0.074 }), pnr({ x: 0.725, y: -0.099 }, new CornerRounding(0.476))],
    4,
    { x: 0.5, y: 0.5 },
    true,
  );
}

function clover8Shape(): RoundedPolygon {
  return customPolygon(
    [pnr({ x: 0.5, y: 0.036 }), pnr({ x: 0.758, y: -0.101 }, new CornerRounding(0.209))],
    8,
  );
}

function burstShape(): RoundedPolygon {
  return customPolygon(
    [
      pnr({ x: 0.5, y: -0.006 }, new CornerRounding(0.006)),
      pnr({ x: 0.592, y: 0.158 }, new CornerRounding(0.006)),
    ],
    12,
  );
}

function softBurstShape(): RoundedPolygon {
  return customPolygon(
    [
      pnr({ x: 0.193, y: 0.277 }, new CornerRounding(0.053)),
      pnr({ x: 0.176, y: 0.055 }, new CornerRounding(0.053)),
    ],
    10,
  );
}

function boomShape(): RoundedPolygon {
  return customPolygon(
    [
      pnr({ x: 0.457, y: 0.296 }, new CornerRounding(0.007)),
      pnr({ x: 0.5, y: -0.051 }, new CornerRounding(0.007)),
    ],
    15,
  );
}

function softBoomShape(): RoundedPolygon {
  return customPolygon(
    [
      pnr({ x: 0.733, y: 0.454 }),
      pnr({ x: 0.839, y: 0.437 }, new CornerRounding(0.532)),
      pnr({ x: 0.949, y: 0.449 }, new CornerRounding(0.439, 1.0)),
      pnr({ x: 0.998, y: 0.478 }, new CornerRounding(0.174)),
    ],
    16,
    { x: 0.5, y: 0.5 },
    true,
  );
}

function flowerShape(): RoundedPolygon {
  return customPolygon(
    [
      pnr({ x: 0.37, y: 0.187 }),
      pnr({ x: 0.416, y: 0.049 }, new CornerRounding(0.381)),
      pnr({ x: 0.479, y: 0.001 }, new CornerRounding(0.095)),
    ],
    8,
    { x: 0.5, y: 0.5 },
    true,
  );
}

function puffyShape(): RoundedPolygon {
  return customPolygon(
    [
      pnr({ x: 0.5, y: 0.053 }),
      pnr({ x: 0.545, y: -0.04 }, new CornerRounding(0.405)),
      pnr({ x: 0.67, y: -0.035 }, new CornerRounding(0.426)),
      pnr({ x: 0.717, y: 0.066 }, new CornerRounding(0.574)),
      pnr({ x: 0.722, y: 0.128 }),
      pnr({ x: 0.777, y: 0.002 }, new CornerRounding(0.36)),
      pnr({ x: 0.914, y: 0.149 }, new CornerRounding(0.66)),
      pnr({ x: 0.926, y: 0.289 }, new CornerRounding(0.66)),
      pnr({ x: 0.881, y: 0.346 }),
      pnr({ x: 0.94, y: 0.344 }, new CornerRounding(0.126)),
      pnr({ x: 1.003, y: 0.437 }, new CornerRounding(0.255)),
    ],
    2,
    { x: 0.5, y: 0.5 },
    true,
  ).transformed(scale(1, 0.742));
}

function puffyDiamondShape(): RoundedPolygon {
  return customPolygon(
    [
      pnr({ x: 0.87, y: 0.13 }, new CornerRounding(0.146)),
      pnr({ x: 0.818, y: 0.357 }),
      pnr({ x: 1.0, y: 0.332 }, new CornerRounding(0.853)),
    ],
    4,
    { x: 0.5, y: 0.5 },
    true,
  );
}

function pixelCircleShape(): RoundedPolygon {
  return customPolygon(
    [
      pnr({ x: 0.5, y: 0.0 }),
      pnr({ x: 0.704, y: 0.0 }),
      pnr({ x: 0.704, y: 0.065 }),
      pnr({ x: 0.843, y: 0.065 }),
      pnr({ x: 0.843, y: 0.148 }),
      pnr({ x: 0.926, y: 0.148 }),
      pnr({ x: 0.926, y: 0.296 }),
      pnr({ x: 1.0, y: 0.296 }),
    ],
    2,
    { x: 0.5, y: 0.5 },
    true,
  );
}

function pixelTriangleShape(): RoundedPolygon {
  return customPolygon(
    [
      pnr({ x: 0.11, y: 0.5 }),
      pnr({ x: 0.113, y: 0.0 }),
      pnr({ x: 0.287, y: 0.0 }),
      pnr({ x: 0.287, y: 0.087 }),
      pnr({ x: 0.421, y: 0.087 }),
      pnr({ x: 0.421, y: 0.17 }),
      pnr({ x: 0.56, y: 0.17 }),
      pnr({ x: 0.56, y: 0.265 }),
      pnr({ x: 0.674, y: 0.265 }),
      pnr({ x: 0.675, y: 0.344 }),
      pnr({ x: 0.789, y: 0.344 }),
      pnr({ x: 0.789, y: 0.439 }),
      pnr({ x: 0.888, y: 0.439 }),
    ],
    1,
    { x: 0.5, y: 0.5 },
    true,
  );
}

function bunShape(): RoundedPolygon {
  return customPolygon(
    [
      pnr({ x: 0.796, y: 0.5 }),
      pnr({ x: 0.853, y: 0.518 }, new CornerRounding(1)),
      pnr({ x: 0.992, y: 0.631 }, new CornerRounding(1)),
      pnr({ x: 0.968, y: 1.0 }, new CornerRounding(1)),
    ],
    2,
    { x: 0.5, y: 0.5 },
    true,
  );
}

function heartShape(): RoundedPolygon {
  return customPolygon(
    [
      pnr({ x: 0.5, y: 0.268 }, new CornerRounding(0.016)),
      pnr({ x: 0.792, y: -0.066 }, new CornerRounding(0.958)),
      pnr({ x: 1.064, y: 0.276 }, new CornerRounding(1.0)),
      pnr({ x: 0.501, y: 0.946 }, new CornerRounding(0.129)),
    ],
    1,
    { x: 0.5, y: 0.5 },
    true,
  );
}

export const MATERIAL_SHAPE_NAMES = [
  'Arch',
  'Arrow',
  'Boom',
  'Bun',
  'Burst',
  'Circle',
  'ClamShell',
  'Clover4Leaf',
  'Clover8Leaf',
  'Cookie12Sided',
  'Cookie4Sided',
  'Cookie6Sided',
  'Cookie7Sided',
  'Cookie9Sided',
  'Diamond',
  'Fan',
  'Flower',
  'Gem',
  'Ghostish',
  'Heart',
  'Oval',
  'Pentagon',
  'Pill',
  'PixelCircle',
  'PixelTriangle',
  'Puffy',
  'PuffyDiamond',
  'SemiCircle',
  'Slanted',
  'SoftBoom',
  'SoftBurst',
  'Square',
  'Sunny',
  'Triangle',
  'VerySunny',
] as const;

export type MaterialShapeName = (typeof MATERIAL_SHAPE_NAMES)[number];

const cache = new Map<MaterialShapeName, RoundedPolygon>();

function cached(name: MaterialShapeName, factory: () => RoundedPolygon): RoundedPolygon {
  const value = cache.get(name);
  if (value) {
    return value;
  }
  const created = factory();
  cache.set(name, created);
  return created;
}

const factories: Record<MaterialShapeName, () => RoundedPolygon> = {
  Arch: archShape,
  Arrow: arrowShape,
  Boom: boomShape,
  Bun: bunShape,
  Burst: burstShape,
  Circle: circleShape,
  ClamShell: clamShellShape,
  Clover4Leaf: clover4Shape,
  Clover8Leaf: clover8Shape,
  Cookie12Sided: cookie12Shape,
  Cookie4Sided: cookie4Shape,
  Cookie6Sided: cookie6Shape,
  Cookie7Sided: cookie7Shape,
  Cookie9Sided: cookie9Shape,
  Diamond: diamondShape,
  Fan: fanShape,
  Flower: flowerShape,
  Gem: gemShape,
  Ghostish: ghostishShape,
  Heart: heartShape,
  Oval: ovalShape,
  Pentagon: pentagonShape,
  Pill: pillShape,
  PixelCircle: pixelCircleShape,
  PixelTriangle: pixelTriangleShape,
  Puffy: puffyShape,
  PuffyDiamond: puffyDiamondShape,
  SemiCircle: semiCircleShape,
  Slanted: slantedShape,
  SoftBoom: softBoomShape,
  SoftBurst: softBurstShape,
  Square: squareShape,
  Sunny: sunnyShape,
  Triangle: triangleShape,
  VerySunny: verySunnyShape,
};

export function getMaterialShape(name: MaterialShapeName): RoundedPolygon {
  return cached(name, () => factories[name]().normalized());
}

export const MaterialShapes: {
  readonly [K in MaterialShapeName]: RoundedPolygon;
} = {
  get Arch() {
    return getMaterialShape('Arch');
  },
  get Arrow() {
    return getMaterialShape('Arrow');
  },
  get Boom() {
    return getMaterialShape('Boom');
  },
  get Bun() {
    return getMaterialShape('Bun');
  },
  get Burst() {
    return getMaterialShape('Burst');
  },
  get Circle() {
    return getMaterialShape('Circle');
  },
  get ClamShell() {
    return getMaterialShape('ClamShell');
  },
  get Clover4Leaf() {
    return getMaterialShape('Clover4Leaf');
  },
  get Clover8Leaf() {
    return getMaterialShape('Clover8Leaf');
  },
  get Cookie12Sided() {
    return getMaterialShape('Cookie12Sided');
  },
  get Cookie4Sided() {
    return getMaterialShape('Cookie4Sided');
  },
  get Cookie6Sided() {
    return getMaterialShape('Cookie6Sided');
  },
  get Cookie7Sided() {
    return getMaterialShape('Cookie7Sided');
  },
  get Cookie9Sided() {
    return getMaterialShape('Cookie9Sided');
  },
  get Diamond() {
    return getMaterialShape('Diamond');
  },
  get Fan() {
    return getMaterialShape('Fan');
  },
  get Flower() {
    return getMaterialShape('Flower');
  },
  get Gem() {
    return getMaterialShape('Gem');
  },
  get Ghostish() {
    return getMaterialShape('Ghostish');
  },
  get Heart() {
    return getMaterialShape('Heart');
  },
  get Oval() {
    return getMaterialShape('Oval');
  },
  get Pentagon() {
    return getMaterialShape('Pentagon');
  },
  get Pill() {
    return getMaterialShape('Pill');
  },
  get PixelCircle() {
    return getMaterialShape('PixelCircle');
  },
  get PixelTriangle() {
    return getMaterialShape('PixelTriangle');
  },
  get Puffy() {
    return getMaterialShape('Puffy');
  },
  get PuffyDiamond() {
    return getMaterialShape('PuffyDiamond');
  },
  get SemiCircle() {
    return getMaterialShape('SemiCircle');
  },
  get Slanted() {
    return getMaterialShape('Slanted');
  },
  get SoftBoom() {
    return getMaterialShape('SoftBoom');
  },
  get SoftBurst() {
    return getMaterialShape('SoftBurst');
  },
  get Square() {
    return getMaterialShape('Square');
  },
  get Sunny() {
    return getMaterialShape('Sunny');
  },
  get Triangle() {
    return getMaterialShape('Triangle');
  },
  get VerySunny() {
    return getMaterialShape('VerySunny');
  },
};
