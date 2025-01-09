import { Map as MapboxMap } from 'mapbox-gl';
import { ToolManager } from '../tools/ToolManager';
import { RenderManager } from './RenderManager';
import { Point } from '../types';
import { eventManager, EVENTS } from '../tools/EventManager';
import { SignTool } from '../tools/SignTool';

export class CanvasManager {
  private canvas: HTMLCanvasElement;
  private previewCanvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private previewCtx: CanvasRenderingContext2D;
  public toolManager: ToolManager;
  private renderManager: RenderManager;
  private resizeObserver: ResizeObserver;
  private signCache: Map<string, HTMLImageElement> = new Map();
  private frameId: number | null = null;

  constructor(canvas: HTMLCanvasElement, map: MapboxMap) {
    this.canvas = canvas;
    this.map = map;
    
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) throw new Error('Could not get canvas context');
    this.ctx = context;

    this.renderManager = new RenderManager(this);
    this.toolManager = new ToolManager(this, map);
    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.setupEventListeners();
    this.resize();

    this.previewCanvas = document.createElement('canvas');
    this.previewCanvas.style.position = 'absolute';
    this.previewCanvas.style.pointerEvents = 'none';
    this.previewCanvas.style.top = '0';
    this.previewCanvas.style.left = '0';
    canvas.parentElement?.appendChild(this.previewCanvas);
    
    const previewContext = this.previewCanvas.getContext('2d');
    if (!previewContext) throw new Error('Could not get preview canvas context');
    this.previewCtx = previewContext;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  public getRenderManager(): RenderManager {
    return this.renderManager;
  }

  private handleResize = () => {
    this.resize();
  };

  private resize = () => {
    const { width, height } = this.map.getContainer().getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;
    
    this.canvas.width = width * pixelRatio;
    this.canvas.height = height * pixelRatio;
    
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    
    this.ctx.scale(pixelRatio, pixelRatio);
    
    this.scheduleRedraw();
  };

  private setupEventListeners() {
    this.resizeObserver.observe(this.map.getContainer());
    
    const mapEvents = ['move', 'zoom', 'rotate', 'pitch', 'style.load', 'sourcedata'];
    mapEvents.forEach(event => {
      this.map.on(event, this.scheduleRedraw);
    });

    window.addEventListener('resize', this.resize);

    // Add drag and drop handlers
    this.canvas.addEventListener('dragover', this.handleDragOver);
    this.canvas.addEventListener('drop', this.handleDrop);
  }

