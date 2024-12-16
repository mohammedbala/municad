export function calculateTextBounds(
  point: { lng: number; lat: number },
  text: string,
  fontSize: number,
  map: mapboxgl.Map,
  ctx: CanvasRenderingContext2D
) {
  const projected = map.project([point.lng, point.lat]);
  
  // Set the font to measure text accurately
  ctx.save();
  ctx.font = `${fontSize}px Arial`;
  const metrics = ctx.measureText(text);
  ctx.restore();

  // Calculate text bounds with padding
  const padding = fontSize / 2;
  const width = metrics.width;
  const height = fontSize;

  return {
    minX: projected.x - width / 2 - padding,
    minY: projected.y - height / 2 - padding,
    maxX: projected.x + width / 2 + padding,
    maxY: projected.y + height / 2 + padding
  };
}