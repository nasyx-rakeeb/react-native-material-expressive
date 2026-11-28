export {
  createM3Typography,
  defaultTypography,
  M3_BASELINE_ROLES,
  M3_EMPHASIZED_ROLES,
  robotoFlexTypography,
  ROBOTO_FLEX_FAMILY,
  ROBOTO_FLEX_NATURAL_LINE_HEIGHT_RATIO,
  type M3BaselineRole,
  type M3EmphasizedRole,
} from './createTypography';
export {
  getVariableFontSupport,
  resolveVariableFontSupport,
  supportsVariableFontSettings,
} from './support';
export {
  ContentColorProvider,
  contentColorFor,
  useContentColor,
  type ContentColorProviderProps,
} from './ContentColor';
export {
  COMPOSE_LINE_HEIGHT_MULTIPLIER_MIN_SCALE,
  COMPOSE_NON_LINEAR_MIN_SCALE,
  composeFontScale,
  composeFontScaleRatio,
  composeLineHeight,
  isNonLinearFontScalingActive,
} from './fontScale';
export { Text, type TextAlign, type TextFontScaleMode, type TextProps } from './Text';
export type {
  M3FontWeight,
  M3FontWeightValue,
  M3TextStyle,
  M3TypeScaleRole,
  M3Typography,
  M3TypographyOptions,
  VariableFontReason,
  VariableFontSupport,
} from './types';
export { useM3TextStyle } from './useM3TextStyle';
