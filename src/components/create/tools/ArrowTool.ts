import { BaseTool } from './BaseTool';
import { Point } from '../types';
import { EVENTS } from './EventManager';

export class ArrowTool extends BaseTool {
  private startPoint: Point | null = null;
  private endPoint: Point | null = null;
  private isDrawing = false;
  private previewShape: DrawnLine | null = null;

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
    this.previewShape = null;
  }

  private handleMouseDown = (e: MouseEvent) => {
    const point = this.getMapPoint(e);
    if (point) {
      this.startPoint = point;
      this.isDrawing = true;
      
      this.previewShape = {
        id: 'preview',
        type: 'arrow',
        points: [point, point],
        color: this.style.lineColor!,
        thickness: this.style.lineThickness!
      };
      
      this.canvasManager.getRenderManager().setShapes([
        ...(window as any).drawnLines || [],
        this.previewShape
      ]);
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.isDrawing || !this.startPoint || !this.previewShape) return;

    const point = this.getMapPoint(e);
    if (point) {
      this.endPoint = point;
      
      this.previewShape.points = [this.startPoint, point];
      
      this.canvasManager.getRenderManager().setShapes([
        ...(window as any).drawnLines || [],
        this.previewShape
      ]);
    }
  };

  private handleMouseUp = (e: MouseEvent) => {
    if (!this.isDrawing || !this.startPoint) return;

    const point = this.getMapPoint(e);
    if (point) {
      this.endPoint = point;
      const points = [this.startPoint, this.endPoint];
      
      this.previewShape = null;
      this.canvasManager.getRenderManager().setShapes([
        ...(window as any).drawnLines || []
      ]);
      
      this.emit(EVENTS.SHAPE_COMPLETE, {
        type: 'arrow',
        points
      });
      
      this.startPoint = null;
      this.endPoint = null;
      this.isDrawing = false;
    }
  };

  redraw() {
    // No need for explicit redraw as RenderManager handles it
  }
}