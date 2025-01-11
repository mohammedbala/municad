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
import { SettingsModal } from './SettingsModal';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ContextMenu } from './ContextMenu';
import { MAP_STYLES } from './Map';

const PAGE_SIZE_SCALES = {
  '8.5x11': 1,      // Base scale
  '11x17': 1.5,     // 50% larger than base
  '24x36': 3,       // 3x larger than base
  '30x42': 3.5,     // 3.5x larger than base
};

const PAGE_SIZES = {
  '8.5x11': { width: 11, height: 8.5, scale: 1 },
  '11x17': { width: 17, height: 11, scale: 1.5 },
  '24x36': { width: 36, height: 24, scale: 3 },
  '30x42': { width: 42, height: 30, scale: 3.5 }
};

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
  const [stableDrawnLines, setStableDrawnLines] = useState<DrawnLine[]>([]);
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
  const [selectedShape, setSelectedShape] = useState<DrawnLine | null>(null);
  const [hatchPattern, setHatchPattern] = useState('none');
  const [text_input, setTextInput] = useState('');

  const [units, setUnits] = useState<'imperial' | 'metric'>('imperial');
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    mapCoords?: { lat: number; lng: number };
  } | null>(null);
  const [clipboard, setClipboard] = useState<DrawnLine | null>(null);

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const pageContainerRef = useRef<HTMLDivElement | null>(null);
  const [canvasManager, setCanvasManager] = useState<CanvasManager | null>(null);
  const linesRef = useRef<DrawnLine[]>([]);

  const [mapStyle, setMapStyle] = useState(MAP_STYLES.STREETS);

  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>('center');

  const debugShape = (prefix: string, shape: DrawnLine | null) => {
    console.group(prefix);
    console.log('Shape:', {
      id: shape?.id,
      type: shape?.type,
      fillColor: shape?.fillColor,
      color: shape?.color,
      thickness: shape?.thickness
    });
    console.groupEnd();
  };

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
      fillColor?: string | null;
      size?: number;
      fontColor?: string;
      alignment?: 'left' | 'center' | 'right';
    }) => {
      console.log('SHAPE_UPDATE event received:', data);
      setDrawnLines(prev => {
        const prevShape = prev.find(line => line.id === data.id);
        if (!prevShape) return prev;

        const updated = prev.map(line =>
          line.id === data.id
            ? {
              ...line,
              color: data.color ?? line.color,
              fillColor: data.fillColor === undefined ? line.fillColor : data.fillColor,
              size: data.size ?? line.size,
              fontColor: data.fontColor ?? line.fontColor,
              alignment: data.alignment ?? line.alignment
            }
            : line
        );
        
        const updatedShape = updated.find(l => l.id === data.id);
        console.log('Shape update comparison:', {
          before: prevShape,
          after: updatedShape,
          updateData: data
        });
        
        return updated;
      });
    };

    eventManager.on(EVENTS.SHAPE_UPDATE, handleShapeUpdate);
    return () => {
      eventManager.off(EVENTS.SHAPE_UPDATE, handleShapeUpdate);
    };
  }, []);

  const handleShapeComplete = (
    type: string, 
    points: any[],
    additionalData?: any
  ) => {
    const newShape: DrawnLine = {
      id: crypto.randomUUID(),
      type: type as DrawnLine['type'],
      points,
      color: lineColor,
      fillColor: type === 'rectangle' || type === 'polygon' ? fillColor : undefined,
      fontColor: type === 'text' ? (additionalData?.fontColor || fontColor) : undefined,
      thickness: lineThickness,
      size: type === 'text' ? (additionalData?.fontSize || fontSize) : undefined,
      hatchPattern: type === 'rectangle' || type === 'polygon' ? hatchPattern : undefined,
      text: type === 'text' ? additionalData?.text : undefined,
      signData: type === 'sign' ? additionalData?.signData : undefined,
      measurement: type === 'dimension' ? additionalData?.measurement : undefined,
      alignment: type === 'text' ? (additionalData?.alignment || textAlignment) : undefined
    };

    setDrawnLines(prev => {
      const updated = [...prev, newShape];
      linesRef.current = updated;
      setStableDrawnLines(updated);
      
      requestAnimationFrame(() => {
        setSelectedTool('select');
        setSelectedLineId(newShape.id);
        setSelectedShape(newShape);
      });
      
      return updated;
    });
  };

  const handleShapeUpdate = (updatedShape: DrawnLine) => {
    setDrawnLines(prev => {
      const updated = prev.map(shape =>
        shape.id === updatedShape.id ? updatedShape : shape
      );
      linesRef.current = updated;
      setStableDrawnLines(updated);
      return updated;
    });
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

  const handleFillColorChange = (color: string | null) => {
    console.log('handleFillColorChange called with:', color);
    setFillColor(color || '#ffffff');
    if (selectedLineId) {
      const selectedShape = drawnLines.find(line => line.id === selectedLineId);
      if (selectedShape && (selectedShape.type === 'rectangle' || selectedShape.type === 'polygon')) {
        console.log('Updating shape fillColor to:', color);
        setDrawnLines(prev => {
          const updated = prev.map(line =>
            line.id === selectedLineId
              ? { 
                  ...line, 
                  fillColor: color // Pass null directly when no fill
                }
              : line
          );
          console.log('Updated shape:', updated.find(l => l.id === selectedLineId));
          linesRef.current = updated;
          setStableDrawnLines(updated);
          return updated;
        });

        // Emit the update event
        eventManager.emit(EVENTS.SHAPE_UPDATE, {
          id: selectedLineId,
          fillColor: color // Pass null directly when no fill
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
    setCurrentProjectId: () => { },
    drawnLines
  });

  useProjectLoad({
    projectId,
    setTitleBlockData,
    setViewState,
    setSelectedPageSize,
    setNotes,
    setDrawnLines: (lines) => {
      console.log('Setting drawn lines from project load:', lines);
      linesRef.current = lines;
      setDrawnLines(lines);
      setStableDrawnLines(lines);
    }
  });

  useEffect(() => {
    console.log('drawnLines updated:', drawnLines.map(shape => ({
      id: shape.id,
      type: shape.type,
      fillColor: shape.fillColor,
      thickness: shape.thickness
    })));
  }, [drawnLines]);

  useEffect(() => {
    console.log('stableDrawnLines updated:', stableDrawnLines.map(shape => ({
      id: shape.id,
      type: shape.type,
      fillColor: shape.fillColor,
      thickness: shape.thickness
    })));
  }, [stableDrawnLines]);

  useEffect(() => {
  }, [canvasManager]);

  const handleMapLoad = (map: mapboxgl.Map) => {
    mapRef.current = map;
    const canvas = document.createElement('canvas');
    const manager = new CanvasManager(canvas, map);
    setCanvasManager(manager);
  };

  const handleToolSelect = (tool: string) => {
    if (tool === 'notes') {
      setShowNotesPanel(!showNotesPanel);
    } else {
      // Reset to default values when switching to a drawing tool
      if (['line', 'arrow', 'rectangle', 'polygon', 'draw'].includes(tool)) {
        setLineColor('#1E3A8A');  // Default blue
        setFillColor('#ffffff');  // Default white
        setLineThickness(1.0);    // Default thickness
        setHatchPattern('none');  // Reset hatch pattern to none
      }
      setSelectedTool(tool);
    }
  };

  const handleShapeSelect = (id: string | null) => {
    console.log('handleShapeSelect:', {
      receivedId: id,
      drawnLines,
      stableDrawnLines,
      linesRef: linesRef.current,
      drawnLinesCount: drawnLines.length,
      stableDrawnLinesCount: stableDrawnLines.length,
      refCount: linesRef.current.length
    });

    if (id) {
      const shape = drawnLines.find(line => line.id === id) ||
        stableDrawnLines.find(line => line.id === id) ||
        linesRef.current.find(line => line.id === id);

      console.log('Found shape:', shape);

      if (shape) {
        setSelectedLineId(id);
        setSelectedShape(shape);

        if (drawnLines.length === 0) {
          setDrawnLines(linesRef.current);
          setStableDrawnLines(linesRef.current);
        }
      } else {
        console.warn('Shape not found in any array:', id);
      }
    } else {
      setSelectedLineId(null);
      setSelectedShape(null);
    }
  };

  const handleHatchPatternChange = (pattern: string) => {
    setHatchPattern(pattern);
    if (selectedLineId) {
      setDrawnLines(prev => prev.map(line =>
        line.id === selectedLineId
          ? { ...line, hatchPattern: pattern }
          : line
      ));
    }
  };

  useEffect(() => {
    if (drawnLines.length > 0) {
      setStableDrawnLines(drawnLines);
    }
  }, [drawnLines]);

  useEffect(() => {
    (window as any).drawnLines = drawnLines;
  }, [drawnLines]);

  const handleExportPDF = async () => {
    if (!pageContainerRef.current) {
      console.error('No container element found for PDF export.');
      alert('Export failed: Container not found.');
      return;
    }

    try {
      console.log('Starting PDF export...');

      if (canvasManager) {
        canvasManager.redraw();
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      const container = pageContainerRef.current;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      const scale = 2;

      // Use html2canvas with specific configuration
      const canvas = await html2canvas(container, {
        scale,
        useCORS: true,
        allowTaint: true,
        logging: true,
        width: containerWidth,
        height: containerHeight,
        backgroundColor: '#ffffff',
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          const clonedContainer = clonedDoc.querySelector('[data-export-container]');
          if (clonedContainer instanceof HTMLElement) {
            clonedContainer.style.width = `${containerWidth}px`;
            clonedContainer.style.height = `${containerHeight}px`;
            clonedContainer.style.transform = 'none';
            clonedContainer.style.position = 'relative';
          }

          // Ensure map container is visible
          const mapContainer = clonedDoc.querySelector('.mapboxgl-map');
          if (mapContainer instanceof HTMLElement) {
            mapContainer.style.visibility = 'visible';
            mapContainer.style.position = 'absolute';
            mapContainer.style.width = '100%';
            mapContainer.style.height = '100%';
          }

          // Ensure title block is visible and properly rendered
          const titleBlock = clonedDoc.querySelector('[data-title-block]');
          if (titleBlock instanceof HTMLElement) {
            titleBlock.style.position = 'absolute';
            titleBlock.style.bottom = '0';
            titleBlock.style.left = '0';
            titleBlock.style.right = '0';
            titleBlock.style.height = '100px';
            titleBlock.style.zIndex = '1000';
            titleBlock.style.transform = 'none';
            titleBlock.style.visibility = 'visible';
            titleBlock.style.backgroundColor = '#ffffff';

            // Convert inputs to text elements with tighter spacing
            const inputs = titleBlock.querySelectorAll('input');
            inputs.forEach(input => {
              const text = document.createElement('div');
              text.textContent = input.value;
              text.style.fontSize = '12px';
              text.style.lineHeight = '1.2';
              text.style.marginBottom = '4px';
              text.style.fontFamily = 'Arial, sans-serif';
              text.style.color = '#000000';
              text.style.padding = '2px 0';

              // Add a horizontal line after the text
              const line = document.createElement('div');
              line.style.height = '1px';
              line.style.backgroundColor = '#cccccc';
              line.style.marginBottom = '4px';

              // Replace input with text and line
              const container = document.createElement('div');
              container.appendChild(text);
              container.appendChild(line);
              input.parentNode?.replaceChild(container, input);
            });
          }
        }
      });

      // Get page dimensions and always use landscape for these page sizes
      const pageSizes: { [key: string]: [number, number] } = {
        '8.5x11': [11, 8.5],  // Swapped for landscape
        '11x17': [17, 11],    // Swapped for landscape
        '24x36': [36, 24],    // Swapped for landscape
        '30x42': [42, 30],    // Already landscape
      };

      const [pageWidth, pageHeight] = pageSizes[selectedPageSize] || [11, 8.5];

      // Create PDF with landscape orientation and maximum quality
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'in',
        format: [pageWidth, pageHeight],
        compress: false // Disable compression for maximum quality
      });

      // Calculate dimensions to maintain aspect ratio
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 0.5; // 0.5 inches = roughly 5px at typical PDF resolution

      // Adjust available space for content accounting for margins
      const availableWidth = pdfWidth - (2 * margin);
      const availableHeight = pdfHeight - (2 * margin);

      const imageAspectRatio = canvas.width / canvas.height;
      const pageAspectRatio = availableWidth / availableHeight;

      let finalWidth = availableWidth;
      let finalHeight = availableHeight;

      if (imageAspectRatio > pageAspectRatio) {
        finalHeight = finalWidth / imageAspectRatio;
      } else {
        finalWidth = finalHeight * imageAspectRatio;
      }

      // Center the image within the margins
      const xOffset = margin + (availableWidth - finalWidth) / 2;
      const yOffset = margin + (availableHeight - finalHeight) / 2;

      // Draw black border around the content area
      pdf.setDrawColor(0, 0, 0); // Set border color to black
      pdf.setLineWidth(0.02); // Set border width (in inches)
      pdf.rect(
        xOffset - 0.01, // Slight offset to ensure border is visible
        yOffset - 0.01,
        finalWidth + 0.02, // Add small padding to account for border width
        finalHeight + 0.02
      );

      // Add the image to PDF with maximum quality
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0), // Maximum JPEG quality
        'JPEG',
        xOffset,
        yOffset,
        finalWidth,
        finalHeight,
        undefined, // No alias
        'NONE' // No compression
      );

      console.log('Saving PDF...');
      pdf.save('traffic-control-plan.pdf');
      console.log('PDF saved successfully');

    } catch (error: any) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF: ' + error.message);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();

    // Get map coordinates from click position
    if (!mapRef.current) return;

    const rect = mapRef.current.getCanvas().getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const lngLat = mapRef.current.unproject([x, y]);

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      mapCoords: {
        lat: lngLat.lat,
        lng: lngLat.lng
      }
    });
  };

  const handleCopy = () => {
    if (selectedShape) {
      setClipboard({ ...selectedShape, id: crypto.randomUUID() });
    }
  };

  const handlePaste = (coords?: { lat: number; lng: number }) => {
    if (clipboard) {
      const offset = coords ? {
        lat: coords.lat - clipboard.points[0].lat,
        lng: coords.lng - clipboard.points[0].lng
      } : {
        lat: 0.0001,
        lng: 0.0001
      };

      const newShape = {
        ...clipboard,
        id: crypto.randomUUID(),
        points: clipboard.points.map(point => ({
          ...point,
          lat: point.lat + offset.lat,
          lng: point.lng + offset.lng,
          x: point.x,
          y: point.y
        })),
      };

      // Update all state references to ensure persistence
      setDrawnLines(prev => {
        const updated = [...prev, newShape];
        linesRef.current = updated;
        setStableDrawnLines(updated);
        return updated;
      });

      // Update selection after state is updated
      requestAnimationFrame(() => {
        setSelectedLineId(newShape.id);
        setSelectedShape(newShape);
      });
    }
  };

  const handleCut = () => {
    if (selectedShape) {
      handleCopy();
      setDrawnLines(prev => prev.filter(line => line.id !== selectedShape.id));
      setSelectedLineId(null);
      setSelectedShape(null);
    }
  };

  const handleDelete = () => {
    if (selectedLineId) {
      setDrawnLines(prev => {
        const updated = prev.filter(line => line.id !== selectedLineId);
        linesRef.current = updated;
        setStableDrawnLines(updated);
        return updated;
      });
      setSelectedLineId(null);
      setSelectedShape(null);
    }
  };

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Don't require selectedShape for paste operation
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        handlePaste();
        return;
      }

      // Only require selectedShape for copy/cut/delete
      if (!selectedShape) return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        handleCopy();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'x') {
        handleCut();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDelete();
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [selectedShape, clipboard]);

  // Add this function to handle background clicks
  const handleBackgroundClick = (e: React.MouseEvent) => {
    // Only handle direct clicks on the map container, not its children
    if (e.target === e.currentTarget) {
      setSelectedLineId(null);
      setSelectedShape(null);
    }
  };

  const handleLineThicknessChange = (thickness: number) => {
    console.group('handleLineThicknessChange');
    console.log('New thickness:', thickness);
    console.log('Selected ID:', selectedLineId);
    
    setLineThickness(thickness);
    if (selectedLineId) {
      const currentShape = drawnLines.find(line => line.id === selectedLineId);
      debugShape('Current shape before update:', currentShape);
      
      // Block other shape update events temporarily
      const originalEmit = eventManager.emit;
      eventManager.emit = (event: string, data: any) => {
        console.log('Blocked event emission:', event, data);
        return;
      };
      
      setDrawnLines(prev => {
        const updated = prev.map(line => {
          if (line.id === selectedLineId) {
            const updatedShape = { ...line, thickness };
            debugShape('Shape after update:', updatedShape);
            return updatedShape;
          }
          return line;
        });
        
        console.log('All shapes after update:', updated.map(shape => ({
          id: shape.id,
          type: shape.type,
          fillColor: shape.fillColor,
          thickness: shape.thickness
        })));
        
        linesRef.current = updated;
        setStableDrawnLines(updated);
        return updated;
      });

      // Restore original emit after state update
      setTimeout(() => {
        eventManager.emit = originalEmit;
      }, 0);
    }
    console.groupEnd();
  };

  const handleLineColorChange = (color: string) => {
    setLineColor(color);
    if (selectedLineId) {
      const selectedShape = drawnLines.find(line => line.id === selectedLineId);
      if (selectedShape) {
        setDrawnLines(prev => {
          const updated = prev.map(line =>
            line.id === selectedLineId
              ? {
                  ...line,
                  color,
                  // Explicitly preserve the exact fillColor value (including null)
                  fillColor: line.fillColor
                }
              : line
          );
          linesRef.current = updated;
          setStableDrawnLines(updated);
          return updated;
        });

        // Emit the update event with the preserved fillColor
        eventManager.emit(EVENTS.SHAPE_UPDATE, {
          id: selectedLineId,
          color,
          fillColor: selectedShape.fillColor
        });
      }
    }
  };

  const handleTextAlignmentChange = (alignment: 'left' | 'center' | 'right') => {
    setTextAlignment(alignment);
    if (selectedLineId) {
      setDrawnLines(prev => {
        const updated = prev.map(line =>
          line.id === selectedLineId
            ? { ...line, alignment }
            : line
        );
        linesRef.current = updated;
        setStableDrawnLines(updated);
        return updated;
      });

      // Emit the update event
      eventManager.emit(EVENTS.SHAPE_UPDATE, {
        id: selectedLineId,
        alignment
      });

      // Force a redraw
      if (canvasManager) {
        canvasManager.redraw();
      }
    }
  };

  useEffect(() => {
    // Check for pending publish state
    try {
      const pendingPublish = localStorage.getItem('pendingPublish');
      if (pendingPublish) {
        const { isPublishing, state } = JSON.parse(pendingPublish);
        
        // Restore the state
        setViewState(state.viewState);
        setTitleBlockData(state.titleBlockData);
        setSelectedPageSize(state.selectedPageSize);
        setNotes(state.notes);
        setDrawnLines(state.drawnLines);
        
        // Clear the pending publish data
        localStorage.removeItem('pendingPublish');
        
        // Trigger save after a short delay to ensure everything is initialized
        setTimeout(() => {
          handleSave(isPublishing);
        }, 1000);
      }
    } catch (error) {
      console.error('Error handling pending publish state:', error);
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const center = [viewState.longitude, viewState.latitude];
    const pageSize = PAGE_SIZES[selectedPageSize];
    
    // Calculate aspect ratio and area factors
    const baseAspect = PAGE_SIZES['8.5x11'].width / PAGE_SIZES['8.5x11'].height;
    const newAspect = pageSize.width / pageSize.height;
    const aspectFactor = newAspect / baseAspect;
    
    // Calculate new zoom level considering both scale and aspect ratio
    const baseZoom = 18;
    const scaleAdjustment = Math.log2(pageSize.scale);
    const aspectAdjustment = Math.log2(aspectFactor);
    const newZoom = baseZoom - scaleAdjustment - aspectAdjustment;

    setViewState(prev => ({
      ...prev,
      zoom: newZoom,
      longitude: center[0],
      latitude: center[1]
    }));
  }, [selectedPageSize]);

  const handlePageSizeChange = (size: string) => {
    setSelectedPageSize(size);
  };

  return (
    <div className="flex flex-col h-screen" onContextMenu={handleContextMenu}>
      <EditorNavbar
        onLocationChange={(coords) => setViewState(prev => ({ ...prev, ...coords }))}
        canvasManager={canvasManager}
        viewState={viewState}
        titleBlockData={titleBlockData}
        selectedPageSize={selectedPageSize}
        notes={notes}
        currentProjectId={projectId}
        setCurrentProjectId={() => { }}
        drawnLines={drawnLines}
        pageContainerRef={pageContainerRef}
        onExportPDF={handleExportPDF}
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
            onPageSizeChange={handlePageSizeChange}
            lineColor={lineColor}
            onLineColorChange={handleLineColorChange}
            fillColor={fillColor}
            onFillColorChange={handleFillColorChange}
            fontColor={fontColor}
            onFontColorChange={handleFontColorChange}
            lineThickness={lineThickness}
            onLineThicknessChange={handleLineThicknessChange}
            fontSize={fontSize}
            onFontSizeChange={handleFontSizeChange}
            selectedFeatureId={selectedLineId}
            selectedTextId={selectedLineId && drawnLines.find(line => line.id === selectedLineId)?.type === 'text' ? selectedLineId : null}
            onDeleteFeature={handleDelete}
            hatchPattern={hatchPattern}
            onHatchPatternChange={handleHatchPatternChange}
            selectedShape={selectedShape}
            mapStyle={mapStyle}
            onMapStyleChange={setMapStyle}
            textAlignment={textAlignment}
            onTextAlignmentChange={handleTextAlignmentChange}
          />
          <div className="flex-1 overflow-auto p-4 bg-gray-100">
            <div
              ref={pageContainerRef}
              data-export-container
              className="bg-white shadow-lg relative overflow-hidden"
              style={{
                aspectRatio: selectedPageSize === '8.5x11' ? '11/8.5' :
                  selectedPageSize === '11x17' ? '17/11' :
                    selectedPageSize === '24x36' ? '36/24' : '42/30',
                height: 'calc(100vh - 220px)',
                margin: '0 auto',
                position: 'relative'
              }}
              onClick={handleBackgroundClick}
            >
              <div className="absolute inset-0">
                <MapComponent
                  viewState={viewState}
                  onViewStateChange={setViewState}
                  selectedTool={selectedTool}
                  lineColor={lineColor}
                  fillColor={fillColor}
                  fontColor={fontColor}
                  lineThickness={lineThickness}
                  onShapeComplete={handleShapeComplete}
                  onShapeSelect={handleShapeSelect}
                  onShapeUpdate={handleShapeUpdate}
                  drawnLines={drawnLines.length > 0 ? drawnLines : stableDrawnLines.length > 0 ? stableDrawnLines : linesRef.current}
                  selectedLineId={selectedLineId}
                  onMapLoad={handleMapLoad}
                  mapStyle={mapStyle}
                  onMapStyleChange={setMapStyle}
                />
              </div>
              <div className="absolute inset-0 pointer-events-none">
                <TitleBlock
                  data={titleBlockData}
                  onChange={setTitleBlockData}
                />
              </div>
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
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
        units={units}
        onUnitsChange={setUnits}
      />
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          mapCoords={contextMenu.mapCoords}
          onClose={() => setContextMenu(null)}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onCut={handleCut}
          onDelete={handleDelete}
          canPaste={clipboard !== null}
          selectedShape={selectedShape}
        />
      )}
    </div>
  );
}