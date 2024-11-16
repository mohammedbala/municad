import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface TextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, size: number, color: string) => void;
  initialText?: string;
  initialSize?: number;
  initialColor?: string;
  isEditing?: boolean;
}

export function TextModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  initialText = '',
  initialSize = 16,
  initialColor = '#1E3A8A',
  isEditing = false
}: TextModalProps) {
  const [text, setText] = useState(initialText);
  const [size, setSize] = useState(initialSize);
  const [color, setColor] = useState(initialColor);

  useEffect(() => {
    setText(initialText);
    setSize(initialSize);
    setColor(initialColor);
  }, [initialText, initialSize, initialColor]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text, size, color);
      setText('');
      setSize(16);
      setColor('#1E3A8A');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-lg border-4 border-[#1E3A8A] shadow-[8px_8px_0px_0px_rgba(30,58,138,1)]">
        <div className="flex items-center justify-between p-4 border-b-4 border-[#1E3A8A]">
          <h2 className="text-xl font-bold text-[#1E3A8A]">
            {isEditing ? 'Edit Text' : 'Add Text'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="text-content" className="block text-sm font-medium text-gray-700 mb-1">
              Text Content
            </label>
            <input
              id="text-content"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-2 border-2 border-[#1E3A8A] rounded focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              placeholder="Enter text..."
              required
            />
          </div>

          <div>
            <label htmlFor="text-size" className="block text-sm font-medium text-gray-700 mb-1">
              Text Size (px)
            </label>
            <input
              id="text-size"
              type="number"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              min="8"
              max="72"
              className="w-full p-2 border-2 border-[#1E3A8A] rounded focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <label htmlFor="text-color" className="block text-sm font-medium text-gray-700 mb-1">
              Text Color
            </label>
            <input
              id="text-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#1E3A8A] hover:bg-gray-100 rounded font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#1E3A8A] text-white rounded font-medium hover:bg-[#2563EB] transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Add Text'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}