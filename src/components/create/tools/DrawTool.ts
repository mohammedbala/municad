import { BaseTool } from './BaseTool';
import { Point } from '../types';
import { EVENTS } from './EventManager';

export class DrawTool extends BaseTool {
  private points: Point[] = [];
  private isDrawing = false;
  private lastPoint: Point | null = null;
  private smoothingFactor = 5; // Number of points to average for smoothing

  activate() {
    const canvas = this.canvasManager.getCanvas();
    canvas.addEventListener('mousedown', this.handleMouseDown);
    canvas.addEventListener('mousemove', this.handleMouseMove);
    canvas.addEventListener('mouseup', this.handleMouseUp);
    canvas.addEventListener('mouseleave', this.handleMouseUp);
  }

  deactivate() {
    const canvas = this.canvasManager.getCanvas();
    canvas.removeEventListener('mousedown', this.handleMouseDown);
    canvas.removeEventListener('mousemove', this.handleMouseMove);
    canvas.removeEventListener('mouseup', this.handleMouseUp);
    canvas.removeEventListener('mouseleave', this.handleMouseUp);
    this.points = [];
    this.isDrawing = false;
    this.lastPoint = null;
  }

  private handleMouseDown = (e: MouseEvent) => {
    const point = this.getMapPoint(e);
    if (point) {
      this.isDrawing = true;
      this.points = [point];
      this.lastPoint = point;
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.isDrawing || !this.lastPoint) return;

    const point = this.getMapPoint(e);
    if (point) {
      // Only add points if they're far enough apart
      const distance = Math.hypot(point.x - this.lastPoint.x, point.y - this.lastPoint.y);
      if (distance > 2) {
        this.points.push(point);
        this.lastPoint = point;
        this.drawPreview();
      }
    }
  };

  private handleMouseUp = () => {
    if (!this.isDrawing) return;

    if (this.points.length > 1) {
      const smoothedPoints = this.smoothPoints(this.points);
      this.emit(EVENTS.SHAPE_COMPLETE, {
        type: 'line',
        points: smoothedPoints
      });
    }

    this.points = [];
    this.isDrawing = false;
    this.lastPoint = null;
  };

  private smoothPoints(points: Point[]): Point[] {
    if (points.length <= 2) return points;

    const smoothed: Point[] = [];
    smoothed.push(points[0]); // Keep the first point

    for (let i = 1; i < points.length - 1; i++) {
      const start = Math.max(0, i - this.smoothingFactor);
      const end = Math.min(points.length, i + this.smoothingFactor + 1);
      const windowPoints = points.slice(start, end);

      const avgLng = windowPoints.reduce((sum, p) => sum + p.lng, 0) / windowPoints.length;
      const avgLat = windowPoints.reduce((sum, p) => sum + p.lat, 0) / windowPoints.length;
      const avgX = windowPoints.reduce((sum, p) => sum + p.x, 0) / windowPoints.length;
      const avgY = windowPoints.reduce((sum, p) => sum + p.y, 0) / windowPoints.length;

      smoothed.push({
        lng: avgLng,
        lat: avgLat,
        x: avgX,
        y: avgY
      });
    }

    smoothed.push(points[points.length - 1]); // Keep the last point
    return smoothed;
  }

  private drawPreview() {
    if (this.points.length < 2) return;

    this.canvasManager.clear();
    this.canvasManager.drawLine(this.points, this.style.lineColor!, this.style.lineThickness);
  }

  redraw() {
    this.drawPreview();
  }
}