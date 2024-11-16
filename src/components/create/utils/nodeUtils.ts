import { Feature, Position } from 'geojson';

export interface NodeFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: Position;
  };
}

export function getFeatureNodes(feature: Feature): Position[] {
  if (!feature.geometry) return [];

  switch (feature.geometry.type) {
    case 'LineString':
      const coords = feature.geometry.coordinates;
      return coords.length >= 2 ? [coords[0], coords[coords.length - 1]] : [];

    case 'Polygon':
      const ringCoords = feature.geometry.coordinates[0];
      return ringCoords.length >= 4 ? [ringCoords[0], ...ringCoords.slice(1, -1)] : [];

    case 'Point':
      return [feature.geometry.coordinates];

    default:
      return [];
  }
}

export function createNodeFeatureCollection(coordinates: Position[]) {
  return {
    type: 'FeatureCollection',
    features: coordinates.map(coord => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: coord
      }
    }))
  };
}

export function updateMapNodes(
  map: mapboxgl.Map,
  nodeFeatureCollection: any,
  options = {
    radius: 5,
    color: '#888888',
    strokeWidth: 2,
    strokeColor: '#ffffff'
  }
) {
  // Handle the source
  if (map.getSource('selected-nodes-source')) {
    (map.getSource('selected-nodes-source') as mapboxgl.GeoJSONSource).setData(nodeFeatureCollection);
  } else {
    map.addSource('selected-nodes-source', {
      type: 'geojson',
      data: nodeFeatureCollection
    });
  }

  // Handle the layer
  if (!map.getLayer('selected-nodes-layer')) {
    map.addLayer({
      id: 'selected-nodes-layer',
      type: 'circle',
      source: 'selected-nodes-source',
      paint: {
        'circle-radius': options.radius,
        'circle-color': options.color,
        'circle-stroke-width': options.strokeWidth,
        'circle-stroke-color': options.strokeColor
      }
    });
  }
}

export function removeMapNodes(map: mapboxgl.Map) {
  if (map.getLayer('selected-nodes-layer')) {
    map.removeLayer('selected-nodes-layer');
  }
  if (map.getSource('selected-nodes-source')) {
    map.removeSource('selected-nodes-source');
  }
}