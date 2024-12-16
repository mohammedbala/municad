import { Point, DrawnLine } from '../types';
import { Map as MapboxMap } from 'mapbox-gl';

export interface NearbyShape {
  id: string;
  type: string;
  distance: number;
}

const DEFAULT_SIGN_SIZE = 64;

export function findNearbyShapes(
  point: Point,
  shapes: DrawnLine[],
  map: MapboxMap,
  maxDistance: number = 10
): NearbyShape[] {
  const nearby: NearbyShape[] = [];
  const clickPoint = map.project([point.lng, point.lat]);

  shapes.forEach(shape => {
    const distance = getDistanceToShape(clickPoint, shape, map);
    if (distance <= maxDistance) {
      nearby.push({
        id: shape.id,
        type: shape.type,
        distance
      });
    }
  });

  nearby.sort((a, b) => a.distance - b.distance);
  return nearby;
}

function getDistanceToShape(
  point: { x: number; y: number },
  shape: DrawnLine,
  map: MapboxMap
): number {
  const projectedPoints = shape.points.map(p => map.project([p.lng, p.lat]));

  switch (shape.type) {
    case 'line':
    case 'arrow':
    case 'dimension':
      return getDistanceToLine(point, projectedPoints);
    
    case 'rectangle':
    case 'polygon':
      return getDistanceToPolygon(point, projectedPoints);
    
    case 'text':
      return getDistanceToText(point, projectedPoints[0], shape.size || 16);
    
    case 'sign':
      return getDistanceToSign(point, projectedPoints[0], shape.signData?.size || DEFAULT_SIGN_SIZE);

    default:
      console.warn(`Unknown shape type: ${shape.type}`);
      return Infinity;
  }
}

function getDistanceToText(
  point: { x: number; y: number },
  textPoint: { x: number; y: number },
  fontSize: number
): number {
  const boxSize = fontSize * 1.5;
  const halfSize = boxSize / 2;

  if (
    point.x >= textPoint.x - halfSize &&
    point.x <= textPoint.x + halfSize &&
    point.y >= textPoint.y - halfSize &&
    point.y <= textPoint.y + halfSize
  ) {
    return 0;
  }

  return Math.sqrt(
    Math.pow(point.x - textPoint.x, 2) + 
    Math.pow(point.y - textPoint.y, 2)
  );
}

function getDistanceToSign(
  point: { x: number; y: number },
  signPoint: { x: number; y: number },
  signSize: number = DEFAULT_SIGN_SIZE
): number {
  const halfSize = signSize / 2;

  if (
    point.x >= signPoint.x - halfSize &&
    point.x <= signPoint.x + halfSize &&
    point.y >= signPoint.y - halfSize &&
    point.y <= signPoint.y + halfSize
  ) {
    return 0;
  }

  return Math.sqrt(
    Math.pow(point.x - signPoint.x, 2) + 
    Math.pow(point.y - signPoint.y, 2)
  );
}

function getDistanceToLine(
  point: { x: number; y: number },
  linePoints: { x: number; y: number }[]
): number {
  let minDistance = Infinity;

  for (let i = 0; i < linePoints.length - 1; i++) {
    const start = linePoints[i];
    const end = linePoints[i + 1];
    const distance = distanceToLineSegment(point, start, end);
    minDistance = Math.min(minDistance, distance);
  }

  return minDistance;
}

function getDistanceToPolygon(
  point: { x: number; y: number },
  polygonPoints: { x: number; y: number }[]
): number {
  if (isPointInPolygon(point, polygonPoints)) {
    return 0;
  }
  return getDistanceToLine(point, polygonPoints);
}

function distanceToLineSegment(
  point: { x: number; y: number },
  start: { x: number; y: number },
  end: { x: number; y: number }
): number {
  const A = point.x - start.x;
  const B = point.y - start.y;
  const C = end.x - start.x;
  const D = end.y - start.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy;

  if (param < 0) {
    xx = start.x;
    yy = start.y;
  } else if (param > 1) {
    xx = end.x;
    yy = end.y;
  } else {
    xx = start.x + param * C;
    yy = start.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;

  return Math.sqrt(dx * dx + dy * dy);
}

function isPointInPolygon(
  point: { x: number; y: number },
  polygonPoints: { x: number; y: number }[]
): boolean {
  let inside = false;
  
  for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
    const xi = polygonPoints[i].x;
    const yi = polygonPoints[i].y;
    const xj = polygonPoints[j].x;
    const yj = polygonPoints[j].y;

    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
      
    if (intersect) inside = !inside;
  }

  return inside;
}