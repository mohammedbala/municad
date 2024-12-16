import { Map as MapboxMap } from 'mapbox-gl';
import { CanvasManager } from '../canvas/CanvasManager';
import { BaseTool } from './BaseTool';
import { SelectTool } from './SelectTool';
import { LineTool } from './LineTool';
import { RectangleTool } from './RectangleTool';
import { PolygonTool } from './PolygonTool';
import { DimensionTool } from './DimensionTool';
import { PanTool } from './PanTool';
import { ArrowTool } from './ArrowTool';
import { DrawTool } from './DrawTool';
import { TextTool } from './TextTool';
import { SignTool } from './SignTool';

export class ToolManager {
  private tools: Map<string, BaseTool> = new Map();
  private activeTool: BaseTool | null = null;
  private canvasManager: CanvasManager;
  private map: MapboxMap;

  constructor(canvasManager: CanvasManager, map: MapboxMap) {
    this.canvasManager = canvasManager;
    this.map = map;
    this.registerDefaultTools();
  }

  private registerDefaultTools() {
    this.registerTool('select', new SelectTool(this.canvasManager, this.map));
    this.registerTool('line', new LineTool(this.canvasManager, this.map));
    this.registerTool('rectangle', new RectangleTool(this.canvasManager, this.map));
    this.registerTool('polygon', new PolygonTool(this.canvasManager, this.map));
    this.registerTool('measure', new DimensionTool(this.canvasManager, this.map));
    this.registerTool('pan', new PanTool(this.canvasManager, this.map));
    this.registerTool('arrow', new ArrowTool(this.canvasManager, this.map));
    this.registerTool('draw', new DrawTool(this.canvasManager, this.map));
    this.registerTool('text', new TextTool(this.canvasManager, this.map));
    this.registerTool('sign', new SignTool(this.canvasManager, this.map));
  }

  public registerTool(name: string, tool: BaseTool) {
    this.tools.set(name, tool);
  }

  public getTool(name: string): BaseTool | undefined {
    return this.tools.get(name);
  }

  public setActiveTool(toolName: string | null) {
    if (this.activeTool) {
      this.activeTool.deactivate();
      this.activeTool = null;
    }

    if (toolName && this.tools.has(toolName)) {
      this.activeTool = this.tools.get(toolName)!;
      this.activeTool.activate();
    }
  }

  public updateStyle(style: { lineColor?: string; fillColor?: string; thickness?: number }) {
    this.tools.forEach(tool => {
      tool.updateStyle(style);
      if (tool instanceof SelectTool && this.activeTool === tool) {
        tool.updateSelectedShapeStyle(style);
      }
    });
  }

  public redrawAll() {
    if (this.activeTool) {
      this.activeTool.redraw();
    }
  }

  public cleanup() {
    if (this.activeTool) {
      this.activeTool.deactivate();
    }
    this.tools.clear();
  }
}