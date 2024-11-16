import React, { useState, useRef, useEffect, useMemo } from 'react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { useSearchParams } from 'react-router-dom';
import { EditorNavbar } from './EditorNavbar';
import { EditorFooter } from './EditorFooter';
import { Toolbar } from './Toolbar';
import { Sidebar } from './Sidebar';
import { TitleBlock } from './TitleBlock';
import { NotesPanel } from './NotesPanel';
import { TextModal } from './TextModal';
import { MapInteractionHandler } from './MapInteractionHandler';
import { DrawRectangleMode } from './modes/DrawRectangleMode';
import { DrawStraightLineMode } from './modes/DrawStraightLineMode';
import { getDrawStyles } from './utils/drawStyles';
import { TrafficSign } from './trafficSigns';
import { useProjectSave } from './hooks/useProjectSave';
import { useProjectLoad } from './hooks/useProjectLoad';
import { TextLabel, TitleBlockData } from './types';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoibW9iYWxhIiwiYSI6ImNsN2MzdnUyczBja3YzcnBoMmttczNrNmUifQ.EuKfnG_-CrRpAGHPMcC93w';

const PAGE_SIZES = {
  '8.5x11': { width: 11, height: 8.5 },
  '11x17': { width: 17, height: 11 },
  '24x36': { width: 36, height: 24 },
  '30x42': { width: 42, height: 30 }
};

const DEFAULT_VIEW_STATE = {
  longitude: -118.2426,
  latitude: 34.0549,
  zoom: 18,
  pitch: 0,
  bearing: 0,
  padding: { top: 0, left: 0, right: 0, bottom: 0 }
};

