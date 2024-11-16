import { useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { ViewState } from 'react-map-gl';
import type { TrafficSign } from '../trafficSigns';

interface TitleBlockData {
  projectTitle: string;
  projectSubtitle: string;
  designer: string;
  checker: string;
  scale: string;
  date: string;
  drawingNumber: string;
}

interface TextLabel {
  id: string;
  text: string;
  size: number;
  color: string;
  coordinates: [number, number];
}

interface UseProjectLoadProps {
  projectId: string | null;
  drawRef: React.RefObject<MapboxDraw>;
  setTitleBlockData: (data: TitleBlockData) => void;
  setViewState: (state: ViewState) => void;
  setSelectedPageSize: (size: string) => void;
  setLineColor: (color: string) => void;
  setLineStyle: (style: string) => void;
  setFillPattern: (pattern: string) => void;
  setSignMarkers: (markers: Array<{
    id: string;
    sign: TrafficSign;
    lngLat: { lng: number; lat: number; };
  }>) => void;
  setNotes: (notes: string) => void;
  setCurrentProjectId: (id: string | null) => void;
  setTextLabels: (labels: TextLabel[]) => void;
}

export function useProjectLoad({
  projectId,
  drawRef,
  setTitleBlockData,
  setViewState,
  setSelectedPageSize,
  setLineColor,
  setLineStyle,
  setFillPattern,
  setSignMarkers,
  setNotes,
  setCurrentProjectId,
  setTextLabels
}: UseProjectLoadProps) {
  useEffect(() => {
    async function loadProject() {
      if (!projectId) return;

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (error) throw error;
        if (!data) return;

        setCurrentProjectId(data.id);

        const projectData = data.project_data;
        if (projectData) {
          if (projectData.titleBlockData) {
            setTitleBlockData(projectData.titleBlockData);
          }
          if (projectData.viewState) {
            setViewState(projectData.viewState);
          }
          if (projectData.selectedPageSize) {
            setSelectedPageSize(projectData.selectedPageSize);
          }
          if (projectData.lineColor) setLineColor(projectData.lineColor);
          if (projectData.lineStyle) setLineStyle(projectData.lineStyle);
          if (projectData.fillPattern) setFillPattern(projectData.fillPattern);
          if (projectData.signMarkers) {
            setSignMarkers(projectData.signMarkers);
          }
          if (projectData.notes) {
            setNotes(projectData.notes);
          }
          if (projectData.textLabels) {
            setTextLabels(projectData.textLabels);
          }
          if (projectData.features && drawRef.current) {
            drawRef.current.set(projectData.features);
          }
        }
      } catch (err) {
        console.error('Error loading project:', err);
      }
    }

    loadProject();
  }, [projectId]);
}