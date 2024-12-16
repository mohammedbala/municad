import { Point, DrawnLine } from '../types';

export interface CanvasStyle {
  lineColor?: string;
  fillColor?: string;
  fontColor?: string;
  lineType?: string;
  lineThickness?: number;
}

export interface CanvasOptions {
  padding?: number;
  handleSize?: number;
  selectionColor?: string;
  selectionWidth?: number;
}

export interface RenderOptions {
  clear?: boolean;
  selected?: boolean;
  preview?: boolean;
}

export type {
  Point,
  DrawnLine
};