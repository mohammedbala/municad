import React, { useEffect, useState } from 'react';
import { Plus, FileText, Calendar, Clock, SignpostBig } from 'lucide-react';
import { Link } from 'react-router-dom';
import Map from 'react-map-gl';
import { supabase } from '../lib/supabase';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoibW9iYWxhIiwiYSI6ImNsN2MzdnUyczBja3YzcnBoMmttczNrNmUifQ.EuKfnG_-CrRpAGHPMcC93w';
const FIXED_USER_ID = '09f43a49-a67f-4945-9fac-909f333f8d8b';

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
  project_data: {
    title: string;
    viewState?: {
      longitude: number;
      latitude: number;
      zoom: number;
      pitch: number;
      bearing: number;
    };
    features?: {
      type: string;
      features: any[];
    };
    signMarkers?: Array<{
      id: string;
      sign: {
        url: string;
        name: string;
      };
      lngLat: {
        lng: number;
        lat: number;
      };
    }>;
  };
}

export function UserHome() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', FIXED_USER_ID)
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
  }, []);

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

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
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1E3A8A]">My Projects</h1>
          <p className="text-gray-600 mt-2">Manage your traffic control plans and templates</p>
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
                to={`/create?project=${project.id}`}
                className="group h-[400px] bg-white border-4 border-[#1E3A8A] rounded-lg overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(30,58,138,1)] transition-all hover:-translate-x-1 hover:-translate-y-1"
              >
                {/* Map Preview */}
                <div className="h-48 relative">
                  <Map
                    {...(project.project_data?.viewState || DEFAULT_VIEW_STATE)}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="mapbox://styles/mapbox/streets-v12"
                    mapboxAccessToken={MAPBOX_TOKEN}
                    interactive={false}
                  >
                    {project.project_data?.signMarkers?.map((marker) => (
                      <div
                        key={marker.id}
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <img
                          src={marker.sign.url}
                          alt={marker.sign.name}
                          className="w-6 h-6"
                        />
                      </div>
                    ))}
                  </Map>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20" />
                </div>

                {/* Project Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <FileText className="w-8 h-8 text-[#1E3A8A]" />
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 text-sm text-[#1E3A8A] hover:bg-blue-50 rounded">
                      •••
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
                      <span>Modified {formatDate(project.created_at)}</span>
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