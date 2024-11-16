import { useState, useCallback } from 'react';

interface DragState {
  isDragging: boolean;
  startPoint: [number, number] | null;
}

export function useFeatureDrag(
  selectedFeatureId: string | null,
  selectedTool: string | null,
  updateFeatures: (featureId: string, deltaLng: number, deltaLat: number) => void
) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startPoint: null
  });

  const handleMouseDown = useCallback((event: any) => {
    if (selectedFeatureId && !selectedTool) {
      const features = event.target.queryRenderedFeatures(event.point, {
        layers: ['lines', 'fills', 'text-labels']
      });

      const featureUnderMouse = features.find(
        (f: any) => f.properties.id === selectedFeatureId
      );

      if (featureUnderMouse) {
        setDragState({
          isDragging: true,
          startPoint: [event.lngLat.lng, event.lngLat.lat]
        });
        event.preventDefault();
      }
    }
  }, [selectedFeatureId, selectedTool]);

  const handleMouseMove = useCallback((event: any) => {
    if (!dragState.isDragging || !dragState.startPoint) return;

    const [startLng, startLat] = dragState.startPoint;
    const deltaLng = event.lngLat.lng - startLng;
    const deltaLat = event.lngLat.lat - startLat;

    updateFeatures(selectedFeatureId!, deltaLng, deltaLat);
    setDragState(prev => ({
      ...prev,
      startPoint: [event.lngLat.lng, event.lngLat.lat]
    }));
  }, [dragState, selectedFeatureId, updateFeatures]);

  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging) {
      setDragState({
        isDragging: false,
        startPoint: null
      });
    }
  }, [dragState.isDragging]);

  return {
    isDragging: dragState.isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
}