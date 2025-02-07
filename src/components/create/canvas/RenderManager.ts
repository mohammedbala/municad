import { CanvasManager } from './CanvasManager';
import { DrawnLine } from '../types';

export class RenderManager {
  private canvasManager: CanvasManager;
  private shapes: DrawnLine[] = [];
  private selectedShape: DrawnLine | null = null;
  private needsRender: boolean = false;
  private frameId: number | null = null;

  constructor(canvasManager: CanvasManager) {
    this.canvasManager = canvasManager;
  }

  public setShapes(shapes: DrawnLine[], selectedId: string | null = null) {
    this.shapes = shapes;
    this.selectedShape = selectedId ? shapes.find(s => s.id === selectedId) || null : null;
    this.requestRender();
  }

  public setSelectedShape(shape: DrawnLine | null) {
    this.selectedShape = shape;
    this.requestRender();
  }

  private requestRender() {
    if (!this.needsRender) {
      this.needsRender = true;
      this.frameId = requestAnimationFrame(() => this.render());
    }
  }

  public render() {
    // console.log('RenderManager.render - All shapes:', this.shapes);
    
    this.canvasManager.clear();

    // Render non-selected shapes
    this.shapes.forEach(shape => {
      if (shape.id !== this.selectedShape?.id) {
        this.renderShape(shape);
      }
    });

    // Render selected shape last with selection UI
    if (this.selectedShape) {
      // console.log('RenderManager: Rendering selected shape:', this.selectedShape);
      this.renderShape(this.selectedShape);
      const selectTool = this.canvasManager.toolManager.getTool('select');
      if (selectTool) {
        selectTool.setSelectedShape(this.selectedShape);
        selectTool.redraw();
      }
    }

    this.needsRender = false;
    this.frameId = null;
  }

  public renderShape(shape: DrawnLine) {
    switch (shape.type) {
      case 'line':
        this.canvasManager.drawLine(shape.points, shape.color, shape.thickness);
        break;
      case 'arrow':
        this.canvasManager.drawArrow(shape.points, shape.color, shape.thickness);
        break;
      case 'rectangle':
      case 'polygon':
        if (shape.hatchPattern) {
          this.canvasManager.drawHatchedPolygon(
            shape.points,
            shape.color,
            shape.fillColor || '',
            shape.hatchPattern,
            shape.thickness
          );
        } else {
          this.canvasManager.drawPolygon(
            shape.points,
            shape.color,
            shape.fillColor,
            shape.thickness
          );
        }
        break;
      case 'dimension':
        this.canvasManager.drawDimensionLine(
          shape.points,
          shape.color,
          shape.measurement,
          shape.thickness
        );
        break;
      case 'text':
        if (!shape.text) {
          console.warn('RenderManager: Text shape missing text property:', shape);
          return;
        }



        this.canvasManager.drawText(
          shape.points[0],
          shape.text,
          shape.color,
          shape.size || 16,
          shape.fontColor || shape.color,
          shape.fillColor,
          shape.thickness,
          shape.alignment
        );
        break;
      case 'sign':
        if (!shape.signData) {
          console.warn('RenderManager: Shape is missing signData:', shape);
          return;
        }
        
        if (!shape.signData.url) {
          console.warn('RenderManager: Shape signData is missing URL:', shape.signData);
          return;
        }

        this.canvasManager.drawSign(
          shape.points[0],
          shape.signData.url,
          shape.signData.size || 64,
          shape.signData.rotation || 0
        );
        break;
    }
  }

  public cleanup() {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    this.needsRender = false;
    this.shapes = [];
    this.selectedShape = null;
  }

  public getState() {
    return {
      shapes: this.shapes,
      selectedShape: this.selectedShape
    };
  }

  public setState(state: { shapes: DrawnLine[], selectedShape: DrawnLine | null }) {
    this.shapes = state.shapes;
    this.selectedShape = state.selectedShape;
    this.requestRender();
  }

  private renderText(shape: DrawnLine) {
    if (!shape.points[0] || !shape.text) return;
    

    this.canvasManager.drawText(
      shape.points[0],
      shape.text,
      shape.color,
      shape.size,
      shape.fontColor,
      shape.fillColor || undefined,
      shape.thickness,
      shape.alignment
    );
  }
}