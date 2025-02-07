export interface Point {
  lng: number;
  lat: number;
  x: number;
  y: number;
}

export interface DrawnLine {
  id: string;
  type: 'line' | 'arrow' | 'rectangle' | 'polygon' | 'text' | 'dimension' | 'sign' | 'draw';
  points: Point[];
  color: string;
  fillColor?: string | null;
  thickness: number;
  size?: number;
  fontColor?: string;
  hatchPattern?: string;
  text?: string;
  signData?: SignData;
  measurement?: string;
  alignment?: 'left' | 'center' | 'right';
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