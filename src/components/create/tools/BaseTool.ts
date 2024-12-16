import { Map as MapboxMap } from 'mapbox-gl';
import { CanvasManager } from '../canvas/CanvasManager';
import { Point } from '../types';
import { eventManager, EVENTS } from './EventManager';

export interface ToolStyle {
  lineColor?: string;
  fillColor?: string;
  fontColor?: string;
  lineType?: string;
  lineThickness?: number;
}

export abstract class BaseTool {
  protected canvasManager: CanvasManager;
  protected map: MapboxMap;
  protected style: ToolStyle = {
    lineColor: '#1E3A8A',
    fillColor: '#ffffff',
    fontColor: '#1E3A8A',
    lineType: 'solid',
    lineThickness: 1.0
  };

  constructor(canvasManager: CanvasManager, map: MapboxMap) {
    this.canvasManager = canvasManager;
    this.map = map;
  }

  abstract activate(): void;
  abstract deactivate(): void;
  abstract redraw(): void;
  
  public updateStyle(style: ToolStyle) {
    this.style = { ...this.style, ...style };
  }

  public cleanup() {
    this.deactivate();
  }

  protected getMapPoint(e: MouseEvent): Point | null {
    const rect = this.canvasManager.getCanvas().getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const lngLat = this.map.unproject([x, y]);

    return {
      lng: lngLat.lng,
      lat: lngLat.lat,
      x,
      y
    };
  }

  protected emit(event: string, data: any) {
    eventManager.emit(event, data);
  }
}