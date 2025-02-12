import React, { useEffect, useState, useRef } from 'react';
import { Plus, FileText, Calendar, Clock, SignpostBig, UserCircle, LogOut, Trash2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Map from 'react-map-gl';
import { supabase } from '../lib/supabase';
import 'mapbox-gl/dist/mapbox-gl.css';
import { DrawnLine, TitleBlockData } from './create/types';
import { CanvasManager } from './create/canvas/CanvasManager';

const MAPBOX_TOKEN = 'pk.eyJ1IjoibW9iYWxhIiwiYSI6ImNsN2MzdnUyczBja3YzcnBoMmttczNrNmUifQ.EuKfnG_-CrRpAGHPMcC93w';

const DEFAULT_VIEW_STATE = {
  longitude: -118.2426,
  latitude: 34.0549,
  zoom: 14,
  pitch: 0,
  bearing: 0
};

interface Project {
  id: string;
  created_at: string;
  updated_at: string;
  project_data: {
    title: string;
    viewState: {
      longitude: number;
      latitude: number;
      zoom: number;
      pitch: number;
      bearing: number;
      padding: { top: number; bottom: number; left: number; right: number };
    };
    selectedPageSize: string;
    titleBlockData: TitleBlockData;
    notes: string;
    canvasState: {
      shapes: DrawnLine[];
      selectedShape: DrawnLine | null;
    };
    lastModified: string;
  };
}

export function UserHome() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [userSession, setUserSession] = useState<any>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  useEffect(() => {
    async function fetchProjects() {
      try {
        if (!userSession?.user?.id) return;

        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', userSession.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProjects(data || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [userSession]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Handle clicks outside of user menu
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/signin';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to project
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      // Update local state to remove the deleted project
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project');
    }
  };

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedProjects([]);
  };

  const toggleProjectSelection = (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedProjects.length} projects?`)) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .in('id', selectedProjects);

      if (error) throw error;

      setProjects(projects.filter(p => !selectedProjects.includes(p.id)));
      setSelectedProjects([]);
      setIsSelectMode(false);
    } catch (err) {
      console.error('Error deleting projects:', err);
      setError('Failed to delete projects');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF]">
      {/* Top Navigation Bar */}
      <header className="border-b-8 border-[#1E3A8A] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <SignpostBig className="h-8 w-8 text-[#1E3A8A]" />
              <span className="text-2xl font-black text-[#1E3A8A]">MUNICAD</span>
            </Link>
            
            {userSession && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-1.5 hover:bg-gray-100 rounded"
                >
                  <UserCircle className="w-5 h-5 text-[#1E3A8A]" />
                  <span className="text-sm">{userSession.user.email}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-[#1E3A8A] rounded shadow-lg z-50">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left flex items-center space-x-2 hover:bg-blue-50 text-gray-700"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#1E3A8A]">My Projects</h1>
            <p className="text-gray-600 mt-2">Manage your traffic control plans and templates</p>
          </div>
          
          {!loading && !error && projects.length > 0 && (
            <div className="flex items-center gap-4">
              {isSelectMode && selectedProjects.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected ({selectedProjects.length})
                </button>
              )}
              <button
                onClick={toggleSelectMode}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  isSelectMode 
                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                    : 'border-2 border-[#1E3A8A] text-[#1E3A8A] hover:bg-blue-50'
                }`}
              >
                {isSelectMode ? 'Cancel Selection' : 'Select Multiple'}
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* New Project Block */}
            <Link 
              to="/create"
              className="group h-[400px] bg-white border-4 border-dashed border-[#1E3A8A] rounded-lg p-6 flex flex-col items-center justify-center hover:bg-blue-50 transition-colors"
            >
              <div className="w-16 h-16 bg-[#1E3A8A] rounded-full flex items-center justify-center mb-4 group-hover:bg-[#2563EB] transition-colors">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#1E3A8A]">New Project</h3>
              <p className="text-gray-600 text-center mt-2">Create a new traffic control plan</p>
            </Link>

            {/* Project Blocks */}
            {projects.map((project) => (
              <Link
                key={project.id}
                to={isSelectMode ? '#' : `/create?project=${project.id}`}
                className="group relative h-[400px] bg-white border-4 border-[#1E3A8A] rounded-lg overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(30,58,138,1)] transition-all hover:-translate-x-1 hover:-translate-y-1"
                onClick={(e) => isSelectMode && toggleProjectSelection(project.id, e)}
              >
                {/* Add selection overlay */}
                {isSelectMode && (
                  <div className={`absolute inset-0 z-10 bg-white/50 flex items-center justify-center ${
                    selectedProjects.includes(project.id) ? 'bg-blue-100/50' : ''
                  }`}>
                    <CheckCircle2 
                      className={`w-12 h-12 ${
                        selectedProjects.includes(project.id) 
                          ? 'text-[#1E3A8A]' 
                          : 'text-gray-300'
                      }`} 
                    />
                  </div>
                )}

                {/* Map Preview */}
                <div className="h-48 relative">
                  <Map
                    {...(project.project_data?.viewState || DEFAULT_VIEW_STATE)}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="mapbox://styles/mapbox/streets-v12"
                    mapboxAccessToken={MAPBOX_TOKEN}
                    interactive={false}
                    onLoad={(evt) => {
                      // Get the actual Mapbox map instance from the event
                      const map = evt.target;
                      
                      // Create and position canvas overlay
                      const canvas = document.createElement('canvas');
                      canvas.style.position = 'absolute';
                      canvas.style.top = '0';
                      canvas.style.left = '0';
                      canvas.style.width = '100%';
                      canvas.style.height = '100%';
                      canvas.style.pointerEvents = 'none';
                      
                      // Add canvas to map container
                      const container = map.getContainer();
                      container.appendChild(canvas);
                      
                      // Initialize canvas manager
                      const canvasManager = new CanvasManager(canvas, map);
                      
                      // Set the shapes from project data
                      if (project.project_data?.canvasState?.shapes) {
                        const renderManager = canvasManager.getRenderManager();
                        renderManager.setShapes(
                          project.project_data.canvasState.shapes,
                          project.project_data.canvasState.selectedShape?.id || null
                        );
                        renderManager.render();
                      }

                      // Clean up on unmount
                      return () => {
                        canvasManager.cleanup();
                        container.removeChild(canvas);
                      };
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20" />
                </div>

                {/* Project Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <FileText className="w-8 h-8 text-[#1E3A8A]" />
                    <button 
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete project"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-[#1E3A8A] mb-4">
                    {project.project_data?.title || 'Untitled Project'}
                  </h3>
                  <div className="mt-auto space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Created {formatDate(project.created_at)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Modified {formatDate(project.updated_at || project.created_at)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Empty State */}
            {projects.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">No projects yet. Create your first project to get started!</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}