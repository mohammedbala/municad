import { BaseTool } from './BaseTool';
import { Point } from '../types';
import { EVENTS } from './EventManager';
import { calculateDistance, formatMeasurement } from '../utils/measurementUtils';

export class DimensionTool extends BaseTool {
  private startPoint: Point | null = null;
  private endPoint: Point | null = null;
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
    this.startPoint = null;
    this.endPoint = null;
    this.isDrawing = false;
  }

  private handleMouseDown = (e: MouseEvent) => {
    const point = this.getMapPoint(e);
    if (point) {
      this.startPoint = point;
      this.isDrawing = true;
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.isDrawing || !this.startPoint) return;

    const point = this.getMapPoint(e);
    if (point) {
      this.endPoint = point;
      this.drawPreview();
    }
  };

  private handleMouseUp = (e: MouseEvent) => {
    if (!this.isDrawing || !this.startPoint) return;

    const point = this.getMapPoint(e);
    if (point) {
      this.endPoint = point;
      const points = [this.startPoint, this.endPoint];
      const measurement = this.calculateDistance();
      this.emit(EVENTS.SHAPE_COMPLETE, {
        type: 'dimension',
        points,
        measurement
      });
      this.startPoint = null;
      this.endPoint = null;
      this.isDrawing = false;
    }
  };

  private calculateDistance(): string {
    if (!this.startPoint || !this.endPoint) return '';
    const distance = calculateDistance(
      this.startPoint.lat,
      this.startPoint.lng,
      this.endPoint.lat,
      this.endPoint.lng
    );
    return formatMeasurement(distance);
  }

  private drawPreview() {
    if (!this.startPoint || !this.endPoint) return;

    this.canvasManager.clear();
    
    // Draw the main line
    this.canvasManager.drawLine(
      [this.startPoint, this.endPoint],
      this.style.lineColor!,
      this.style.lineThickness
    );

    // Draw arrows at both ends
    this.drawArrow(this.startPoint, this.endPoint);
    this.drawArrow(this.endPoint, this.startPoint);

    // Draw measurement text
    const measurement = this.calculateDistance();
    const ctx = this.canvasManager.getCanvas().getContext('2d');
    if (ctx) {
      const midPoint = {
        x: (this.startPoint.x + this.endPoint.x) / 2,
        y: (this.startPoint.y + this.endPoint.y) / 2
      };

      ctx.font = '14px Arial';
      ctx.fillStyle = 'white';
      const metrics = ctx.measureText(measurement);
      ctx.fillRect(
        midPoint.x - metrics.width / 2 - 4,
        midPoint.y - 10,
        metrics.width + 8,
        20
      );

      ctx.fillStyle = this.style.lineColor!;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(measurement, midPoint.x, midPoint.y);
    }
  }

  private drawArrow(from: Point, to: Point) {
    const ctx = this.canvasManager.getCanvas().getContext('2d');
    if (!ctx) return;

    const headLength = 15;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(
      from.x + headLength * Math.cos(angle - Math.PI / 6),
      from.y + headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(
      from.x + headLength * Math.cos(angle + Math.PI / 6),
      from.y + headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.strokeStyle = this.style.lineColor!;
    ctx.lineWidth = this.style.lineThickness!;
    ctx.stroke();
  }

  redraw() {
    this.drawPreview();
  }
}