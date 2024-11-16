import React, { useState } from 'react';
import Map, { Source, Layer, Marker } from 'react-map-gl';
import { TrafficSign } from './trafficSigns';
import { TextLabel } from './types';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapInteractionHandlerProps {
  viewState: any;
  onMove: (evt: any) => void;
  mapRef: React.RefObject<mapboxgl.Map>;
  drawRef: React.RefObject<any>;
  selectedTool: string | null;
  onMapClick: (e: any) => void;
  signMarkers: Array<{
    id: string;
    sign: TrafficSign;
    lngLat: { lng: number; lat: number };
  }>;
  selectedMarker: string | null;
  onMarkerClick: (id: string) => void;
  textLabels: TextLabel[];
  selectedTextId: string | null;
  onTextSelect: (id: string | null) => void;
  onTextDrag: (id: string, lng: number, lat: number) => void;
  onTextDoubleClick: (label: TextLabel) => void;
  mapboxToken: string;
  onLoad: (event: any) => void;
}

export function MapInteractionHandler({
  viewState,
  onMove,
  mapRef,
  drawRef,
  selectedTool,
  onMapClick,
  signMarkers,
  selectedMarker,
  onMarkerClick,
  textLabels,
  selectedTextId,
  onTextSelect,
  onTextDrag,
  onTextDoubleClick,
  mapboxToken,
  onLoad
}: MapInteractionHandlerProps) {
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: any) => {
    if (selectedTextId) {
      setIsDraggingText(true);
      setDragStart({ x: e.lngLat.lng, y: e.lngLat.lat });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: any) => {
    if (isDraggingText && dragStart && selectedTextId) {
      const deltaX = e.lngLat.lng - dragStart.x;
      const deltaY = e.lngLat.lat - dragStart.y;
      
      const label = textLabels.find(l => l.id === selectedTextId);
      if (label) {
        onTextDrag(
          selectedTextId,
          label.coordinates[0] + deltaX,
          label.coordinates[1] + deltaY
        );
      }
      
      setDragStart({ x: e.lngLat.lng, y: e.lngLat.lat });
    }
  };

  const handleMouseUp = () => {
    if (isDraggingText) {
      setIsDraggingText(false);
      setDragStart(null);
    }
  };

  const handleClick = (e: any) => {
    if (!isDraggingText) {
      const features = mapRef.current?.queryRenderedFeatures(e.point, {
        layers: ['text-labels-layer']
      });

      if (features && features.length > 0) {
        onTextSelect(features[0].properties?.id || null);
      } else {
        onTextSelect(null);
        onMapClick(e);
      }
    }
  };

  const handleDblClick = (e: any) => {
    const features = mapRef.current?.queryRenderedFeatures(e.point, {
      layers: ['text-labels-layer']
    });

    if (features && features.length > 0) {
      const feature = features[0];
      const label = textLabels.find(l => l.id === feature.properties?.id);
      if (label) {
        e.preventDefault(); // Prevent map zoom
        onTextDoubleClick(label);
      }
    }
  };

  // Calculate selection box coordinates for selected text
  const selectionBoxData = {
    type: 'FeatureCollection',
    features: selectedTextId ? [{
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[]]
      },
      properties: {}
    }] : []
  };

  if (selectedTextId) {
    const selectedLabel = textLabels.find(l => l.id === selectedTextId);
    if (selectedLabel) {
      const padding = 0.00005; // Adjust this value to change box size
      const [lng, lat] = selectedLabel.coordinates;
      selectionBoxData.features[0].geometry.coordinates[0] = [
        [lng - padding, lat - padding],
        [lng + padding, lat - padding],
        [lng + padding, lat + padding],
        [lng - padding, lat + padding],
        [lng - padding, lat - padding]
      ];
    }
  }

  return (
    <Map
      {...viewState}
      onMove={onMove}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={mapboxToken}
      onLoad={onLoad}
      onClick={handleClick}
      onDblClick={handleDblClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      interactiveLayerIds={['text-labels-layer', 'gl-draw-polygon-fill-inactive.cold']}
      cursor={
        isDraggingText ? 'grabbing' :
        selectedTextId ? 'grab' :
        selectedTool === 'text' ? 'text' : 'default'
      }
    >
      {signMarkers.map((marker) => (
        <Marker
          key={marker.id}
          longitude={marker.lngLat.lng}
          latitude={marker.lngLat.lat}
          onClick={() => onMarkerClick(marker.id)}
        >
          <img
            src={marker.sign.url}
            alt={marker.sign.name}
            className={`w-8 h-8 cursor-pointer ${
              selectedMarker === marker.id ? 'ring-2 ring-blue-500' : ''
            }`}
          />
        </Marker>
      ))}

      {/* Selection box for selected text */}
      <Source
        id="text-selection-box"
        type="geojson"
        data={selectionBoxData}
      >
        <Layer
          id="text-selection-box-layer"
          type="line"
          paint={{
            'line-color': '#666666',
            'line-width': 1,
            'line-dasharray': [2, 2]
          }}
        />
      </Source>

      <Source
        id="text-labels"
        type="geojson"
        data={{
          type: 'FeatureCollection',
          features: textLabels.map(label => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: label.coordinates
            },
            properties: {
              id: label.id,
              text: label.text,
              size: label.size,
              color: label.color
            }
          }))
        }}
      >
        <Layer
          id="text-labels-layer"
          type="symbol"
          layout={{
            'text-field': ['get', 'text'],
            'text-size': ['get', 'size'],
            'text-allow-overlap': true,
            'text-ignore-placement': true
          }}
          paint={{
            'text-color': ['get', 'color'],
            'text-halo-color': '#ffffff',
            'text-halo-width': 2
          }}
        />
      </Source>
    </Map>
  );
}