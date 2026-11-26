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

/**
 * `core` scenes are the five-scene pixel gate. `text` scenes are the 30
 * typography roles, tracked separately under the U-25 resolution; they are not
 * part of the five-scene gate.
 */
export type SceneCategory = 'core' | 'text';

export interface Scene {
  schema: 1;
  id: string;
  category: SceneCategory;
  description: string;
  widthDp: number;
  heightDp: number;
  background: string;
  layers: Array<RectLayer | TextLayer>;
}
