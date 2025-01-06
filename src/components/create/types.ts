export interface Point {
  lng: number;
  lat: number;
  x: number;
  y: number;
}

export interface DrawnLine {
  id: string;
  type: 'line' | 'arrow' | 'rectangle' | 'polygon' | 'dimension' | 'text' | 'sign';
  points: Point[];
  color: string;
  fillColor?: string | null;
  thickness?: number;
  size?: number;
  fontColor?: string;
  text?: string;
  signData?: SignData;
  measurement?: string;
  hatchPattern?: string;
}

export interface TextLabel {
  id: string;
  text: string;
  size: number;
  color: string;
  fontColor?: string;
  coordinates: [number, number];
}

export interface TitleBlockData {
  projectTitle: string;
  projectSubtitle: string;
  designer: string;
  checker: string;
  scale: string;
  date: string;
  drawingNumber: string;
}