import React, { useRef, useState, useEffect } from 'react';
import Map, { 
  ViewState, 
  NavigationControl,
  FullscreenControl,
  ScaleControl
} from 'react-map-gl';
import { CanvasManager } from './canvas/CanvasManager';
import { eventManager, EVENTS } from './tools/EventManager';
import { Point, DrawnLine } from './types';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoibW9iYWxhIiwiYSI6ImNsN2MzdnUyczBja3YzcnBoMmttczNrNmUifQ.EuKfnG_-CrRpAGHPMcC93w';

export const MAP_STYLES = {
  STREETS: 'mapbox://styles/mapbox/streets-v12',
  SATELLITE: 'mapbox://styles/mapbox/satellite-streets-v12'
};

interface MapProps {
  viewState: ViewState;
  onViewStateChange: (viewState: ViewState) => void;
  selectedTool: string | null;
  lineColor: string;
  fillColor: string;
  fontColor: string;
  lineThickness: number;
  onShapeComplete: (type: string, points: Point[], additionalData?: any,) => void;
  onShapeSelect: (id: string | null) => void;
  onShapeUpdate: (shape: DrawnLine) => void;
  drawnLines: DrawnLine[];
  selectedLineId: string | null;
  onMapLoad?: (map: mapboxgl.Map) => void;
  mapStyle?: string;
  onMapStyleChange?: (style: string) => void;
}

export function MapComponent({
  viewState,
  onViewStateChange,
  selectedTool,
  lineColor,
  fillColor,
  fontColor,
  lineThickness,
  onShapeComplete,
  onShapeSelect,
  onShapeUpdate,
  drawnLines,
  selectedLineId,
  onMapLoad,
  mapStyle = MAP_STYLES.STREETS,
  onMapStyleChange = () => {}
}: MapProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasManager, setCanvasManager] = useState<CanvasManager | null>(null);
  const [clickCoordinates, setClickCoordinates] = useState<Point | null>(null);

  // Initialize canvas manager
  useEffect(() => {
    if (!mapRef.current || !canvasRef.current) return;

    const manager = new CanvasManager(canvasRef.current, mapRef.current);
    setCanvasManager(manager);

    const handleShapeComplete = (shape: any) => {
      console.log('Map: Received shape complete event:', shape); // Debug log
      
      // Preserve all shape data when calling onShapeComplete
      onShapeComplete(
        shape.type,
        shape.points,
        shape.additionalData
      );
    };

    const handleSelectionChange = (data: { point: Point; selectedShape: DrawnLine | null }) => {
      onShapeSelect(data.selectedShape?.id || null);
    };

    const handleShapeMove = (data: { id: string; points: Point[] }) => {
      const updatedShape = drawnLines.find(line => line.id === data.id);
      if (updatedShape) {
        onShapeUpdate({
          ...updatedShape,
          points: data.points
        });
      }
    };

    eventManager.on(EVENTS.SHAPE_COMPLETE, handleShapeComplete);
    eventManager.on(EVENTS.SELECTION_CHANGE, handleSelectionChange);
    eventManager.on(EVENTS.SHAPE_MOVE, handleShapeMove);

    return () => {
      manager.cleanup();
      eventManager.off(EVENTS.SHAPE_COMPLETE, handleShapeComplete);
      eventManager.off(EVENTS.SELECTION_CHANGE, handleSelectionChange);
      eventManager.off(EVENTS.SHAPE_MOVE, handleShapeMove);
    };
  }, [mapRef.current]);

  // Update active tool
  useEffect(() => {
    if (!canvasManager) return;
    canvasManager.toolManager.setActiveTool(selectedTool || 'select');
  }, [selectedTool, canvasManager]);

  // Update tool styles
  useEffect(() => {
    if (!canvasManager) return;
    canvasManager.toolManager.updateStyle({ 
      lineColor, 
      fillColor, 
      fontColor, 
      thickness: lineThickness 
    });
  }, [lineColor, fillColor, fontColor, lineThickness, canvasManager]);

  // Update shapes and handle map events
  useEffect(() => {
    if (!canvasManager || !mapRef.current) return;
    canvasManager.getRenderManager().setShapes(drawnLines, selectedLineId);

    const map = mapRef.current;
    const handleMapChange = () => {
      canvasManager.getRenderManager().setShapes(drawnLines, selectedLineId);
    };

    map.on('move', handleMapChange);
    map.on('zoom', handleMapChange);
    map.on('rotate', handleMapChange);
    map.on('pitch', handleMapChange);

    return () => {
      map.off('move', handleMapChange);
      map.off('zoom', handleMapChange);
      map.off('rotate', handleMapChange);
      map.off('pitch', handleMapChange);
    };
  }, [drawnLines, selectedLineId, canvasManager, mapRef.current]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!mapRef.current || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const lngLat = mapRef.current.unproject([x, y]);
    
    const point: Point = {
      lng: lngLat.lng,
      lat: lngLat.lat,
      x,
      y
    };

    setClickCoordinates(point);
  };

  // Set map reference when map loads
  const handleMapLoad = (evt: { target: mapboxgl.Map }) => {
    mapRef.current = evt.target;
    if (onMapLoad) {
      onMapLoad(evt.target);
    }
  };

  // Add this effect to add building layer when map loads
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Wait for the map style to load
    map.on('style.load', () => {
      // Add 3D buildings layer
      map.addLayer({
        'id': 'building-outlines',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'line',
        'paint': {
          'line-color': '#2563eb', // Blue color for building outlines
          'line-width': 1,
          'line-opacity': 0.8
        }
      });
    });

    return () => {
      if (map.getLayer('building-outlines')) {
        map.removeLayer('building-outlines');
      }
    };
  }, [mapRef.current]);

  return (
    <div className="relative w-full h-full">
      <Map
        {...viewState}
        onMove={evt => onViewStateChange(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        onLoad={handleMapLoad}
        dragPan={selectedTool === 'pan'}
        preserveDrawingBuffer={true}
        renderWorldCopies={false}
      >
        <NavigationControl 
          showCompass={true}
          showZoom={true}
          position="top-right"
        />
      </Map>
      
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-auto"
        style={{ 
          cursor: selectedTool === 'pan' ? 'grab' : 
                 selectedTool === 'text' ? 'text' :
                 selectedTool === 'select' ? 'default' :
                 selectedTool ? 'crosshair' : 'default',
          pointerEvents: selectedTool === 'pan' ? 'none' : 'auto',
          zIndex: 1
        }}
        onClick={handleCanvasClick}
      />
      {clickCoordinates && (
        <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow text-sm font-mono">
          Lng: {clickCoordinates.lng.toFixed(6)}<br />
          Lat: {clickCoordinates.lat.toFixed(6)}<br />
          X: {Math.round(clickCoordinates.x)}px<br />
          Y: {Math.round(clickCoordinates.y)}px
        </div>
      )}
    </div>
  );
}