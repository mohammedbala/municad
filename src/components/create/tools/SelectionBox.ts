import { Point } from '../types';

export class SelectionBox {
  private ctx: CanvasRenderingContext2D;
  private padding: number = 10;
  private handleSize: number = 8;
  private rotateHandleOffset: number = 30;
  private handleStyle = {
    fillColor: '#FFD700',
    strokeColor: '#000000',
    lineWidth: 2,
    vertexFillColor: '#4CAF50'
  };

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  drawBox(bounds: { minX: number; minY: number; maxX: number; maxY: number }, points?: { x: number; y: number }[], shapeType?: string) {
    this.ctx.save();
    
    // Draw selection rectangle (dashed box with padding)
    this.ctx.strokeStyle = '#2196F3';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    
    // Add padding for text shapes, otherwise use existing logic
    const padding = shapeType === 'text' ? this.padding : 0;
    const boxMinX = bounds.minX - padding;
    const boxMinY = bounds.minY - padding;
    const boxMaxX = bounds.maxX + padding;
    const boxMaxY = bounds.maxY + padding;
    const boxWidth = boxMaxX - boxMinX;
    const boxHeight = boxMaxY - boxMinY;

    this.ctx.strokeRect(boxMinX, boxMinY, boxWidth, boxHeight);

    // Draw resize handles at corners based on shape type
    if (shapeType === 'text') {
        // For text, draw handles at the padded bounds
        this.ctx.setLineDash([]);
        const handles = [
            { x: boxMinX, y: boxMinY }, // NW
            { x: boxMaxX, y: boxMinY }, // NE
            { x: boxMaxX, y: boxMaxY }, // SE
            { x: boxMinX, y: boxMaxY }  // SW
        ];

        handles.forEach(handle => {
            this.drawHandle(handle.x, handle.y);
        });
    } else if (shapeType === 'sign' || shapeType === 'polygon') {
        // For signs and polygons, keep existing behavior
        this.ctx.setLineDash([]);
        const handles = [
            { x: boxMinX, y: boxMinY }, // NW
            { x: boxMaxX, y: boxMinY }, // NE
            { x: boxMaxX, y: boxMaxY }, // SE
            { x: boxMinX, y: boxMaxY }  // SW
        ];

        handles.forEach(handle => {
            this.drawHandle(handle.x, handle.y);
        });
    }

    // Draw rotate handle and line for applicable shapes
    if (shapeType === 'sign' || shapeType === 'text') {
        const centerX = (bounds.minX + bounds.maxX) / 2;
        this.ctx.setLineDash([]);
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, bounds.minY - this.padding);
        this.ctx.lineTo(centerX, bounds.minY - this.rotateHandleOffset);
        this.ctx.strokeStyle = this.handleStyle.strokeColor;
        this.ctx.stroke();
        
        // Draw the rotate handle
        this.drawHandle(centerX, bounds.minY - this.rotateHandleOffset);
    }

    // Draw vertex/endpoint handles if points are provided
    if (points && !['text', 'sign'].includes(shapeType || '')) {
        points.forEach((point, index) => {
            // For polygons, skip the last point as it's the same as the first
            if (shapeType === 'polygon' && 
                index === points.length - 1 && 
                point.x === points[0].x && 
                point.y === points[0].y) {
                return;
            }
            // For lines/arrows/dimensions, only draw the start and end points
            if (['line', 'arrow', 'dimension'].includes(shapeType || '') && 
                index < 2) {
                this.drawVertexHandle(point.x, point.y);
            } else if (!['line', 'arrow', 'dimension'].includes(shapeType || '')) {
                // For other shapes, draw all vertex points
                this.drawVertexHandle(point.x, point.y);
            }
        });
    }

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

  drawVertexHandle(x: number, y: number) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.handleSize / 2, 0, Math.PI * 2);
    this.ctx.fillStyle = this.handleStyle.vertexFillColor;
    this.ctx.fill();
    this.ctx.strokeStyle = this.handleStyle.strokeColor;
    this.ctx.lineWidth = this.handleStyle.lineWidth;
    this.ctx.stroke();
  }

  isHandleHit(point: Point, handle: { x: number; y: number }): boolean {
    const distance = Math.hypot(point.x - handle.x, point.y - handle.y);
    return distance <= this.handleSize;
  }

  getHandleCursor(handleIndex: number, isVertex: boolean = false): string {
    if (isVertex) {
      return 'move';
    }
    switch (handleIndex) {
      case 0: return 'nw-resize'; // NW
      case 1: return 'ne-resize'; // NE
      case 2: return 'se-resize'; // SE
      case 3: return 'sw-resize'; // SW
      default: return 'move';
    }
  }

  isRotateHandleHit(point: { x: number; y: number }, bounds: { minX: number; minY: number; maxX: number; maxY: number }): boolean {
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const handleY = bounds.minY - this.rotateHandleOffset;
    
    return this.isHandleHit(point, { x: centerX, y: handleY });
  }
}