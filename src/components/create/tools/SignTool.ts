import { BaseTool } from './BaseTool';
import { Point } from '../types';
import { EVENTS } from './EventManager';

const DEFAULT_SIGN_SIZE = 64;

interface SignShape {
  type: 'sign';
  points: Point[];
  color: string;
  signData: {
    url: string;
    name: string;
    size: number;
    rotation?: number;
  };
  id: string;
}

export class SignTool extends BaseTool {
  private signData: { url: string; name: string; size: number } | null = null;

  activate() {
    const canvas = this.canvasManager.getCanvas();
    canvas.style.cursor = 'crosshair';
  }

  deactivate() {
    const canvas = this.canvasManager.getCanvas();
    canvas.style.cursor = 'default';
    this.signData = null;
  }

  public setSignData(data: { url: string; name: string; size?: number }) {
    this.signData = {
      url: data.url,
      name: data.name,
      size: data.size || DEFAULT_SIGN_SIZE
    };
    console.log('SignTool: Sign data set', this.signData);
  }

  handleClick = (point: Point) => {
    if (!this.signData) {
      console.warn('SignTool: No sign data available');
      return;
    }

    const shape = {
      type: 'sign',
      points: [point],
      color: '#1E3A8A',
      additionalData: {
        signData: {
          url: this.signData.url,
          name: this.signData.name,
          size: this.signData.size
        }
      },
      id: crypto.randomUUID()
    };

    console.log('SignTool: Created shape:', shape);
    this.emit(EVENTS.SHAPE_COMPLETE, shape);
  };

  handleDrop = (point: Point, data: { url: string; name: string; size?: number }) => {
    console.log('SignTool: Handling drop with data:', data);
    this.setSignData(data);
    this.handleClick(point);
  };

  redraw() {
    // No preview needed for signs
  }
}