import React from 'react';
import { ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoibW9iYWxhIiwiYSI6ImNsN2MzdnUyczBja3YzcnBoMmttczNrNmUifQ.EuKfnG_-CrRpAGHPMcC93w';

const samplePlans = [
  {
    title: "Lane Closure",
    description: "Standard lane closure setup for maintenance work on major arterial roads. Includes proper signage placement and buffer zones for worker safety.",
    location: { lat: 40.7128, lng: -74.0060, zoom: 15 }
  },
  {
    title: "Intersection Work",
    description: "Comprehensive traffic control for intersection repairs, including temporary signals and pedestrian detours.",
    location: { lat: 34.0522, lng: -118.2437, zoom: 16 }
  },
  {
    title: "Utility Work",
    description: "Setup for utility maintenance and repairs with lane shifts and equipment staging areas clearly marked.",
    location: { lat: 41.8781, lng: -87.6298, zoom: 15 }
  },
  {
    title: "Special Event",
    description: "Traffic management plan for public events, featuring temporary closures and designated alternate routes.",
    location: { lat: 51.5074, lng: -0.1278, zoom: 14 }
  },
  {
    title: "Emergency Response",
    description: "Rapid deployment traffic control setup for emergency situations requiring immediate road closures.",
    location: { lat: 48.8566, lng: 2.3522, zoom: 15 }
  },
  {
    title: "Construction Zone",
    description: "Long-term construction zone setup with phased traffic management and safety corridors.",
    location: { lat: 35.6762, lng: 139.6503, zoom: 16 }
  }
];

export function SamplePlans() {
  const [currentPlan, setCurrentPlan] = React.useState(0);

  const nextPlan = () => {
    setCurrentPlan((prev) => (prev + 1) % samplePlans.length);
  };

  const prevPlan = () => {
    setCurrentPlan((prev) => (prev - 1 + samplePlans.length) % samplePlans.length);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h2 className="text-4xl font-black mb-12 text-[#1E3A8A]">Sample Traffic Control Plans</h2>
      <div className="relative">
        <div className="bg-white border-4 border-[#1E3A8A] p-8 shadow-[8px_8px_0px_0px_rgba(30,58,138,1)]">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-[500px] border-4 border-[#1E3A8A]">
              <Map
                initialViewState={{
                  latitude: samplePlans[currentPlan].location.lat,
                  longitude: samplePlans[currentPlan].location.lng,
                  zoom: samplePlans[currentPlan].location.zoom
                }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                mapboxAccessToken={MAPBOX_TOKEN}
              >
                <Marker 
                  latitude={samplePlans[currentPlan].location.lat}
                  longitude={samplePlans[currentPlan].location.lng}
                />
              </Map>
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-4 text-[#1E3A8A]">{samplePlans[currentPlan].title}</h3>
              <p className="text-xl mb-8 text-gray-600">{samplePlans[currentPlan].description}</p>
              <button className="bg-[#2563EB] text-white px-6 py-3 font-bold hover:bg-[#1E3A8A] transition-colors flex items-center space-x-2">
                <span>Use This Template</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={prevPlan}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white border-4 border-[#1E3A8A] p-2 hover:bg-gray-100"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextPlan}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white border-4 border-[#1E3A8A] p-2 hover:bg-gray-100"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}