export interface Point {
  lng: number;
  lat: number;
  x: number;
  y: number;
}

export interface DrawnLine {
  id: string;
  points: Point[];
  color: string;
  type: 'line' | 'rectangle' | 'polygon' | 'dimension' | 'arrow' | 'text' | 'sign';
  fillColor?: string;
  fontColor?: string;
  measurement?: string;
  thickness?: number;
  text?: string;
  size?: number;
  signData?: {
    url: string;
    name: string;
    size?: number;
  };
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