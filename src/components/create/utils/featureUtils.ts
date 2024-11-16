export function updateFeatureCoordinates(feature: any, deltaLng: number, deltaLat: number) {
  if (feature.geometry.type === 'Point') {
    return {
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: [
          feature.geometry.coordinates[0] + deltaLng,
          feature.geometry.coordinates[1] + deltaLat
        ]
      }
    };
  } else if (feature.geometry.type === 'LineString') {
    return {
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: feature.geometry.coordinates.map(([lng, lat]: [number, number]) => [
          lng + deltaLng,
          lat + deltaLat
        ])
      }
    };
  } else if (feature.geometry.type === 'Polygon') {
    return {
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: feature.geometry.coordinates.map((ring: [number, number][]) =>
          ring.map(([lng, lat]) => [lng + deltaLng, lat + deltaLat])
        )
      }
    };
  }
  return feature;
}