  private handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'copy';
  };

  private handleDrop = (e: DragEvent) => {
    e.preventDefault();
    if (!this.map || !this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const lngLat = this.map.unproject([x, y]);
    
    try {
      const signData = JSON.parse(e.dataTransfer!.getData('application/json'));
      console.log('Drop event received with data:', signData); // Debug log

      const point = {
        lng: lngLat.lng,
        lat: lngLat.lat,
        x,
        y
      };

      // Get the SignTool
      const signTool = this.toolManager.getTool('sign');
      if (!signTool) {
        console.error('SignTool not found');
        return;
      }

      // Ensure we have the required path
      if (!signData.path) {
        console.error('Sign path is missing from dropped data:', signData);
        return;
      }

      // Use the SignTool to handle the drop with properly structured data
      (signTool as SignTool).handleDrop(point, {
        url: signData.path,  // Use path as url
        name: signData.name || 'Unknown Sign',
        size: signData.size || 64
      });

    } catch (error) {
      console.error('Error handling sign drop:', error, 'Data:', e.dataTransfer?.getData('application/json'));
    }
  };

  private scheduleRedraw = () => {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }

    this.frameId = requestAnimationFrame(() => {
      this.frameId = null;
      this.redraw();
      eventManager.emit(EVENTS.MAP_CHANGED);
    });
  };

  public clear() {
    const pixelRatio = window.devicePixelRatio || 1;
    this.ctx.clearRect(0, 0, this.canvas.width / pixelRatio, this.canvas.height / pixelRatio);
  }

  public redraw() {
    this.clear();
    this.ctx.save();
    
    // First let RenderManager draw all shapes
    this.renderManager.render();
    
    // Then let tools draw their UI elements
    this.toolManager.redrawAll();
    
    this.ctx.restore();
  }

  public drawLine(points: Point[], color: string, thickness: number = 1.0) {
    if (points.length < 2) return;
  
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = thickness;
  
    const start = this.map.project([points[0].lng, points[0].lat]);
    this.ctx.moveTo(start.x, start.y);
  
    for (let i = 1; i < points.length; i++) {
      const point = this.map.project([points[i].lng, points[i].lat]);
      this.ctx.lineTo(point.x, point.y);
    }
  
    this.ctx.stroke();
    this.ctx.restore();
  }

  public drawText(point: Point, text: string, color: string, size: number = 16, fontColor?: string, fillColor?: string, thickness: number = 1, alignment: 'left' | 'center' | 'right' = 'center') {
    // console.log('CanvasManager.drawText - Drawing text with alignment:', alignment);
    if (!text) return;

    const projected = this.map.project([point.lng, point.lat]);
    this.ctx.font = `${size}px Arial`;
    
    // Split text into lines
    const lines = text.split('\n');
    
    // Calculate metrics for all lines
    const lineMetrics = lines.map(line => this.ctx.measureText(line));
    const maxWidth = Math.max(...lineMetrics.map(m => m.width));
    const lineHeight = size * 1.2;
    const totalHeight = lineHeight * lines.length;
    
    const padding = 10;
    
    // Log the alignment calculation
    // console.log('CanvasManager.drawText - Calculating position for alignment:', alignment);
    
    // Adjust x position based on alignment
    let x: number;
    switch (alignment) {
        case 'left':
            x = projected.x - padding;
            // console.log('Left alignment, x =', x);
            break;
        case 'right':
            x = projected.x - maxWidth - padding;
            // console.log('Right alignment, x =', x);
            break;
        default: // center
            x = projected.x - maxWidth / 2 - padding;
            // console.log('Center alignment, x =', x);
    }
    const y = projected.y - totalHeight / 2 - padding;
    const width = maxWidth + padding * 2;
    const height = totalHeight + padding * 2;

    // Draw background if fillColor is provided
    if (fillColor) {
        this.ctx.fillStyle = fillColor;
        this.ctx.fillRect(x, y, width, height);
    }

    // Draw border with specified thickness
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = thickness;
    this.ctx.strokeRect(x, y, width, height);

    // Draw each line of text
    this.ctx.fillStyle = fontColor || color;
    this.ctx.textAlign = alignment;
    this.ctx.textBaseline = 'middle';
    
    // Adjust x position for text based on alignment
    const textX = alignment === 'left' ? x + padding : 
                 alignment === 'right' ? x + width - padding :
                 projected.x;
    

    
    lines.forEach((line, index) => {
        const lineY = projected.y - (totalHeight / 2) + (lineHeight * index) + (lineHeight / 2);
        this.ctx.fillText(line, textX, lineY);
    });
  }

  public drawArrow(points: Point[], color: string, thickness: number = 1.0) {
    if (points.length !== 2) return;

    const start = this.map.project([points[0].lng, points[0].lat]);
    const end = this.map.project([points[1].lng, points[1].lat]);

    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = thickness;
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.stroke();

    const headLength = 20;
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    this.ctx.beginPath();
    this.ctx.moveTo(end.x, end.y);
    this.ctx.lineTo(
      end.x - headLength * Math.cos(angle - Math.PI / 6),
      end.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.moveTo(end.x, end.y);
    this.ctx.lineTo(
      end.x - headLength * Math.cos(angle + Math.PI / 6),
      end.y - headLength * Math.sin(angle + Math.PI / 6)
    );
    this.ctx.stroke();
  }

  public drawPolygon(points: Point[], strokeColor: string, fillColor: string | null, thickness: number = 1.0) {
    if (points.length < 3) return;

    this.ctx.save();
    this.ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    
    this.ctx.beginPath();
    const start = this.map.project([points[0].lng, points[0].lat]);
    this.ctx.moveTo(start.x, start.y);

    for (let i = 1; i < points.length; i++) {
      const point = this.map.project([points[i].lng, points[i].lat]);
      this.ctx.lineTo(point.x, point.y);
    }

    this.ctx.closePath();
    
    if (fillColor !== null) {
      this.ctx.fillStyle = fillColor;
      this.ctx.fill();
    }
    
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = thickness;
    this.ctx.stroke();
    
    this.ctx.restore();
  }

  public drawDimensionLine(points: Point[], color: string, measurement?: string, thickness: number = 1.0) {
    if (points.length !== 2) return;

    const start = this.map.project([points[0].lng, points[0].lat]);
    const end = this.map.project([points[1].lng, points[1].lat]);

    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = thickness;
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.stroke();

    const headLength = 15;
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    // Draw arrows at both ends
    this.drawArrowHead(start, end, color, thickness);
    this.drawArrowHead(end, start, color, thickness);

    if (measurement) {
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;

      this.ctx.font = '14px Arial';
      const metrics = this.ctx.measureText(measurement);
      
      this.ctx.fillStyle = 'white';
      this.ctx.fillRect(
        midX - metrics.width / 2 - 4,
        midY - 10,
        metrics.width + 8,
        20
      );

      this.ctx.fillStyle = color;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(measurement, midX, midY);
    }
  }

  public drawSign(point: Point, url: string, size: number = 64, rotation: number = 0) {
    const projected = this.map.project([point.lng, point.lat]);
    
    let img = this.signCache.get(url);
    if (!img) {
        img = new Image();
        img.crossOrigin = "anonymous";
        img.src = url;
        this.signCache.set(url, img);
        
        img.onerror = (e) => {
            console.error('CanvasManager: Failed to load sign image:', url, e);
            this.signCache.delete(url);
        };
    }

    if (img.complete) {
        this.ctx.save();
        this.ctx.translate(projected.x, projected.y);
        // Convert degrees to radians
        const rotationInRadians = (rotation * Math.PI) / 180;
        this.ctx.rotate(rotationInRadians);
        try {
            this.ctx.drawImage(
                img,
                -size / 2,
                -size / 2,
                size,
                size
            );
        } catch (e) {
            console.error('CanvasManager: Error drawing image:', e);
        }
        this.ctx.restore();
    } else {
        img.onload = () => {
            this.redraw();
        };
    }
  }

  private drawArrowHead(from: { x: number; y: number }, to: { x: number; y: number }, color: string, thickness: number = 1.0) {
    const headLength = 15;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);

    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = thickness;
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(
      from.x + headLength * Math.cos(angle - Math.PI / 6),
      from.y + headLength * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(
      from.x + headLength * Math.cos(angle + Math.PI / 6),
      from.y + headLength * Math.sin(angle + Math.PI / 6)
    );
    this.ctx.stroke();
  }

  public cleanup() {
    this.resizeObserver.disconnect();
    
    const mapEvents = ['move', 'zoom', 'rotate', 'pitch', 'style.load', 'sourcedata'];
    mapEvents.forEach(event => {
      this.map.off(event, this.scheduleRedraw);
    });

    window.removeEventListener('resize', this.resize);
    this.toolManager.cleanup();
    this.renderManager.cleanup();
    eventManager.removeAllListeners();
    this.signCache.clear();

    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }

    // Remove drag and drop listeners
    this.canvas.removeEventListener('dragover', this.handleDragOver);
    this.canvas.removeEventListener('drop', this.handleDrop);
  }

  public clearPreview() {
    const pixelRatio = window.devicePixelRatio || 1;
    this.previewCtx.clearRect(0, 0, this.previewCanvas.width / pixelRatio, this.previewCanvas.height / pixelRatio);
  }

  public getPreviewContext(): CanvasRenderingContext2D {
    return this.previewCtx;
  }

  public drawHatchedPolygon(points: Point[], strokeColor: string, fillColor: string, hatchPattern: string, thickness: number = 1.0) {
    if (points.length < 3) return;

    // First draw the regular polygon
    this.drawPolygon(points, strokeColor, fillColor, thickness);

    if (hatchPattern === 'none') return;

    // Save context state
    this.ctx.save();
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = thickness * 0.5;

    // Get bounding box of the polygon
    const projected = points.map(p => this.map.project([p.lng, p.lat]));
    const minX = Math.min(...projected.map(p => p.x));
    const maxX = Math.max(...projected.map(p => p.x));
    const minY = Math.min(...projected.map(p => p.y));
    const maxY = Math.max(...projected.map(p => p.y));

    // Create clipping path for the polygon
    this.ctx.beginPath();
    const start = projected[0];
    this.ctx.moveTo(start.x, start.y);
    for (let i = 1; i < projected.length; i++) {
      this.ctx.lineTo(projected[i].x, projected[i].y);
    }
    this.ctx.closePath();
    this.ctx.clip();

    // Draw hatch pattern
    const spacing = 8; // Spacing between hatch lines
    this.ctx.beginPath();

    switch (hatchPattern) {
      case 'diagonal':
        for (let x = minX - maxY; x < maxX + maxY; x += spacing) {
          this.ctx.moveTo(x, minY);
          this.ctx.lineTo(x + maxY - minY, maxY);
        }
        break;

      case 'cross':
        // Diagonal lines in both directions
        for (let x = minX - maxY; x < maxX + maxY; x += spacing) {
          this.ctx.moveTo(x, minY);
          this.ctx.lineTo(x + maxY - minY, maxY);
        }
        for (let x = minX - maxY; x < maxX + maxY; x += spacing) {
          this.ctx.moveTo(x + maxY - minY, minY);
          this.ctx.lineTo(x, maxY);
        }
        break;

      case 'horizontal':
        for (let y = minY; y < maxY; y += spacing) {
          this.ctx.moveTo(minX, y);
          this.ctx.lineTo(maxX, y);
        }
        break;

      case 'vertical':
        for (let x = minX; x < maxX; x += spacing) {
          this.ctx.moveTo(x, minY);
          this.ctx.lineTo(x, maxY);
        }
        break;
    }

    this.ctx.stroke();
    this.ctx.restore();
  }
}