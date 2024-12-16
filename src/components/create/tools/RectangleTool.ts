import { BaseTool } from './BaseTool';
import { Point } from '../types';
import { EVENTS } from './EventManager';

export class RectangleTool extends BaseTool {
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
      const points = this.getRectanglePoints();
      this.emit(EVENTS.SHAPE_COMPLETE, {
        type: 'rectangle',
        points
      });
      this.startPoint = null;
      this.endPoint = null;
      this.isDrawing = false;
    }
  };

  private getRectanglePoints(): Point[] {
    if (!this.startPoint || !this.endPoint) return [];

    // Get the map instance from canvas manager
    const map = this.canvasManager.map;
    
    // Convert start and end points to screen coordinates
    const startScreen = map.project([this.startPoint.lng, this.startPoint.lat]);
    const endScreen = map.project([this.endPoint.lng, this.endPoint.lat]);

    // Calculate rectangle corners in screen coordinates
    const corners = [
      startScreen,  // Top-left
      { x: endScreen.x, y: startScreen.y },  // Top-right
      endScreen,    // Bottom-right
      { x: startScreen.x, y: endScreen.y },  // Bottom-left
      startScreen   // Close the rectangle
    ];

    // Convert corners back to geographic coordinates
    return corners.map(corner => {
      const lngLat = map.unproject([corner.x, corner.y]);
      return {
        lng: lngLat.lng,
        lat: lngLat.lat,
        x: corner.x,
        y: corner.y
      };
    });
  }

  private drawPreview() {
    if (!this.startPoint || !this.endPoint) return;

    this.canvasManager.clear();
    const points = this.getRectanglePoints();
    this.canvasManager.drawPolygon(points, this.style.lineColor!, this.style.fillColor!);
  }

  redraw() {
    this.drawPreview();
  }
}