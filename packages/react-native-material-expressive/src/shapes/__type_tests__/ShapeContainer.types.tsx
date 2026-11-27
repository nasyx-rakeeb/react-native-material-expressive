/**
 * Compile-time contract tests for `ShapeContainer` (ADR-017).
 *
 * This file is not a Jest test: `testMatch` only picks up `*.test.ts?(x)`.
 * `tsc` compiles it, so the `@ts-expect-error` below fails the typecheck if the
 * required decorative opt-in is ever removed.
 */

import { View } from 'react-native';

import { ShapeContainer } from '../components';

export const decorativeContainerCompiles = (
  <ShapeContainer decorative shape="Clover4Leaf">
    <View />
  </ShapeContainer>
);

export const missingDecorativeIsRejected = (
  // @ts-expect-error `decorative` is required: ShapeContainer is visual-only (U-32).
  <ShapeContainer shape="Clover4Leaf">
    <View />
  </ShapeContainer>
);
