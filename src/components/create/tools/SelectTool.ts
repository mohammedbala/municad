import { BaseTool } from './BaseTool';
import { Point, DrawnLine } from '../types';
import { EVENTS } from './EventManager';
import { findNearbyShapes } from '../utils/nearbyShapes';
import { SelectionBox } from './SelectionBox';
import { calculateSignBounds, calculateNewSignSize } from '../utils/signUtils';
import { calculateTextBounds } from '../utils/textUtils';
import { calculateDistance, formatMeasurement } from '../utils/measurementUtils';

interface ResizeState {
  handleIndex: number;
  originalPoints: Point[];
  startPoint: Point;
  originalSize?: number;
  originalRotation?: number;
  isRotating?: boolean;
  bounds?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

export class SelectTool extends BaseTool {
  private selectedShape: DrawnLine | null = null;
  private isDragging = false;
  private dragStart: Point | null = null;
  private originalPoints: Point[] | null = null;
  private resizeState: ResizeState | null = null;
  private isResizing = false;
  private selectionBox: SelectionBox;
  private textInput: HTMLInputElement | null = null;
  private isEditing = false;
  private currentCursor: string = 'default';

  constructor(canvasManager: any, map: any) {
    super(canvasManager, map);
    this.selectionBox = new SelectionBox(this.canvasManager.getContext());
  }

  private setCursor(cursor: string) {
    if (this.currentCursor !== cursor) {
      this.currentCursor = cursor;
      this.canvasManager.getCanvas().style.cursor = cursor;
    }
  }

  activate() {
    const canvas = this.canvasManager.getCanvas();
    canvas.addEventListener('mousedown', this.handleMouseDown);
    canvas.addEventListener('mousemove', this.handleMouseMove);
    canvas.addEventListener('mouseup', this.handleMouseUp);
    canvas.addEventListener('dblclick', this.handleDoubleClick);
  }

  deactivate() {
    const canvas = this.canvasManager.getCanvas();
    canvas.removeEventListener('mousedown', this.handleMouseDown);
    canvas.removeEventListener('mousemove', this.handleMouseMove);
    canvas.removeEventListener('mouseup', this.handleMouseUp);
    canvas.removeEventListener('dblclick', this.handleDoubleClick);
    this.selectedShape = null;
    this.isDragging = false;
    this.dragStart = null;
    this.originalPoints = null;
    this.resizeState = null;
    this.isResizing = false;
    this.removeTextInput();
    this.setCursor('default');
  }

  private handleDoubleClick = (e: MouseEvent) => {
    if (!this.selectedShape || this.selectedShape.type !== 'text') return;

    const point = this.getMapPoint(e);
    if (!point) return;

    const bounds = calculateTextBounds(
      this.selectedShape.points[0],
      this.selectedShape.text || '',
      this.selectedShape.size || 16,
      this.map,
      this.canvasManager.getContext()
    );

    const projected = this.map.project([point.lng, point.lat]);
    if (
      projected.x >= bounds.minX &&
      projected.x <= bounds.maxX &&
      projected.y >= bounds.minY &&
      projected.y <= bounds.maxY
    ) {
      this.startTextEditing();
    }
  };

  private startTextEditing() {
    if (!this.selectedShape || this.selectedShape.type !== 'text' || this.isEditing) return;

    this.isEditing = true;
    const point = this.selectedShape.points[0];
    const projected = this.map.project([point.lng, point.lat]);
    const canvas = this.canvasManager.getCanvas();
    const rect = canvas.getBoundingClientRect();

    this.textInput = document.createElement('input');
    Object.assign(this.textInput.style, {
      position: 'fixed',
      left: `${rect.left + projected.x}px`,
      top: `${rect.top + projected.y}px`,
      transform: 'translate(-50%, -50%)',
      minWidth: '100px',
      padding: '4px 8px',
      border: '2px solid #1E3A8A',
      borderRadius: '4px',
      backgroundColor: 'white',
      fontSize: `${this.selectedShape.size || 16}px`,
      color: this.selectedShape.fontColor || this.selectedShape.color,
      zIndex: '1000',
      textAlign: 'center'
    });

    this.textInput.value = this.selectedShape.text || '';
    this.textInput.addEventListener('keydown', this.handleTextKeyDown);
    this.textInput.addEventListener('blur', this.handleTextBlur);

    document.body.appendChild(this.textInput);
    this.textInput.focus();
    this.textInput.select();
  }

