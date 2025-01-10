import React, { useState, useRef, useEffect } from 'react';
import { SignpostBig, Download, Share2, Settings, Loader2, Search, X, FileDown, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SettingsModal } from './SettingsModal';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '../../lib/supabase';
import type { ViewState } from 'react-map-gl';
import type { CanvasManager } from './canvas/CanvasManager';
import type { DrawnLine, TitleBlockData } from './types';

const MAPBOX_TOKEN = 'pk.eyJ1IjoibW9iYWxhIiwiYSI6ImNsN2MzdnUyczBja3YzcnBoMmttczNrNmUifQ.EuKfnG_-CrRpAGHPMcC93w';

interface SearchResult {
  id: string;
  place_name: string;
  center: [number, number];
}

interface EditorNavbarProps {
  onLocationChange: (coords: { longitude: number; latitude: number; zoom: number }) => void;
  canvasManager: CanvasManager | null;
  viewState: ViewState;
  titleBlockData: TitleBlockData;
  selectedPageSize: string;
  notes: string;
  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;
  drawnLines: DrawnLine[];
  pageContainerRef: React.RefObject<HTMLDivElement>;
  onExportPDF: () => void;
}

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
    if (!canvasManager) return false;

    try {
      setIsSaving(true);

      // Get the current state from the render manager
      const renderState = canvasManager.getRenderManager().getState();

      const projectData = {
        title: titleBlockData.projectTitle,
        viewState: {
          longitude: viewState.longitude,
          latitude: viewState.latitude,
          zoom: viewState.zoom,
          pitch: viewState.pitch,
          bearing: viewState.bearing,
          padding: viewState.padding
        },
        selectedPageSize,
        titleBlockData,
        notes,
        canvasState: {
          shapes: drawnLines,
          selectedShape: renderState.selectedShape
        },
        isPublished: isPublishing,
        lastModified: new Date().toISOString()
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

export function EditorNavbar({ 
  onLocationChange,
  canvasManager,
  viewState,
  titleBlockData,
  selectedPageSize,
  notes,
  currentProjectId,
  setCurrentProjectId,
  drawnLines,
  pageContainerRef,
  onExportPDF
}: EditorNavbarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const exportButtonRef = useRef<HTMLButtonElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { saveProject, isSaving } = useProjectSave({
    canvasManager,
    viewState,
    titleBlockData,
    selectedPageSize,
    notes,
    currentProjectId,
    setCurrentProjectId,
    drawnLines
  });

  useEffect(() => {
    // Handle clicks outside of search results and export menu
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
      if (exportButtonRef.current && !exportButtonRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportPDF = async () => {
    if (!pageContainerRef.current) return;

    try {
      const canvas = await html2canvas(pageContainerRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      const contentWidth = pageContainerRef.current.offsetWidth;
      const contentHeight = pageContainerRef.current.offsetHeight;

      // Create PDF with the correct page size
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'in',
        format: selectedPageSize
      });

      // Add the image to the PDF
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0),
        'JPEG',
        0,
        0,
        pdf.internal.pageSize.getWidth(),
        pdf.internal.pageSize.getHeight(),
        undefined,
        'FAST'
      );

      // Download the PDF
      pdf.save('traffic-control-plan.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }

    setShowExportMenu(false);
  };

  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_TOKEN}&country=US`
        );
        const data = await response.json();
        setSearchResults(data.features.map((feature: any) => ({
          id: feature.id,
          place_name: feature.place_name,
          center: feature.center
        })));
        setShowResults(true);
      } catch (error) {
        console.error('Error searching for location:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSearchResultClick = (result: SearchResult) => {
    onLocationChange({
      longitude: result.center[0],
      latitude: result.center[1],
      zoom: 16
    });
    setSearchQuery(result.place_name);
    setShowResults(false);
  };

  const handleSave = async (isPublishing = false) => {
    if (!canvasManager) {
      alert('Cannot save: Canvas is not initialized');
      return;
    }

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Store current state in localStorage before redirecting
      try {
        localStorage.setItem('pendingPublish', JSON.stringify({
          isPublishing,
          state: {
            viewState,
            titleBlockData,
            selectedPageSize,
            notes,
            drawnLines
          }
        }));
      } catch (error) {
        console.error('Error saving state to localStorage:', error);
      }
      
      // Redirect to sign in
      window.location.href = '/signin';
      return;
    }

    try {
      const success = await saveProject(isPublishing);
      
      if (success) {
        alert(isPublishing ? 'Project published successfully!' : 'Project saved successfully!');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert(
        isPublishing 
          ? 'Failed to publish project. Please try again later.' 
          : 'Failed to save project. Please try again later.'
      );
    }
  };

  const handleExport = async () => {
    console.log('Export button clicked');
    setIsExporting(true);
    setShowExportMenu(false);
    
    try {
      console.log('Starting PDF export process');
      await onExportPDF();
      console.log('PDF export completed');
    } catch (error) {
      console.error('Error during PDF export:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="bg-white border-b-4 border-[#1E3A8A] py-1">
        <div className="mx-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-2">
                <SignpostBig className="h-6 w-6 text-[#1E3A8A]" />
                <span className="text-xl font-black text-[#1E3A8A]">MUNICAD</span>
              </Link>

              {/* Search Bar */}
              <div className="relative" ref={searchContainerRef}>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for an address..."
                    className="w-96 pl-8 pr-8 py-1.5 border border-[#1E3A8A] rounded focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                        setShowResults(false);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {showResults && (searchResults.length > 0 || isSearching) && (
                  <div className="absolute z-50 w-full mt-1 bg-white border-2 border-[#1E3A8A] rounded shadow-lg">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-600">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                        Searching...
                      </div>
                    ) : (
                      <ul>
                        {searchResults.map((result) => (
                          <li key={result.id}>
                            <button
                              onClick={() => handleSearchResultClick(result)}
                              className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:outline-none focus:bg-blue-50"
                            >
                              {result.place_name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link 
                to="/home"
                className="flex items-center space-x-1 px-3 py-1.5 hover:bg-gray-100 rounded text-sm"
              >
                <FolderOpen className="w-4 h-4" />
                <span>My Projects</span>
              </Link>

              {/* Export Button */}
              <button
                onClick={() => {
                  console.log('Export button clicked');
                  onExportPDF();
                }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-900 text-white rounded hover:bg-blue-800 text-sm"
              >
                <FileDown className="w-4 h-4" />
                <span>Export as PDF</span>
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded">
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
              <button 
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="bg-[#1E3A8A] text-white px-4 py-1.5 text-sm font-bold hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Publish</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}