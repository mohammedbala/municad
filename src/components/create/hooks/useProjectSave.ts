import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { ViewState } from 'react-map-gl';
import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { Map } from 'mapbox-gl';
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

interface UseProjectSaveProps {
  drawRef: React.RefObject<MapboxDraw>;
  mapRef: React.RefObject<Map>;
  viewState: ViewState;
  titleBlockData: TitleBlockData;
  lineColor: string;
  lineStyle: string;
  fillPattern: string;
  signMarkers: Array<{
    id: string;
    sign: TrafficSign;
    lngLat: { lng: number; lat: number; };
  }>;
  selectedPageSize: string;
  notes: string;
  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;
  textLabels: TextLabel[];
}

const USER_ID = '09f43a49-a67f-4945-9fac-909f333f8d8b';

export function useProjectSave({
  drawRef,
  mapRef,
  viewState,
  titleBlockData,
  lineColor,
  lineStyle,
  fillPattern,
  signMarkers,
  selectedPageSize,
  notes,
  currentProjectId,
  setCurrentProjectId,
  textLabels
}: UseProjectSaveProps) {
  const [isSaving, setIsSaving] = useState(false);

  const saveProject = async (isPublishing = false) => {
    try {
      setIsSaving(true);

      const projectData = {
        title: titleBlockData.projectTitle,
        features: drawRef.current?.getAll() || {
          type: "FeatureCollection",
          features: []
        },
        lineColor,
        lineStyle,
        viewState: {
          ...viewState,
          zoom: mapRef.current?.getZoom() || viewState.zoom,
          pitch: mapRef.current?.getPitch() || viewState.pitch,
          bearing: mapRef.current?.getBearing() || viewState.bearing,
          latitude: mapRef.current?.getCenter().lat || viewState.latitude,
          longitude: mapRef.current?.getCenter().lng || viewState.longitude,
          padding: mapRef.current?.getPadding() || viewState.padding
        },
        fillPattern,
        signMarkers,
        selectedPageSize,
        titleBlockData,
        notes,
        textLabels
      };

      if (currentProjectId) {
        const { error } = await supabase
          .from('projects')
          .update({
            project_data: projectData,
            user_id: USER_ID
          })
          .eq('id', currentProjectId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('projects')
          .insert([{
            project_data: projectData,
            user_id: USER_ID
          }])
          .select()
          .single();

        if (error) throw error;
        setCurrentProjectId(data.id);
      }

      return true;
    } catch (error) {
      console.error('Error saving project:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveProject, isSaving };
}