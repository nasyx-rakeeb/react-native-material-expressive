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
}

export interface Scene {
  schema: 1;
  id: string;
  description: string;
  widthDp: number;
  heightDp: number;
  background: string;
  layers: Array<RectLayer | TextLayer>;
}
