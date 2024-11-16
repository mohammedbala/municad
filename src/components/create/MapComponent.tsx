import React from 'react';
import Map, { Source, Layer } from 'react-map-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapComponentProps {
  viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  onMove: (evt: any) => void;
  onClick: (event: any) => void;
  onMapLoad: (map: mapboxgl.Map) => void;
  textFeatures: any;
  mapboxToken: string;
}

export function MapComponent({
  viewState,
  onMove,
  onClick,
  onMapLoad,
  textFeatures,
  mapboxToken
}: MapComponentProps) {
  return (
    <Map
      {...viewState}
      onMove={onMove}
      style={{ width: '100%', height: 'calc(100% - 120px)' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={mapboxToken}
      onClick={onClick}
      onLoad={(evt) => onMapLoad(evt.target)}
      interactive={true}
    >
      <Source type="geojson" data={textFeatures}>
        <Layer
          id="text-labels"
          type="symbol"
          layout={{
            'text-field': ['get', 'text'],
            'text-size': ['get', 'size'],
            'text-allow-overlap': true,
            'text-ignore-placement': true,
            'text-anchor': 'center'
          }}
          paint={{
            'text-color': ['get', 'color']
          }}
        />
      </Source>
    </Map>
  );
}