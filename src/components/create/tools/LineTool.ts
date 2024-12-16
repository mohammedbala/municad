import { BaseTool } from './BaseTool';
import { Point } from '../types';
import { EVENTS } from './EventManager';

export class LineTool extends BaseTool {
  private points: Point[] = [];
  private isDrawing = false;

  activate() {
    const canvas = this.canvasManager.getCanvas();
    canvas.addEventListener('mousedown', this.handleMouseDown);
    canvas.addEventListener('mousemove', this.handleMouseMove);
    canvas.addEventListener('mouseup', this.handleMouseUp);
  }

  deactivate() {
    const canvas = this.canvasManager.getCanvas();
    canvas.removeEventListener('mousedown', this.handleMouseDown);
    canvas.removeEventListener('mousemove', this.handleMouseMove);
    canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.points = [];
    this.isDrawing = false;
  }

  private handleMouseDown = (e: MouseEvent) => {
    const point = this.getMapPoint(e);
    if (point) {
      this.points = [point];
      this.isDrawing = true;
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.isDrawing) return;
    
    const point = this.getMapPoint(e);
    if (point) {
      this.canvasManager.clear();
      this.canvasManager.drawLine([...this.points, point], this.style.lineColor!, this.style.lineThickness);
    }
  };

  private handleMouseUp = (e: MouseEvent) => {
    if (!this.isDrawing) return;
    
    const point = this.getMapPoint(e);
    if (point) {
      this.points.push(point);
      this.isDrawing = false;
      this.emit(EVENTS.SHAPE_COMPLETE, {
        type: 'line',
        points: this.points
      });
    }
  };

  redraw() {
    if (this.points.length > 1) {
      this.canvasManager.drawLine(this.points, this.style.lineColor!, this.style.lineThickness);
    }
  }
}