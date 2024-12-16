import { BaseTool } from './BaseTool';
import { Point } from '../types';

export class PanTool extends BaseTool {
  private isDragging = false;
  private lastPoint: Point | null = null;

  activate() {
    const canvas = this.canvasManager.getCanvas();
    canvas.style.cursor = 'grab';
    canvas.addEventListener('mousedown', this.handleMouseDown);
    canvas.addEventListener('mousemove', this.handleMouseMove);
    canvas.addEventListener('mouseup', this.handleMouseUp);
    canvas.addEventListener('mouseleave', this.handleMouseUp);
  }

  deactivate() {
    const canvas = this.canvasManager.getCanvas();
    canvas.style.cursor = 'default';
    canvas.removeEventListener('mousedown', this.handleMouseDown);
    canvas.removeEventListener('mousemove', this.handleMouseMove);
    canvas.removeEventListener('mouseup', this.handleMouseUp);
    canvas.removeEventListener('mouseleave', this.handleMouseUp);
    this.isDragging = false;
    this.lastPoint = null;
  }

  private handleMouseDown = (e: MouseEvent) => {
    const point = this.getMapPoint(e);
    if (point) {
      this.isDragging = true;
      this.lastPoint = point;
      this.canvasManager.getCanvas().style.cursor = 'grabbing';
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.isDragging || !this.lastPoint) return;

    const point = this.getMapPoint(e);
    if (point) {
      const center = this.map.getCenter();
      const newLng = center.lng - (point.lng - this.lastPoint.lng);
      const newLat = center.lat - (point.lat - this.lastPoint.lat);
      
      this.map.setCenter([newLng, newLat]);
      this.lastPoint = point;
    }
  };

  private handleMouseUp = () => {
    this.isDragging = false;
    this.lastPoint = null;
    this.canvasManager.getCanvas().style.cursor = 'grab';
  };

  redraw() {
    // Pan tool doesn't need to redraw anything
  }
}