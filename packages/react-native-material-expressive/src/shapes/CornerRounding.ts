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
 * (androidx/graphics/shapes/CornerRounding.kt).
 */

export class CornerRounding {
  readonly radius: number;
  readonly smoothing: number;

  constructor(radius = 0, smoothing = 0) {
    // Kotlin's CornerRounding stores Float values.
    this.radius = Math.fround(radius);
    this.smoothing = Math.fround(smoothing);
  }

  static readonly Unrounded = new CornerRounding();
}