export function Editor() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [selectedPageSize, setSelectedPageSize] = useState('24x36');
  const [lineColor, setLineColor] = useState('#1E3A8A');
  const [fillColor, setFillColor] = useState('#ffffff');
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [showTextModal, setShowTextModal] = useState(false);
  const [textLabels, setTextLabels] = useState<TextLabel[]>([]);
  const [editingText, setEditingText] = useState<TextLabel | null>(null);
  const [pendingTextCoordinates, setPendingTextCoordinates] = useState<[number, number] | null>(null);
  const [signMarkers, setSignMarkers] = useState<Array<{
    id: string;
    sign: TrafficSign;
    lngLat: { lng: number; lat: number; };
  }>>([]);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [titleBlockData, setTitleBlockData] = useState<TitleBlockData>({
    projectTitle: 'Traffic Control Plan',
    projectSubtitle: 'Main Street Improvement Project',
    designer: 'John Doe',
    checker: 'Jane Smith',
    scale: '1" = 40\'',
    date: new Date().toLocaleDateString(),
    drawingNumber: 'TCP-001'
  });

  const [viewState, setViewState] = useState(DEFAULT_VIEW_STATE);

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const pageContainerRef = useRef<HTMLDivElement | null>(null);

  const { saveProject, isSaving } = useProjectSave({
    drawRef,
    mapRef,
    viewState,
    titleBlockData,
    lineColor,
    fillColor,
    signMarkers,
    selectedPageSize,
    notes,
    currentProjectId,
    setCurrentProjectId,
    textLabels
  });

  useProjectLoad({
    projectId,
    drawRef,
    setTitleBlockData,
    setViewState,
    setSelectedPageSize,
    setLineColor,
    setFillColor,
    setSignMarkers,
    setNotes,
    setCurrentProjectId,
    setTextLabels
  });

  const pageStyle = useMemo(() => {
    const dimensions = PAGE_SIZES[selectedPageSize as keyof typeof PAGE_SIZES];
    const aspectRatio = dimensions.width / dimensions.height;
    const containerHeight = 'calc(100vh - 220px)';
    
    return {
      aspectRatio: `${aspectRatio}`,
      maxHeight: containerHeight,
      maxWidth: `calc(${containerHeight} * ${aspectRatio})`,
      margin: '0 auto',
      transition: 'all 0.3s ease-in-out'
    };
  }, [selectedPageSize]);

  const mapContainerStyle = useMemo(() => {
    return {
      width: showNotesPanel ? 'calc(100% - 320px)' : '100%',
      height: `calc(100% - 120px)`,
      position: 'relative' as const,
      overflow: 'hidden',
      transition: 'width 0.3s ease-in-out'
    };
  }, [showNotesPanel]);

  const initializeDraw = () => {
    if (!mapRef.current || !drawRef.current) return;

    mapRef.current.removeControl(drawRef.current);

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      modes: {
        ...MapboxDraw.modes,
        draw_rectangle: DrawRectangleMode,
        draw_line_string: DrawStraightLineMode,
      },
      styles: getDrawStyles(lineColor, fillColor)
    });

    mapRef.current.addControl(draw);
    drawRef.current = draw;

    return draw;
  };

  useEffect(() => {
    if (!mapRef.current || !drawRef.current) return;

    const currentFeatures = drawRef.current.getAll();
    const draw = initializeDraw();
    
    if (draw && currentFeatures) {
      draw.set(currentFeatures);

      if (selectedFeatureId) {
        draw.changeMode('simple_select', { featureIds: [selectedFeatureId] });
      }
    }
  }, [lineColor, fillColor, selectedFeatureId]);

  useEffect(() => {
    if (!drawRef.current || !selectedFeatureId) return;

    const feature = drawRef.current.get(selectedFeatureId);
    if (feature) {
      feature.properties.color = lineColor;
      feature.properties.fillColor = fillColor;
      drawRef.current.add(feature);
    }
  }, [lineColor, fillColor, selectedFeatureId]);

  useEffect(() => {
    return () => {
      if (mapRef.current && drawRef.current) {
        mapRef.current.removeControl(drawRef.current);
      }
    };
  }, []);

  const onMapLoad = (event: any) => {
    const map = event.target;
    mapRef.current = map;

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      modes: {
        ...MapboxDraw.modes,
        draw_rectangle: DrawRectangleMode,
        draw_line_string: DrawStraightLineMode,
      },
      styles: getDrawStyles(lineColor, fillColor)
    });

    map.addControl(draw);
    drawRef.current = draw;
  };

  const handleMapClick = (e: any) => {
    if (selectedTool === 'text') {
      setPendingTextCoordinates([e.lngLat.lng, e.lngLat.lat]);
      setShowTextModal(true);
      return;
    }

    if (!drawRef.current) return;

    const features = drawRef.current.getFeatureIdsAt(e.point);
    if (features.length > 0) {
      setSelectedFeatureId(features[0]);
      drawRef.current.changeMode('simple_select', { featureIds: [features[0]] });
    } else {
      setSelectedFeatureId(null);
    }
  };

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
    setSelectedTextId(null);
    if (tool === 'notes') {
      setShowNotesPanel(true);
    } else if (drawRef.current) {
      if (tool === 'line') {
        drawRef.current.changeMode('draw_line_string');
      } else if (tool === 'rectangle') {
        drawRef.current.changeMode('draw_rectangle');
      }
    }
  };

  const handlePageSizeChange = (size: string) => {
    setSelectedPageSize(size);
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.resize();
      }, 300);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const sign = JSON.parse(e.dataTransfer.getData('application/json'));
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const map = mapRef.current;
    
    if (map) {
      const point = map.unproject([
        e.clientX - rect.left,
        e.clientY - rect.top
      ]);
      
      setSignMarkers(prev => [...prev, {
        id: crypto.randomUUID(),
        sign,
        lngLat: {
          lng: point.lng,
          lat: point.lat
        }
      }]);
    }
  };

  const handleTextSubmit = (text: string, size: number, color: string) => {
    if (editingText) {
      // Update existing text
      setTextLabels(prev => prev.map(label =>
        label.id === editingText.id
          ? { ...label, text, size, color }
          : label
      ));
      setEditingText(null);
    } else if (pendingTextCoordinates) {
      // Add new text
      setTextLabels(prev => [...prev, {
        id: crypto.randomUUID(),
        text,
        size,
        color,
        coordinates: pendingTextCoordinates
      }]);
      setPendingTextCoordinates(null);
      setSelectedTool(null);
    }
    setShowTextModal(false);
  };

  const handleTextDrag = (id: string, lng: number, lat: number) => {
    setTextLabels(prev => prev.map(label =>
      label.id === id
        ? { ...label, coordinates: [lng, lat] }
        : label
    ));
  };

  const handleTextDoubleClick = (label: TextLabel) => {
    setEditingText(label);
    setShowTextModal(true);
  };

  const handleDeleteFeature = () => {
    if (selectedFeatureId && drawRef.current) {
      drawRef.current.delete(selectedFeatureId);
      setSelectedFeatureId(null);
    } else if (selectedTextId) {
      setTextLabels(prev => prev.filter(label => label.id !== selectedTextId));
      setSelectedTextId(null);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <EditorNavbar 
        onLocationChange={(coords) => setViewState(prev => ({ ...prev, ...coords }))}
        onSave={saveProject}
        isSaving={isSaving}
        pageContainerRef={pageContainerRef}
        selectedPageSize={selectedPageSize}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
        <div className="flex-1 flex flex-col">
          <Toolbar
            selectedTool={selectedTool}
            onToolSelect={handleToolSelect}
            selectedPageSize={selectedPageSize}
            onPageSizeChange={handlePageSizeChange}
            lineColor={lineColor}
            onLineColorChange={setLineColor}
            fillColor={fillColor}
            onFillColorChange={setFillColor}
            selectedFeatureId={selectedFeatureId}
            selectedTextId={selectedTextId}
            onDeleteFeature={handleDeleteFeature}
          />
          <div className="flex-1 overflow-auto p-4 bg-gray-100">
            <div 
              ref={pageContainerRef}
              className="bg-white shadow-lg relative"
              style={pageStyle}
            >
              <div 
                style={mapContainerStyle}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <MapInteractionHandler
                  viewState={viewState}
                  onMove={evt => setViewState(evt.viewState)}
                  mapRef={mapRef}
                  drawRef={drawRef}
                  selectedTool={selectedTool}
                  onMapClick={handleMapClick}
                  signMarkers={signMarkers}
                  selectedMarker={selectedMarker}
                  onMarkerClick={setSelectedMarker}
                  textLabels={textLabels}
                  selectedTextId={selectedTextId}
                  onTextSelect={setSelectedTextId}
                  onTextDrag={handleTextDrag}
                  onTextDoubleClick={handleTextDoubleClick}
                  mapboxToken={MAPBOX_TOKEN}
                  onLoad={onMapLoad}
                />
              </div>
              <TitleBlock 
                data={titleBlockData}
                onChange={setTitleBlockData}
              />
              {showNotesPanel && (
                <NotesPanel 
                  isOpen={showNotesPanel} 
                  onClose={() => setShowNotesPanel(false)}
                  notes={notes}
                  onNotesChange={setNotes}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      {showTextModal && (
        <TextModal
          isOpen={showTextModal}
          onClose={() => {
            setEditingText(null);
            setSelectedTool(null);
            setShowTextModal(false);
          }}
          onSubmit={handleTextSubmit}
          initialText={editingText?.text}
          initialSize={editingText?.size}
          initialColor={editingText?.color}
          isEditing={!!editingText}
        />
      )}
      <EditorFooter />
    </div>
  );
}