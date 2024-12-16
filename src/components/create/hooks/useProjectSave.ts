import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { ViewState } from 'react-map-gl';
import type { CanvasManager } from '../canvas/CanvasManager';
import type { DrawnLine, TitleBlockData } from '../types';

interface UseProjectSaveProps {
  canvasManager: CanvasManager | null;
  viewState: ViewState;
  titleBlockData: TitleBlockData;
  selectedPageSize: string;
  notes: string;
  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;
  drawnLines: DrawnLine[];
}

const USER_ID = '09f43a49-a67f-4945-9fac-909f333f8d8b';

export function useProjectSave({
  canvasManager,
  viewState,
  titleBlockData,
  selectedPageSize,
  notes,
  currentProjectId,
  setCurrentProjectId,
  drawnLines
}: UseProjectSaveProps) {
  const [isSaving, setIsSaving] = useState(false);

  const saveProject = async (isPublishing = false) => {
    if (!canvasManager) {
      console.error('Canvas manager is not initialized');
      throw new Error('Canvas manager is not initialized');
    }

    try {
      setIsSaving(true);

      const renderState = canvasManager.getRenderManager().getState();
      const projectData = {
        title: titleBlockData.projectTitle,
        viewState: {
          longitude: viewState.longitude,
          latitude: viewState.latitude,
          zoom: viewState.zoom,
          pitch: viewState.pitch || 0,
          bearing: viewState.bearing || 0,
          padding: viewState.padding || { top: 0, bottom: 0, left: 0, right: 0 }
        },
        selectedPageSize,
        titleBlockData,
        notes,
        canvasState: {
          shapes: drawnLines,
          selectedShape: renderState.selectedShape
        },
        lastModified: new Date().toISOString()
      };

      if (currentProjectId) {
        const { error } = await supabase
          .from('projects')
          .update({
            project_data: projectData,
            user_id: USER_ID,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentProjectId)
          .select('id, project_data, user_id, created_at, updated_at');

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('projects')
          .insert([{
            project_data: projectData,
            user_id: USER_ID,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select('id, project_data, user_id, created_at, updated_at')
          .single();

        if (error) throw error;
        setCurrentProjectId(data.id);
      }

      return true;
    } catch (error) {
      console.error('Detailed save error:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveProject, isSaving };
}