import { Point } from '../types';
import { Map as MapboxMap } from 'mapbox-gl';

export const MIN_SIGN_SIZE = 32;
export const MAX_SIGN_SIZE = 256;
export const DEFAULT_SIGN_SIZE = 64;

export function calculateSignBounds(signPoint: Point, size: number, map: MapboxMap) {
  const projected = map.project([signPoint.lng, signPoint.lat]);
  const halfSize = size / 2;
  return {
    minX: projected.x - halfSize,
    minY: projected.y - halfSize,
    maxX: projected.x + halfSize,
    maxY: projected.y + halfSize
  };
}

export function calculateNewSignSize(
  originalSize: number,
  startPoint: Point,
  currentPoint: Point,
  handleIndex: number
): number {
  const deltaX = currentPoint.x - startPoint.x;
  const deltaY = currentPoint.y - startPoint.y;
  
  // Calculate scale based on diagonal movement
  const diagonal = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  let scaleFactor = 1;
  
  // Adjust scale factor based on handle position and movement direction
  switch (handleIndex) {
    case 0: // NW
    case 3: // SW
      scaleFactor = deltaX < 0 ? 1 + diagonal / 100 : 1 - diagonal / 100;
      break;
    case 1: // NE
    case 2: // SE
      scaleFactor = deltaX > 0 ? 1 + diagonal / 100 : 1 - diagonal / 100;
      break;
  }

  // Calculate new size and clamp between min and max
  const newSize = originalSize * scaleFactor;
  return Math.max(MIN_SIGN_SIZE, Math.min(MAX_SIGN_SIZE, newSize));
}

export function isPointInSignBounds(point: Point, signPoint: Point, size: number, map: MapboxMap): boolean {
  const bounds = calculateSignBounds(signPoint, size, map);
  return (
    point.x >= bounds.minX &&
    point.x <= bounds.maxX &&
    point.y >= bounds.minY &&
    point.y <= bounds.maxY
  );
}