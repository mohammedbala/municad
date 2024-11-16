export function getDrawStyles(lineColor: string, fillColor: string) {
  return [
    {
      'id': 'gl-draw-polygon-fill-inactive',
      'type': 'fill',
      'filter': ['all',
        ['==', 'active', 'false'],
        ['==', '$type', 'Polygon'],
        ['!=', 'mode', 'static']
      ],
      'paint': {
        'fill-color': ['coalesce', ['get', 'fillColor'], fillColor],
        'fill-opacity': 0.3
      }
    },
    {
      'id': 'gl-draw-polygon-fill-active',
      'type': 'fill',
      'filter': ['all',
        ['==', 'active', 'true'],
        ['==', '$type', 'Polygon']
      ],
      'paint': {
        'fill-color': ['coalesce', ['get', 'fillColor'], fillColor],
        'fill-opacity': 0.5
      }
    },
    {
      'id': 'gl-draw-polygon-stroke-inactive',
      'type': 'line',
      'filter': ['all',
        ['==', 'active', 'false'],
        ['==', '$type', 'Polygon'],
        ['!=', 'mode', 'static']
      ],
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': ['coalesce', ['get', 'color'], lineColor],
        'line-width': 2
      }
    },
    {
      'id': 'gl-draw-polygon-stroke-active',
      'type': 'line',
      'filter': ['all',
        ['==', 'active', 'true'],
        ['==', '$type', 'Polygon']
      ],
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': ['coalesce', ['get', 'color'], lineColor],
        'line-width': 3
      }
    },
    {
      'id': 'gl-draw-line-inactive',
      'type': 'line',
      'filter': ['all',
        ['==', 'active', 'false'],
        ['==', '$type', 'LineString'],
        ['!=', 'mode', 'static']
      ],
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': ['coalesce', ['get', 'color'], lineColor],
        'line-width': 2
      }
    },
    {
      'id': 'gl-draw-line-active',
      'type': 'line',
      'filter': ['all',
        ['==', 'active', 'true'],
        ['==', '$type', 'LineString']
      ],
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': ['coalesce', ['get', 'color'], lineColor],
        'line-width': 3
      }
    },
    {
      'id': 'gl-draw-polygon-and-line-vertex-inactive',
      'type': 'circle',
      'filter': ['all',
        ['==', 'meta', 'vertex'],
        ['!=', 'mode', 'static']
      ],
      'paint': {
        'circle-radius': 5,
        'circle-color': '#fff',
        'circle-stroke-color': ['coalesce', ['get', 'color'], lineColor],
        'circle-stroke-width': 2
      }
    },
    {
      'id': 'gl-draw-polygon-and-line-vertex-active',
      'type': 'circle',
      'filter': ['all',
        ['==', 'meta', 'vertex'],
        ['==', 'active', 'true']
      ],
      'paint': {
        'circle-radius': 7,
        'circle-color': '#fff',
        'circle-stroke-color': ['coalesce', ['get', 'color'], lineColor],
        'circle-stroke-width': 3
      }
    },
    {
      'id': 'gl-draw-polygon-midpoint',
      'type': 'circle',
      'filter': ['all',
        ['==', 'meta', 'midpoint']
      ],
      'paint': {
        'circle-radius': 4,
        'circle-color': '#fff',
        'circle-stroke-color': ['coalesce', ['get', 'color'], lineColor],
        'circle-stroke-width': 2
      }
    }
  ];
}