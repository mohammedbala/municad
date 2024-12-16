import { BaseTool } from './BaseTool';
import { Point } from '../types';
import { EVENTS } from './EventManager';

export class PolygonTool extends BaseTool {
  private points: Point[] = [];
  private previewPoint: Point | null = null;

  activate() {
    const canvas = this.canvasManager.getCanvas();
    canvas.addEventListener('click', this.handleClick);
    canvas.addEventListener('mousemove', this.handleMouseMove);
    canvas.addEventListener('dblclick', this.handleDoubleClick);
  }

  deactivate() {
    const canvas = this.canvasManager.getCanvas();
    canvas.removeEventListener('click', this.handleClick);
    canvas.removeEventListener('mousemove', this.handleMouseMove);
    canvas.removeEventListener('dblclick', this.handleDoubleClick);
    this.points = [];
    this.previewPoint = null;
  }

  private handleClick = (e: MouseEvent) => {
    const point = this.getMapPoint(e);
    if (point) {
      this.points.push(point);
      this.drawPreview();
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    const point = this.getMapPoint(e);
    if (point) {
      this.previewPoint = point;
      this.drawPreview();
    }
  };

  private handleDoubleClick = (e: MouseEvent) => {
    e.preventDefault();
    if (this.points.length >= 3) {
      this.points.push(this.points[0]); // Close the polygon
      this.emit(EVENTS.SHAPE_COMPLETE, {
        type: 'polygon',
        points: this.points
      });
      this.points = [];
      this.previewPoint = null;
    }
  };

  private drawPreview() {
    this.canvasManager.clear();
    if (this.points.length > 0) {
      const previewPoints = [...this.points];
      if (this.previewPoint) {
        previewPoints.push(this.previewPoint);
      }
      if (previewPoints.length >= 3) {
        this.canvasManager.drawPolygon(previewPoints, this.style.lineColor!, this.style.fillColor!);
      } else {
        this.canvasManager.drawLine(previewPoints, this.style.lineColor!, this.style.lineThickness);
      }
    }
  }

  redraw() {
    this.drawPreview();
  }
}