  private handleTextKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.completeTextEditing();
    } else if (e.key === 'Escape') {
      this.removeTextInput();
    }
  };

  private handleTextBlur = () => {
    if (this.isEditing) {
      this.completeTextEditing();
    }
  };

  private completeTextEditing() {
    if (!this.textInput || !this.selectedShape || !this.isEditing) return;

    const newText = this.textInput.value.trim();
    if (newText && newText !== this.selectedShape.text) {
      this.emit(EVENTS.SHAPE_UPDATE, {
        id: this.selectedShape.id,
        text: newText
      });
    }

    this.removeTextInput();
  }

  private removeTextInput() {
    if (this.textInput && this.textInput.parentNode) {
      this.textInput.removeEventListener('keydown', this.handleTextKeyDown);
      this.textInput.removeEventListener('blur', this.handleTextBlur);
      this.textInput.parentNode.removeChild(this.textInput);
      this.textInput = null;
    }
    this.isEditing = false;
  }

  private handleMouseDown = (e: MouseEvent) => {
    if (this.isEditing) return;

    const point = this.getMapPoint(e);
    if (!point) return;

    const canvas = this.canvasManager.getCanvas();
    const rect = canvas.getBoundingClientRect();
    const canvasPoint = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };

    if (this.selectedShape && this.selectedShape.type === 'sign') {
        const signPoint = this.selectedShape.points[0];
        const size = this.selectedShape.signData?.size || 64;
        const bounds = calculateSignBounds(signPoint, size, this.map);
        
        if (this.selectionBox.isRotateHandleHit(canvasPoint, bounds)) {
            console.log('Rotate handle hit detected');
            this.startResize(point, { index: -1, type: 'rotate' });
            return;
        }
    }

    if (this.selectedShape) {
        let bounds;
        
        // Calculate bounds based on shape type
        if (this.selectedShape.type === 'sign') {
            const signPoint = this.selectedShape.points[0];
            const size = this.selectedShape.signData?.size || 64;
            bounds = calculateSignBounds(signPoint, size, this.map);
        } else {
            const projectedPoints = this.selectedShape.points.map(p => {
                const projected = this.map.project([p.lng, p.lat]);
                return { x: projected.x, y: projected.y };
            });
            bounds = this.calculateBounds(projectedPoints);
        }

        const handleInfo = this.getClickedHandle(canvasPoint, bounds);
        if (handleInfo) {
            this.startResize(point, handleInfo);
            return;
        }
    }

    const shapes = (window as any).drawnLines || [];
    const nearbyShapes = findNearbyShapes(point, shapes, this.map);

    if (nearbyShapes.length > 0) {
        const nearestShape = shapes.find(s => s.id === nearbyShapes[0].id);
        if (nearestShape) {
            this.selectedShape = nearestShape;
            this.dragStart = point;
            this.isDragging = true;
            this.originalPoints = [...nearestShape.points];
            canvas.style.cursor = 'move';
        }
    } else {
        this.selectedShape = null;
    }

    this.emit(EVENTS.SELECTION_CHANGE, { 
        point,
        selectedShape: this.selectedShape 
    });

    requestAnimationFrame(() => {
        this.canvasManager.redraw();
    });
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (this.isEditing) return;

    const point = this.getMapPoint(e);
    if (!point) return;

    // Handle dragging
    if (this.isDragging && this.selectedShape && this.dragStart) {
      const deltaLng = point.lng - this.dragStart.lng;
      const deltaLat = point.lat - this.dragStart.lat;

      if (this.selectedShape.type === 'sign') {
        // For signs, we only need to update the single point
        this.selectedShape.points = [
          {
            lng: this.originalPoints![0].lng + deltaLng,
            lat: this.originalPoints![0].lat + deltaLat
          }
        ];
      } else {
        // For other shapes, update all points
        this.selectedShape.points = this.originalPoints!.map(p => ({
          lng: p.lng + deltaLng,
          lat: p.lat + deltaLat
        }));
      }

      // Emit the shape move event
      this.emit(EVENTS.SHAPE_MOVE, {
        id: this.selectedShape.id,
        points: this.selectedShape.points
      });

      requestAnimationFrame(() => {
        this.canvasManager.redraw();
      });
      return;
    }

    if (this.isResizing && this.resizeState) {
      this.handleResize(point);
      return;
    }

    if (this.selectedShape) {
      let bounds;
      let projectedPoints;
      
      if (this.selectedShape.type === 'polygon') {
          projectedPoints = this.selectedShape.points.map(p => {
              const projected = this.map.project([p.lng, p.lat]);
              return { x: projected.x, y: projected.y };
          });
          bounds = this.calculateBounds(projectedPoints);
      } else if (this.selectedShape.type === 'sign') {
          const signPoint = this.selectedShape.points[0];
          const size = this.selectedShape.signData?.size || 64;
          bounds = calculateSignBounds(signPoint, size, this.map);
      }

      const handleInfo = this.getClickedHandle(point, bounds);
      if (handleInfo) {
          const cursor = handleInfo.type === 'vertex' ? 
              'move' : 
              this.selectionBox.getHandleCursor(handleInfo.index);
          this.setCursor(cursor);
          return;
      }
    }

    this.setCursor('default');
  };

  private handleMouseUp = () => {
    if (this.isEditing) return;

    if (this.isDragging || this.isResizing) {
      requestAnimationFrame(() => {
        this.canvasManager.redraw();
      });
    }

    this.isDragging = false;
    this.dragStart = null;
    this.originalPoints = null;
    this.isResizing = false;
    this.resizeState = null;

    const canvas = this.canvasManager.getCanvas();
    canvas.style.cursor = this.selectedShape ? 'move' : 'default';
  };

  private updateDimensionMeasurement() {
    if (!this.selectedShape || this.selectedShape.type !== 'dimension' || this.selectedShape.points.length < 2) return;

    const [start, end] = this.selectedShape.points;
    const distance = calculateDistance(start.lat, start.lng, end.lat, end.lng);
    this.selectedShape.measurement = formatMeasurement(distance);
  }

  private startResize(point: Point, handleInfo: { index: number; type?: 'corner' | 'vertex' | 'rotate' }) {
    if (!this.selectedShape) return;

    const projectedPoints = this.selectedShape.points.map(p => {
        const projected = this.map.project([p.lng, p.lat]);
        return { x: projected.x, y: projected.y };
    });

    const xs = projectedPoints.map(p => p.x);
    const ys = projectedPoints.map(p => p.y);

    const projected = this.map.project([point.lng, point.lat]);
    const currentPoint = { x: projected.x, y: projected.y };

    this.resizeState = {
        handleIndex: handleInfo.index,
        type: handleInfo.type,
        originalPoints: [...this.selectedShape.points],
        startPoint: currentPoint,
        originalSize: this.selectedShape.type === 'sign' ? 
            this.selectedShape.signData?.size : undefined,
        originalRotation: this.selectedShape.type === 'sign' ? 
            (this.selectedShape.signData?.rotation || 0) : undefined,
        isRotating: handleInfo.type === 'rotate',
        bounds: {
            minX: Math.min(...xs),
            minY: Math.min(...ys),
            maxX: Math.max(...xs),
            maxY: Math.max(...ys)
        }
    };

    this.isResizing = true;
  }

  private handleResize(point: Point) {
    if (!this.resizeState || !this.selectedShape) return;

    if (this.selectedShape.type === 'sign') {
        if (this.resizeState.handleIndex === -1) { // Rotation
            const signPoint = this.selectedShape.points[0];
            const projected = this.map.project([signPoint.lng, signPoint.lat]);
            const centerX = projected.x;
            const centerY = projected.y;

            const currentProjected = this.map.project([point.lng, point.lat]);
            const currentPoint = { x: currentProjected.x, y: currentProjected.y };
            
            const startAngle = Math.atan2(
                this.resizeState.startPoint.y - centerY,
                this.resizeState.startPoint.x - centerX
            );
            const currentAngle = Math.atan2(
                currentPoint.y - centerY,
                currentPoint.x - centerX
            );
            
            let rotation = ((currentAngle - startAngle) * (180 / Math.PI)) % 360;
            
            if (this.selectedShape.signData) {
                rotation = (this.resizeState.originalRotation || 0) + rotation;
                this.selectedShape.signData.rotation = rotation;

                this.emit(EVENTS.SHAPE_UPDATE, {
                    id: this.selectedShape.id,
                    signData: { ...this.selectedShape.signData }
                });
            }
        } else { // Corner resize
            const signPoint = this.selectedShape.points[0];
            const projected = this.map.project([signPoint.lng, signPoint.lat]);
            const currentProjected = this.map.project([point.lng, point.lat]);
            
            // Calculate distance from center to current point
            const dx = currentProjected.x - projected.x;
            const dy = currentProjected.y - projected.y;
            const distance = Math.sqrt(dx * dx + dy * dy) * 2; // Multiply by 2 since we're measuring from center
            
            // Update sign size
            if (this.selectedShape.signData && this.resizeState.originalSize) {
                // Calculate new size based on original size and distance ratio
                const startDx = this.resizeState.startPoint.x - projected.x;
                const startDy = this.resizeState.startPoint.y - projected.y;
                const startDistance = Math.sqrt(startDx * startDx + startDy * startDy) * 2;
                
                const sizeRatio = distance / startDistance;
                const newSize = Math.max(32, Math.min(256, this.resizeState.originalSize * sizeRatio));
                
                this.selectedShape.signData.size = Math.round(newSize);
                
                this.emit(EVENTS.SHAPE_UPDATE, {
                    id: this.selectedShape.id,
                    signData: { ...this.selectedShape.signData }
                });
            }
        }
    } else if (this.selectedShape.type === 'polygon') {
        const projected = this.map.project([point.lng, point.lat]);
        const currentPoint = { x: projected.x, y: projected.y };

        if (this.resizeState.handleIndex >= 0 && this.resizeState.type === 'vertex') {
            // Handle vertex dragging
            const newLngLat = this.map.unproject([projected.x, projected.y]);
            
            // Get all points except the last one (which is the closing point)
            let points = this.selectedShape.points.slice(0, -1);
            
            // Update the vertex being dragged
            points = points.map((p, index) => {
                if (index === this.resizeState!.handleIndex) {
                    return {
                        lng: newLngLat.lng,
                        lat: newLngLat.lat
                    };
                }
                return p;
            });

            // If we're dragging the first vertex, also update the closing point
            if (this.resizeState.handleIndex === 0) {
                this.selectedShape.points = [...points, {
                    lng: newLngLat.lng,
                    lat: newLngLat.lat
                }];
            } else {
                // Add the closing point (same as first point)
                this.selectedShape.points = [...points, { ...points[0] }];
            }
        } else if (this.resizeState.type === 'corner') {
            // Handle corner resizing
            if (!this.resizeState.bounds) return;

            const bounds = this.resizeState.bounds;
            const width = bounds.maxX - bounds.minX;
            const height = bounds.maxY - bounds.minY;

            if (width === 0 || height === 0) return;

            const deltaX = currentPoint.x - this.resizeState.startPoint.x;
            const deltaY = currentPoint.y - this.resizeState.startPoint.y;

            let scaleX = 1;
            let scaleY = 1;
            let translateX = 0;
            let translateY = 0;

            switch (this.resizeState.handleIndex) {
                case 0: // NW
                    scaleX = (width - deltaX) / width;
                    scaleY = (height - deltaY) / height;
                    translateX = deltaX;
                    translateY = deltaY;
                    break;
                case 1: // NE
                    scaleX = (width + deltaX) / width;
                    scaleY = (height - deltaY) / height;
                    translateY = deltaY;
                    break;
                case 2: // SE
                    scaleX = (width + deltaX) / width;
                    scaleY = (height + deltaY) / height;
                    break;
                case 3: // SW
                    scaleX = (width - deltaX) / width;
                    scaleY = (height + deltaY) / height;
                    translateX = deltaX;
                    break;
            }

            // Update all points including the closing point
            this.selectedShape.points = this.resizeState.originalPoints.map(p => {
                const projected = this.map.project([p.lng, p.lat]);
                const relativeX = projected.x - bounds.minX;
                const relativeY = projected.y - bounds.minY;

                const newX = bounds.minX + translateX + (relativeX * scaleX);
                const newY = bounds.minY + translateY + (relativeY * scaleY);

                const newLngLat = this.map.unproject([newX, newY]);
                return {
                    lng: newLngLat.lng,
                    lat: newLngLat.lat
                };
            });
        }

        this.emit(EVENTS.SHAPE_MOVE, {
            id: this.selectedShape.id,
            points: this.selectedShape.points
        });
    } else {
        // Handle other shapes
        this.handleShapeResize(point);
    }

    requestAnimationFrame(() => {
        this.canvasManager.redraw();
    });
  }

  private handleShapeResize(point: Point) {
    if (!this.resizeState || !this.selectedShape) return;

    // Special handling for polygons
    if (this.selectedShape.type === 'polygon') {
      const projected = this.map.project([point.lng, point.lat]);
      const newLngLat = this.map.unproject([projected.x, projected.y]);
      
      // Get all points except the last one (which is the closing point)
      let points = this.selectedShape.points.slice(0, -1);
      
      // Update the vertex being dragged
      points = points.map((p, index) => {
        if (index === this.resizeState!.handleIndex) {
          return {
            ...p,
            lng: newLngLat.lng,
            lat: newLngLat.lat
          };
        }
        return p;
      });

      // If we're dragging the first vertex, also update the closing point
      if (this.resizeState!.handleIndex === 0) {
        this.selectedShape.points = [...points, {
          ...points[0],
          lng: newLngLat.lng,
          lat: newLngLat.lat
        }];
      } else {
        // Add the closing point (same as first point)
        this.selectedShape.points = [...points, { ...points[0] }];
      }

      this.emit(EVENTS.SHAPE_MOVE, {
        id: this.selectedShape.id,
        points: this.selectedShape.points
      });
      return;
    }

    // Special handling for line-type shapes (line, arrow, dimension)
    if (['line', 'arrow', 'dimension'].includes(this.selectedShape.type)) {
      const projected = this.map.project([point.lng, point.lat]);
      const newLngLat = this.map.unproject([projected.x, projected.y]);
      
      // Update only the point being dragged
      this.selectedShape.points = this.selectedShape.points.map((p, index) => 
        index === this.resizeState!.handleIndex ? {
          ...p,
          lng: newLngLat.lng,
          lat: newLngLat.lat
        } : p
      );

      this.emit(EVENTS.SHAPE_MOVE, {
        id: this.selectedShape.id,
        points: this.selectedShape.points
      });
      return;
    }

    // Original corner resize logic for rectangles and polygons
    if (!this.resizeState.bounds) return;

    const bounds = this.resizeState.bounds;
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;

    if (width === 0 || height === 0) return;

    const deltaX = point.x - this.resizeState.startPoint.x;
    const deltaY = point.y - this.resizeState.startPoint.y;

    let scaleX = 1;
    let scaleY = 1;
    let translateX = 0;
    let translateY = 0;

    switch (this.resizeState.handleIndex) {
      case 0: // NW
        scaleX = (width - deltaX) / width;
        scaleY = (height - deltaY) / height;
        translateX = deltaX;
        translateY = deltaY;
        break;
      case 1: // NE
        scaleX = (width + deltaX) / width;
        scaleY = (height - deltaY) / height;
        translateY = deltaY;
        break;
      case 2: // SE
        scaleX = (width + deltaX) / width;
        scaleY = (height + deltaY) / height;
        break;
      case 3: // SW
        scaleX = (width - deltaX) / width;
        scaleY = (height + deltaY) / height;
        translateX = deltaX;
        break;
    }

    this.selectedShape.points = this.resizeState.originalPoints.map(p => {
      const projected = this.map.project([p.lng, p.lat]);
      const relativeX = projected.x - bounds.minX;
      const relativeY = projected.y - bounds.minY;

      const newX = bounds.minX + translateX + (relativeX * scaleX);
      const newY = bounds.minY + translateY + (relativeY * scaleY);

      const newLngLat = this.map.unproject([newX, newY]);
      return {
        ...p,
        lng: newLngLat.lng,
        lat: newLngLat.lat
      };
    });

    this.emit(EVENTS.SHAPE_MOVE, {
      id: this.selectedShape.id,
      points: this.selectedShape.points
    });
  }

  private getClickedHandle(point: { x: number; y: number }, bounds: any): { index: number; type?: 'corner' | 'endpoint' | 'vertex' | 'rotate' } | null {
    // First check for vertex handles if it's a polygon
    if (this.selectedShape?.type === 'polygon') {
        const projectedPoints = this.selectedShape.points.map(p => {
            const projected = this.map.project([p.lng, p.lat]);
            return { x: projected.x, y: projected.y };
        });

        // Check all vertices except the last one (which is the same as first for polygons)
        for (let i = 0; i < projectedPoints.length - 1; i++) {
            if (this.selectionBox.isHandleHit(point, projectedPoints[i])) {
                return { index: i, type: 'vertex' };
            }
        }
    }

    // Then check corner handles
    const padding = 10;
    const handles = [
        { x: bounds.minX - padding, y: bounds.minY - padding }, // NW
        { x: bounds.maxX + padding, y: bounds.minY - padding }, // NE
        { x: bounds.maxX + padding, y: bounds.maxY + padding }, // SE
        { x: bounds.minX - padding, y: bounds.maxY + padding }  // SW
    ];

    const hitDistance = 16;
    for (let i = 0; i < handles.length; i++) {
        const distance = Math.hypot(point.x - handles[i].x, point.y - handles[i].y);
        if (distance <= hitDistance) {
            return { index: i, type: 'corner' };
        }
    }

    return null;
  }

  public setSelectedShape(shape: DrawnLine | null) {
    this.selectedShape = shape;
    const canvas = this.canvasManager.getCanvas();
    canvas.style.cursor = shape ? 'move' : 'default';

    requestAnimationFrame(() => {
      this.canvasManager.redraw();
    });
  }

  public updateSelectedShapeStyle(style: { lineColor?: string; fillColor?: string; thickness?: number }) {
    if (!this.selectedShape) return;

    const updates: any = {};
    if (style.lineColor !== undefined) updates.color = style.lineColor;
    if (style.fillColor !== undefined) updates.fillColor = style.fillColor;
    if (style.thickness !== undefined) updates.thickness = style.thickness;

    this.emit(EVENTS.SHAPE_UPDATE, {
      id: this.selectedShape.id,
      ...updates
    });

    requestAnimationFrame(() => {
      this.canvasManager.redraw();
    });
  }

  redraw() {
    if (!this.selectedShape) return;

    // First render the shape itself
    this.canvasManager.getRenderManager().renderShape(this.selectedShape);

    // Then draw the selection UI
    const ctx = this.canvasManager.getContext();
    ctx.save();

    if (this.selectedShape.type === 'text') {
      // Calculate text bounds
      const bounds = calculateTextBounds(
        this.selectedShape.points[0],
        this.selectedShape.text || '',
        this.selectedShape.size || 16,
        this.map,
        ctx
      );

      // Draw dashed selection box
      ctx.strokeStyle = '#1E3A8A';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      
      const padding = 8; // Add some padding around the text
      ctx.strokeRect(
        bounds.minX - padding,
        bounds.minY - padding,
        bounds.maxX - bounds.minX + padding * 2,
        bounds.maxY - bounds.minY + padding * 2
      );

      // Draw resize handles at corners
      ctx.setLineDash([]);
      const handles = [
        { x: bounds.minX - padding, y: bounds.minY - padding }, // NW
        { x: bounds.maxX + padding, y: bounds.minY - padding }, // NE
        { x: bounds.maxX + padding, y: bounds.maxY + padding }, // SE
        { x: bounds.minX - padding, y: bounds.maxY + padding }  // SW
      ];

      handles.forEach(point => {
        this.selectionBox.drawHandle(point.x, point.y);
      });
    } else if (this.selectedShape.type === 'sign') {
      // Existing sign selection code
      const point = this.selectedShape.points[0];
      const size = this.selectedShape.signData?.size || 64;
      const bounds = calculateSignBounds(point, size, this.map);
      this.selectionBox.drawBox(bounds, undefined, this.selectedShape.type);
    } else if (['line', 'arrow', 'dimension'].includes(this.selectedShape.type)) {
      // Existing line selection code
      const projectedPoints = this.selectedShape.points.map(p => {
        const projected = this.map.project([p.lng, p.lat]);
        return { x: projected.x, y: projected.y };
      });
      
      const bounds = this.calculateBounds(projectedPoints);
      this.selectionBox.drawBox(bounds, projectedPoints, this.selectedShape.type);
    } else if (['rectangle', 'polygon'].includes(this.selectedShape.type)) {
      const projectedPoints = this.selectedShape.points.map(p => {
        const projected = this.map.project([p.lng, p.lat]);
        return { x: projected.x, y: projected.y };
      });
      
      const bounds = this.calculateBounds(projectedPoints);
      this.selectionBox.drawBox(bounds, projectedPoints, this.selectedShape.type);
    }

    ctx.restore();
  }

  private calculateBounds(points: { x: number; y: number }[]) {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    return {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys)
    };
  }
}