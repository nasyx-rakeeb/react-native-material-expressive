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
 * (androidx/graphics/shapes/Point.kt, Utils.kt).
 */

export interface Point {
  readonly x: number;
  readonly y: number;
}

export type PointTransformer = (x: number, y: number) => Point;

/**
 * AndroidX graphics-shapes stores coordinates and performs geometry in Float32. Rounding each
 * intermediate value keeps this port aligned with Compose, including near-tie feature matching.
 */
export const f32 = Math.fround;

export const DISTANCE_EPSILON = f32(1e-4);
export const ANGLE_EPSILON = f32(1e-6);
export const RELAXED_DISTANCE_EPSILON = f32(5e-3);
export const FLOAT_PI = f32(Math.PI);
export const TWO_PI = f32(2 * FLOAT_PI);

export const ZERO: Point = { x: 0, y: 0 };

export function point(x: number, y: number): Point {
  return { x: f32(x), y: f32(y) };
}

export function distance(x: number, y: number): number {
  return f32(Math.sqrt(f32(f32(x * x) + f32(y * y))));
}

export function distanceSquared(x: number, y: number): number {
  return f32(f32(x * x) + f32(y * y));
}

export function getDistance(p: Point): number {
  return distance(p.x, p.y);
}

export function getDistanceSquared(p: Point): number {
  return distanceSquared(p.x, p.y);
}

export function dotProduct(a: Point, b: Point): number {
  return f32(f32(a.x * b.x) + f32(a.y * b.y));
}

export function dotProductXY(p: Point, otherX: number, otherY: number): number {
  return f32(f32(p.x * otherX) + f32(p.y * otherY));
}

export function clockwise(p: Point, other: Point): boolean {
  return f32(f32(p.x * other.y) - f32(p.y * other.x)) > 0;
}

export function directionVector(x: number, y: number): Point {
  const d = distance(x, y);
  if (!(d > 0)) {
    throw new Error('Required distance greater than zero');
  }
  return { x: f32(x / d), y: f32(y / d) };
}

export function directionVectorFromAngle(angleRadians: number): Point {
  return { x: f32(Math.cos(angleRadians)), y: f32(Math.sin(angleRadians)) };
}

export function radialToCartesian(
  radius: number,
  angleRadians: number,
  center: Point = ZERO,
): Point {
  const direction = directionVectorFromAngle(angleRadians);
  return {
    x: f32(f32(direction.x * radius) + center.x),
    y: f32(f32(direction.y * radius) + center.y),
  };
}

export function rotate90(p: Point): Point {
  return { x: -p.y, y: p.x };
}

export function add(a: Point, b: Point): Point {
  return { x: f32(a.x + b.x), y: f32(a.y + b.y) };
}

export function subtract(a: Point, b: Point): Point {
  return { x: f32(a.x - b.x), y: f32(a.y - b.y) };
}

export function multiply(p: Point, operand: number): Point {
  return { x: f32(p.x * operand), y: f32(p.y * operand) };
}

export function divide(p: Point, operand: number): Point {
  return { x: f32(p.x / operand), y: f32(p.y / operand) };
}

export function unaryMinus(p: Point): Point {
  return { x: -p.x, y: -p.y };
}

export function interpolate(start: number, stop: number, fraction: number): number {
  return f32(f32(f32(1 - fraction) * start) + f32(fraction * stop));
}

export function interpolatePoint(start: Point, stop: Point, fraction: number): Point {
  return {
    x: interpolate(start.x, stop.x, fraction),
    y: interpolate(start.y, stop.y, fraction),
  };
}

export function positiveModulo(num: number, mod: number): number {
  return f32(f32(f32(num % mod) + mod) % mod);
}

export function square(x: number): number {
  return f32(x * x);
}

export function collinearIsh(
  aX: number,
  aY: number,
  bX: number,
  bY: number,
  cX: number,
  cY: number,
  tolerance: number = DISTANCE_EPSILON,
): boolean {
  const ab = rotate90({ x: f32(bX - aX), y: f32(bY - aY) });
  const ac = { x: f32(cX - aX), y: f32(cY - aY) };
  const dot = Math.abs(dotProduct(ab, ac));
  const relativeTolerance = f32(f32(tolerance * getDistance(ab)) * getDistance(ac));
  return dot < tolerance || dot < relativeTolerance;
}

export function convex(previous: Point, current: Point, next: Point): boolean {
  return clockwise(subtract(current, previous), subtract(next, current));
}

export function transformPoint(p: Point, f: PointTransformer): Point {
  const transformed = f(p.x, p.y);
  return { x: f32(transformed.x), y: f32(transformed.y) };
}

export function rotateDegrees(p: Point, angle: number, center: Point = ZERO): Point {
  const radians = f32(f32(f32(angle / 360) * 2) * FLOAT_PI);
  const offX = f32(p.x - center.x);
  const offY = f32(p.y - center.y);
  return {
    x: f32(
      f32(f32(f32(offX * f32(Math.cos(radians))) - f32(offY * f32(Math.sin(radians)))) + center.x),
    ),
    y: f32(
      f32(f32(f32(offX * f32(Math.sin(radians))) + f32(offY * f32(Math.cos(radians)))) + center.y),
    ),
  };
}

export function angleDegrees(p: Point): number {
  return f32(f32(f32(Math.atan2(p.y, p.x)) * 180) / FLOAT_PI);
}
