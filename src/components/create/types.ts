export interface TextLabel {
  id: string;
  text: string;
  size: number;
  color: string;
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