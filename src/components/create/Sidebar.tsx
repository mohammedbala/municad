import React from 'react';
import { ChevronRight, ChevronLeft, SignpostBig, Loader2 } from 'lucide-react';

import { getTrafficSignIcons, getTrafficSymbolIcons, IconItem } from '../create/utils/iconUtils.ts'

export function Sidebar({ isOpen, onToggle }) {

  const trafficSigns = getTrafficSignIcons();
  const trafficSymbols = getTrafficSymbolIcons();

  const onDragStart = (e: React.DragEvent, item: IconItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';

    // Create a drag image
    const dragImage = document.createElement('img');
    dragImage.src = item.path;
    dragImage.className = 'w-8 h-8';
    dragImage.style.opacity = '0.7';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 20, 20);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const renderSignSection = (title: string, items: IconItem[]) => (
    <>
      <div className="p-4 border-b-4 border-[#1E3A8A]">
        <h2 className="font-bold text-lg text-[#1E3A8A]">{title}</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 p-4">
        {items.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => onDragStart(e, item)}
            className="border-2 border-[#1E3A8A] p-2 rounded cursor-move hover:bg-blue-50 transition-colors"
          >
            <img 
              src={item.path} 
              alt={item.name} 
              className="w-full h-auto"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/100x100?text=Error';
              }}
            />
            <p className="text-xs mt-1 text-center text-gray-600">{item.name}</p>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div 
      className={`
        ${isOpen ? 'w-64' : 'w-12'} 
        transition-all duration-300 
        relative bg-white 
        border-r-4 border-[#1E3A8A] 
        flex flex-col 
        overflow-hidden
        flex-shrink-0
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
        <div className="mt-12 flex-1 overflow-y-auto">
          {renderSignSection("Traffic Symbols", trafficSymbols)}
          {renderSignSection("Traffic Signs", trafficSigns)}
        </div>
      )}
    </div>
  );
}