import React from 'react';
import Map, { Source, Layer } from 'react-map-gl';
import { useFeatureDrag } from './hooks/useFeatureDrag';
import { updateFeatureCoordinates } from './utils/featureUtils';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapContainerProps {
  viewState: any;
  onMove: (evt: any) => void;
  selectedTool: string | null;
  selectedFeatureId: string | null;
  drawingFeatures: any;
  textFeatures: any;
  previewFeature: any;
  onMapClick: (event: any) => void;
  onUpdateFeatures: (type: string, features: any) => void;
  layerStyles: {
    lineLayer: any;
    fillLayer: any;
    textLayer: any;
    previewLineLayer: any;
    previewFillLayer: any;
    selectedFeatureLayer: any;
  };
}

export function MapContainer({
  viewState,
  onMove,
  selectedTool,
  selectedFeatureId,
  drawingFeatures,
  textFeatures,
  previewFeature,
  onMapClick,
  onUpdateFeatures,
  layerStyles
}: MapContainerProps) {
  const updateFeatures = React.useCallback((featureId: string, deltaLng: number, deltaLat: number) => {
    // Update drawing features
    const drawingFeature = drawingFeatures.features.find(
      (f: any) => f.properties.id === featureId
    );
    if (drawingFeature) {
      onUpdateFeatures('drawing', {
        ...drawingFeatures,
        features: drawingFeatures.features.map((feature: any) =>
          feature.properties.id === featureId
            ? updateFeatureCoordinates(feature, deltaLng, deltaLat)
            : feature
        )
      });
      return;
    }

    // Update text features
    const textFeature = textFeatures.features.find(
      (f: any) => f.properties.id === featureId
    );
    if (textFeature) {
      onUpdateFeatures('text', {
        ...textFeatures,
        features: textFeatures.features.map((feature: any) =>
          feature.properties.id === featureId
            ? updateFeatureCoordinates(feature, deltaLng, deltaLat)
            : feature
        )
      });
    }
  }, [drawingFeatures, textFeatures, onUpdateFeatures]);

  const {
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  } = useFeatureDrag(selectedFeatureId, selectedTool, updateFeatures);

  const handleClick = React.useCallback((event: any) => {
    if (!isDragging) {
      onMapClick(event);
    }
  }, [isDragging, onMapClick]);

  // Determine if map interactions should be disabled
  const isInteractionDisabled = isDragging || selectedFeatureId;

  return (
    <Map
      {...viewState}
      onMove={onMove}
      style={{ width: '100%', height: 'calc(100% - 120px)' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      dragPan={!isInteractionDisabled}
      dragRotate={!isInteractionDisabled}
      scrollZoom={!isInteractionDisabled}
      doubleClickZoom={!isInteractionDisabled}
      touchZoom={!isInteractionDisabled}
      touchRotate={!isInteractionDisabled}
      keyboard={!isInteractionDisabled}
      cursor={
        isDragging ? 'grabbing' :
        selectedTool ? 'crosshair' :
        selectedFeatureId ? 'move' : 'grab'
      }
      interactiveLayerIds={['lines', 'fills', 'text-labels']}
    >
      <Source type="geojson" data={drawingFeatures}>
        <Layer {...layerStyles.lineLayer} />
        <Layer {...layerStyles.fillLayer} />
      </Source>

      {previewFeature && (
        <Source type="geojson" data={previewFeature}>
          <Layer {...layerStyles.previewLineLayer} />
          {selectedTool === 'rectangle' && (
            <Layer {...layerStyles.previewFillLayer} />
          )}
        </Source>
      )}

      <Source type="geojson" data={textFeatures}>
        <Layer {...layerStyles.textLayer} />
      </Source>

      {selectedFeatureId && (
        <Source
          id="selected-feature-source"
          type="geojson"
          data={{
            type: 'FeatureCollection',
            features: [
              ...drawingFeatures.features.filter(
                (feature: any) => feature.properties.id === selectedFeatureId
              ),
              ...textFeatures.features.filter(
                (feature: any) => feature.properties.id === selectedFeatureId
              )
            ]
          }}
        >
          <Layer {...layerStyles.selectedFeatureLayer} />
        </Source>
      )}
    </Map>
  );
}</content>