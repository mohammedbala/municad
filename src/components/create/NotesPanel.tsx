import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface NotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function NotesPanel({ isOpen, onClose, notes, onNotesChange }: NotesPanelProps) {
  const [height, setHeight] = useState('100%');

  useEffect(() => {
    if (isOpen) {
      // Find the map container and calculate its height
      const mapContainer = document.querySelector('.mapboxgl-map');
      if (mapContainer) {
        const mapHeight = mapContainer.clientHeight;
        setHeight(`${mapHeight}px`);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="absolute top-0 right-0 w-80 bg-white border-l-4 border-[#1E3A8A] shadow-[-4px_0px_0px_0px_rgba(30,58,138,1)]"
      style={{ height }}
    >
      <div className="flex items-center justify-between p-4 border-b-4 border-[#1E3A8A]">
        <h3 className="font-bold text-lg text-[#1E3A8A]">Notes</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <textarea
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Add your notes here..."
        className="w-full h-[calc(100%-64px)] p-4 resize-none focus:outline-none border-none"
      />
    </div>
  );
}