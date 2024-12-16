import { Point } from '../types';

export function drawHandle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number = 8,
  style = {
    fillColor: '#ffffff',
    strokeColor: '#2196F3',
    lineWidth: 2
  }
) {
  ctx.save();
  ctx.fillStyle = style.fillColor;
  ctx.strokeStyle = style.strokeColor;
  ctx.lineWidth = style.lineWidth;

  ctx.beginPath();
  ctx.rect(x - size / 2, y - size / 2, size, size);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

export function drawSelectionBox(
  ctx: CanvasRenderingContext2D,
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
  options = {
    padding: 10,
    handleSize: 8,
    color: '#2196F3',
    width: 2,
    dashed: true
  }
) {
  ctx.save();
  
  // Draw selection rectangle
  ctx.strokeStyle = options.color;
  ctx.lineWidth = options.width;
  if (options.dashed) {
    ctx.setLineDash([5, 5]);
  }
  
  ctx.strokeRect(
    bounds.minX - options.padding,
    bounds.minY - options.padding,
    bounds.maxX - bounds.minX + options.padding * 2,
    bounds.maxY - bounds.minY + options.padding * 2
  );

  // Draw resize handles
  ctx.setLineDash([]);
  const handles = [
    { x: bounds.minX - options.padding, y: bounds.minY - options.padding }, // NW
    { x: bounds.maxX + options.padding, y: bounds.minY - options.padding }, // NE
    { x: bounds.maxX + options.padding, y: bounds.maxY + options.padding }, // SE
    { x: bounds.minX - options.padding, y: bounds.maxY + options.padding }  // SW
  ];

  handles.forEach(handle => {
    drawHandle(ctx, handle.x, handle.y, options.handleSize);
  });

  ctx.restore();
}

export function isPointNearLine(
  point: Point,
  start: Point,
  end: Point,
  threshold: number = 5
): boolean {
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
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance <= threshold;
}