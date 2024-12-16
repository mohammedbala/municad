import { Point } from '../types';

export class SelectionBox {
  private ctx: CanvasRenderingContext2D;
  private padding: number = 10;
  private handleSize: number = 8;
  private handleStyle = {
    fillColor: '#FFD700', // Dark yellow
    strokeColor: '#000000', // Black
    lineWidth: 2
  };

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  drawBox(bounds: { minX: number; minY: number; maxX: number; maxY: number }) {
    this.ctx.save();
    
    // Draw selection rectangle
    this.ctx.strokeStyle = '#2196F3';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    
    this.ctx.strokeRect(
      bounds.minX - this.padding,
      bounds.minY - this.padding,
      bounds.maxX - bounds.minX + this.padding * 2,
      bounds.maxY - bounds.minY + this.padding * 2
    );

    // Draw resize handles
    this.ctx.setLineDash([]);
    const handles = [
      { x: bounds.minX - this.padding, y: bounds.minY - this.padding }, // NW
      { x: bounds.maxX + this.padding, y: bounds.minY - this.padding }, // NE
      { x: bounds.maxX + this.padding, y: bounds.maxY + this.padding }, // SE
      { x: bounds.minX - this.padding, y: bounds.maxY + this.padding }  // SW
    ];

    handles.forEach(handle => {
      this.drawHandle(handle.x, handle.y);
    });

    this.ctx.restore();
  }

  drawHandle(x: number, y: number) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.handleSize / 2, 0, Math.PI * 2);
    this.ctx.fillStyle = this.handleStyle.fillColor;
    this.ctx.fill();
    this.ctx.strokeStyle = this.handleStyle.strokeColor;
    this.ctx.lineWidth = this.handleStyle.lineWidth;
    this.ctx.stroke();
  }

  isHandleHit(point: Point, handle: { x: number; y: number }): boolean {
    const distance = Math.hypot(point.x - handle.x, point.y - handle.y);
    return distance <= this.handleSize;
  }

  getHandleCursor(handleIndex: number): string {
    switch (handleIndex) {
      case 0: return 'nw-resize'; // NW
      case 1: return 'ne-resize'; // NE
      case 2: return 'se-resize'; // SE
      case 3: return 'sw-resize'; // SW
      default: return 'move';
    }
  }
}