import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EditorNavbar } from './EditorNavbar';
import { EditorFooter } from './EditorFooter';
import { Toolbar } from './Toolbar';
import { Sidebar } from './Sidebar';
import { TitleBlock } from './TitleBlock';
import { NotesPanel } from './NotesPanel';
import { MapComponent } from './Map';
import { TextLabel, TitleBlockData, DrawnLine } from './types';
import { useProjectSave } from './hooks/useProjectSave';
import { useProjectLoad } from './hooks/useProjectLoad';
import { calculateDistance, formatMeasurement } from './utils/measurementUtils';
import { eventManager, EVENTS } from './tools/EventManager';
import { CanvasManager } from './canvas/CanvasManager';

export function Editor() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const [selectedTool, setSelectedTool] = useState<string | null>('select');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [selectedPageSize, setSelectedPageSize] = useState('24x36');
  const [lineColor, setLineColor] = useState('#1E3A8A');
  const [fillColor, setFillColor] = useState('#ffffff');
  const [fontColor, setFontColor] = useState('#1E3A8A');
  const [lineThickness, setLineThickness] = useState(1.0);
  const [fontSize, setFontSize] = useState(16);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [textLabels, setTextLabels] = useState<TextLabel[]>([]);
  const [notes, setNotes] = useState('');
  const [drawnLines, setDrawnLines] = useState<DrawnLine[]>([]);
  const [viewState, setViewState] = useState({
    longitude: -118.2426,
    latitude: 34.0549,
    zoom: 18,
    pitch: 0,
    bearing: 0,
    padding: { top: 0, left: 0, right: 0, bottom: 0 }
  });
  const [titleBlockData, setTitleBlockData] = useState<TitleBlockData>({
    projectTitle: 'Traffic Control Plan',
    projectSubtitle: 'Main Street Improvement Project',
    designer: 'John Doe',
    checker: 'Jane Smith',
    scale: '1" = 40\'',
    date: new Date().toLocaleDateString(),
    drawingNumber: 'TCP-001'
  });

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const pageContainerRef = useRef<HTMLDivElement | null>(null);
  const [canvasManager, setCanvasManager] = useState<CanvasManager | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const canvas = document.createElement('canvas');
    const manager = new CanvasManager(canvas, mapRef.current);
    setCanvasManager(manager);

    return () => {
      manager.cleanup();
    };
  }, [mapRef.current]);

  useEffect(() => {
    (window as any).drawnLines = drawnLines;
  }, [drawnLines]);

  useEffect(() => {
    const handleShapeUpdate = (data: { 
      id: string; 
      color?: string; 
      fillColor?: string;
      thickness?: number;
      size?: number;
      fontColor?: string;
    }) => {
      setDrawnLines(prev => prev.map(line => 
        line.id === data.id 
          ? { 
              ...line, 
              color: data.color || line.color,
              fillColor: data.fillColor || line.fillColor,
              thickness: data.thickness ?? line.thickness,
              size: data.size ?? line.size,
              fontColor: data.fontColor ?? line.fontColor
            }
          : line
      ));
    };

    eventManager.on(EVENTS.SHAPE_UPDATE, handleShapeUpdate);
    return () => {
      eventManager.off(EVENTS.SHAPE_UPDATE, handleShapeUpdate);
    };
  }, []);

  const handleShapeComplete = (type: string, points: any[], additionalData?: any) => {
    const newShape: DrawnLine = {
      id: crypto.randomUUID(),
      type: type as DrawnLine['type'],
      points,
      color: lineColor,
      fillColor: type === 'rectangle' || type === 'polygon' ? fillColor : undefined,
      fontColor: type === 'text' ? fontColor : undefined,
      thickness: lineThickness,
      size: type === 'text' ? fontSize : undefined,
      ...additionalData
    };

    if (type === 'dimension') {
      const distance = calculateDistance(
        points[0].lat,
        points[0].lng,
        points[1].lat,
        points[1].lng
      );
      newShape.measurement = formatMeasurement(distance);
    }

    setDrawnLines(prev => [...prev, newShape]);
    setSelectedTool('select');
    setSelectedLineId(newShape.id);
  };

  const handleShapeUpdate = (updatedShape: DrawnLine) => {
    setDrawnLines(prev => 
      prev.map(shape => 
        shape.id === updatedShape.id ? updatedShape : shape
      )
    );
  };

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    if (selectedLineId) {
      const selectedShape = drawnLines.find(line => line.id === selectedLineId);
      if (selectedShape && selectedShape.type === 'text') {
        eventManager.emit(EVENTS.SHAPE_UPDATE, {
          id: selectedLineId,
          size
        });
      }
    }
  };

  const handleFontColorChange = (color: string) => {
    setFontColor(color);
    if (selectedLineId) {
      const selectedShape = drawnLines.find(line => line.id === selectedLineId);
      if (selectedShape && selectedShape.type === 'text') {
        eventManager.emit(EVENTS.SHAPE_UPDATE, {
          id: selectedLineId,
          fontColor: color
        });
      }
    }
  };

  const { saveProject, isSaving } = useProjectSave({
    canvasManager,
    viewState,
    titleBlockData,
    selectedPageSize,
    notes,
    currentProjectId: projectId,
    setCurrentProjectId: () => {},
    drawnLines
  });

  useProjectLoad({
    projectId,
    setTitleBlockData,
    setViewState,
    setSelectedPageSize,
    setNotes,
    setDrawnLines
  });

  const handleMapLoad = (map: mapboxgl.Map) => {
    console.log('Map loaded');
    mapRef.current = map;
    const canvas = document.createElement('canvas');
    const manager = new CanvasManager(canvas, map);
    console.log('Canvas manager created:', manager);
    setCanvasManager(manager);
  };

  useEffect(() => {
    console.log('Canvas manager state updated:', canvasManager);
  }, [canvasManager]);

  const handleToolSelect = (tool: string) => {
    if (tool === 'notes') {
      setShowNotesPanel(!showNotesPanel);
    } else {
      setSelectedTool(tool);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <EditorNavbar 
        onLocationChange={(coords) => setViewState(prev => ({ ...prev, ...coords }))}
        canvasManager={canvasManager}
        viewState={viewState}
        titleBlockData={titleBlockData}
        selectedPageSize={selectedPageSize}
        notes={notes}
        currentProjectId={projectId}
        setCurrentProjectId={() => {}}
        drawnLines={drawnLines}
        pageContainerRef={pageContainerRef}
      />
      <div className="flex-1 flex overflow-hidden min-w-0">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Toolbar
            selectedTool={selectedTool}
            onToolSelect={handleToolSelect}
            selectedPageSize={selectedPageSize}
            onPageSizeChange={setSelectedPageSize}
            lineColor={lineColor}
            onLineColorChange={setLineColor}
            fillColor={fillColor}
            onFillColorChange={setFillColor}
            fontColor={fontColor}
            onFontColorChange={handleFontColorChange}
            lineThickness={lineThickness}
            onLineThicknessChange={setLineThickness}
            fontSize={fontSize}
            onFontSizeChange={handleFontSizeChange}
            selectedFeatureId={selectedLineId}
            selectedTextId={selectedLineId && drawnLines.find(line => line.id === selectedLineId)?.type === 'text' ? selectedLineId : null}
            onDeleteFeature={() => {
              if (selectedLineId) {
                setDrawnLines(prev => prev.filter(line => line.id !== selectedLineId));
                setSelectedLineId(null);
              }
            }}
          />
          <div className="flex-1 overflow-auto p-4 bg-gray-100">
            <div 
              ref={pageContainerRef}
              className="bg-white shadow-lg relative"
              style={{
                aspectRatio: selectedPageSize === '8.5x11' ? '11/8.5' :
                           selectedPageSize === '11x17' ? '17/11' :
                           selectedPageSize === '24x36' ? '36/24' : '42/30',
                height: 'calc(100vh - 220px)',
                margin: '0 auto'
              }}
            >
            <MapComponent
              viewState={viewState}
              onViewStateChange={setViewState}
              selectedTool={selectedTool}
              lineColor={lineColor}
              fillColor={fillColor}
              fontColor={fontColor}
              lineThickness={lineThickness}
              onShapeComplete={handleShapeComplete}
              onShapeSelect={setSelectedLineId}
              onShapeUpdate={handleShapeUpdate}
              drawnLines={drawnLines}
              selectedLineId={selectedLineId}
              onMapLoad={handleMapLoad}
            />
              <TitleBlock 
                data={titleBlockData}
                onChange={setTitleBlockData}
              />
              <NotesPanel 
                isOpen={showNotesPanel}
                onClose={() => setShowNotesPanel(false)}
                notes={notes}
                onNotesChange={setNotes}
              />
            </div>
          </div>
        </div>
      </div>
      <EditorFooter />
    </div>
  );
}