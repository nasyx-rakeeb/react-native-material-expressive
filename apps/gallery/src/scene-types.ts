export interface RectLayer {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  color: string;
  elevationDp: number;
}

export interface TextLayer {
  type: 'text';
  x: number;
  y: number;
  text: string;
  sizeSp: number;
  weight: number;
  color: string;
  letterSpacingSp: number;
  lineHeightSp?: number;
  widthDp?: number;
}

export type InteractionStateName =
  'default' | 'hover' | 'focus' | 'pressed' | 'dragged' | 'disabled';

export interface FocusRingLayerSpec {
  outerColor: string;
  innerColor: string;
}

export interface RippleLayerSpec {
  /** 0–1 of the 225 ms radius/centre animation. */
  progress: number;
  /** Press position relative to the layer, in dp. */
  originX: number;
  originY: number;
  bounded: boolean;
}

/**
 * A static interaction sample: container + optional state layer, ripple and
 * inset focus ring. Both the RN gallery and the Compose reference render this
 * layer with their own primitives so the diff checks the real rendering.
 */
export interface InteractionLayer {
  type: 'interaction';
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  containerColor: string;
  contentColor: string;
  state: InteractionStateName;
  elevationDp: number;
  surfaceTint: string;
  focusRing: FocusRingLayerSpec | null;
  ripple: RippleLayerSpec | null;
}

/**
 * `core` scenes are the five-scene pixel gate. `text` scenes are the 30
 * typography roles, tracked separately under the U-25 resolution; they are not
 * part of the five-scene gate. `interaction` scenes cover the Day 9 state
 * layers, ripple, focus ring and elevation matrix.
 */
export type SceneCategory = 'core' | 'text' | 'interaction';

export interface Scene {
  schema: 1;
  id: string;
  category: SceneCategory;
  description: string;
  widthDp: number;
  heightDp: number;
  background: string;
  layers: Array<RectLayer | TextLayer | InteractionLayer>;
}
