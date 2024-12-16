import { CanvasManager } from './CanvasManager';
import { RenderManager } from './RenderManager';
import { Point, DrawnLine } from '../types';

export {
  CanvasManager,
  RenderManager,
  type Point,
  type DrawnLine
};

// Canvas-related constants
export const DEFAULT_SIGN_SIZE = 64;
export const MIN_SIGN_SIZE = 32;
export const MAX_SIGN_SIZE = 256;

// Canvas utility functions
export function getMapPoint(
  e: MouseEvent,
  canvas: HTMLCanvasElement,
  map: mapboxgl.Map
): Point | null {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const lngLat = map.unproject([x, y]);

  return {
    lng: lngLat.lng,
    lat: lngLat.lat,
    x,
    y
  };
}

export function calculateBounds(points: Point[], map: mapboxgl.Map) {
  const projectedPoints = points.map(p => map.project([p.lng, p.lat]));
  const xs = projectedPoints.map(p => p.x);
  const ys = projectedPoints.map(p => p.y);

  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys)
  };
}

export function isPointInBounds(
  point: Point,
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
  map: mapboxgl.Map
): boolean {
  const projected = map.project([point.lng, point.lat]);
  return (
    projected.x >= bounds.minX &&
    projected.x <= bounds.maxX &&
    projected.y >= bounds.minY &&
    projected.y <= bounds.maxY
  );
}