import React from 'react';
import { ChevronRight, ChevronLeft, SignpostBig, Loader2 } from 'lucide-react';
import { useTrafficSigns } from './trafficSigns';

export function Sidebar({ isOpen, onToggle }) {
  const { signs, loading, error } = useTrafficSigns();

  const onDragStart = (e, sign) => {
    e.dataTransfer.setData('application/json', JSON.stringify(sign));
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <Loader2 className="w-8 h-8 text-[#1E3A8A] animate-spin" />
          <p className="mt-2 text-gray-600">Loading signs...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <p className="text-red-500 text-center">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-[#1E3A8A] text-white rounded hover:bg-[#2563EB]"
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        {signs.map((sign) => (
          <div
            key={sign.id}
            draggable
            onDragStart={(e) => onDragStart(e, sign)}
            className="border-2 border-[#1E3A8A] p-2 rounded cursor-move hover:bg-blue-50 transition-colors"
          >
            <img 
              src={sign.url} 
              alt={sign.name} 
              className="w-full h-auto"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/100x100?text=Error';
              }}
            />
            <p className="text-xs mt-1 text-center text-gray-600">{sign.name}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div 
      className={`
        ${isOpen ? 'w-64' : 'w-12'} 
        transition-all duration-300 
        relative bg-white 
        border-r-4 border-[#1E3A8A] 
        flex flex-col 
        overflow-hidden
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`
          flex items-center justify-center
          h-12 w-12
          hover:bg-gray-100
          transition-colors
          ${isOpen ? 'absolute right-0' : ''}
        `}
      >
        {isOpen ? (
          <ChevronLeft className="w-6 h-6 text-[#1E3A8A]" />
        ) : (
          <>
            <SignpostBig className="w-6 h-6 text-[#1E3A8A]" />
            <ChevronRight className="w-4 h-4 text-[#1E3A8A] absolute -right-3 top-4" />
          </>
        )}
      </button>

      {/* Sidebar Content - Only shown when open */}
      {isOpen && (
        <>
          <div className="p-4 border-b-4 border-[#1E3A8A] mt-12">
            <h2 className="font-bold text-lg text-[#1E3A8A]">Traffic Signs</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {renderContent()}
          </div>
        </>
      )}
    </div>
  );
}