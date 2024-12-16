// src/components/create/hooks/useProjectLoad.ts
import { useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { TitleBlockData, DrawnLine } from '../types';
import type { ViewState } from 'react-map-gl';

interface UseProjectLoadProps {
  projectId: string | null;
  setTitleBlockData: (data: TitleBlockData) => void;
  setViewState: (viewState: ViewState) => void;
  setSelectedPageSize: (size: string) => void;
  setNotes: (notes: string) => void;
  setDrawnLines: (lines: DrawnLine[]) => void;
}

export function useProjectLoad({
  projectId,
  setTitleBlockData,
  setViewState,
  setSelectedPageSize,
  setNotes,
  setDrawnLines
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

        if (data && data.project_data) {
          // Load view state
          if (data.project_data.viewState) {
            setViewState(data.project_data.viewState);
          }

          // Load title block data
          if (data.project_data.titleBlockData) {
            setTitleBlockData(data.project_data.titleBlockData);
          }

          // Load page size
          if (data.project_data.selectedPageSize) {
            setSelectedPageSize(data.project_data.selectedPageSize);
          }

          // Load notes
          if (data.project_data.notes !== undefined) {
            setNotes(data.project_data.notes);
          }

          // Load canvas shapes
          if (data.project_data.canvasState?.shapes) {
            setDrawnLines(data.project_data.canvasState.shapes);
          }
        }
      } catch (err) {
        console.error('Error loading project:', err);
      }
    }

    loadProject();
  }, [projectId]);
}