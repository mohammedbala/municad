import React from 'react';
import { 
  Pencil, 
  Type, 
  Square,
  Hexagon, 
  Circle, 
  ArrowRight as Arrow, 
  Ruler,
  Eraser,
  Hand,
  StickyNote,
  FileText,
  MinusSquare,
  Trash2
} from 'lucide-react';

const tools = [
  { id: 'pan', icon: Hand, label: 'Pan' },
  { id: 'line', icon: MinusSquare, label: 'Draw Line' },
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'polygon', icon: Hexagon, label: 'Polygon' },
  { id: 'draw', icon: Pencil, label: 'Draw' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'arrow', icon: Arrow, label: 'Arrow' },
  { id: 'measure', icon: Ruler, label: 'Measure' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
  { id: 'notes', icon: StickyNote, label: 'Notes' },
];

const pageSizes = [
  { id: '8.5x11', label: '11" × 8.5" (Landscape)' },
  { id: '11x17', label: '17" × 11" (Landscape)' },
  { id: '24x36', label: '36" × 24" (Landscape)' },
  { id: '30x42', label: '42" × 30" (Landscape)' },
];

interface ToolbarProps {
  selectedTool: string | null;
  onToolSelect: (tool: string) => void;
  selectedPageSize: string;
  onPageSizeChange: (size: string) => void;
  lineColor: string;
  onLineColorChange: (color: string) => void;
  fillColor: string;
  onFillColorChange: (color: string) => void;
  selectedFeatureId: string | null;
  selectedTextId: string | null;
  onDeleteFeature: () => void;
}

export function Toolbar({
  selectedTool,
  onToolSelect,
  selectedPageSize,
  onPageSizeChange,
  lineColor,
  onLineColorChange,
  fillColor,
  onFillColorChange,
  selectedFeatureId,
  selectedTextId,
  onDeleteFeature
}: ToolbarProps) {
  const hasSelection = selectedFeatureId !== null || selectedTextId !== null;

  return (
    <div className="mx-4">
      <div className="bg-white border-4 border-[#1E3A8A] rounded-lg p-2 flex justify-between items-center mt-4 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)]">
        <div className="flex space-x-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className={`p-2 rounded hover:bg-gray-100 relative group ${
                selectedTool === tool.id ? 'bg-blue-100' : ''
              }`}
            >
              <tool.icon className="w-6 h-6" />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {tool.label}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          {selectedFeatureId && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Line:</span>
                <input
                  type="color"
                  value={lineColor}
                  onChange={(e) => onLineColorChange(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                  title="Line Color"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Fill:</span>
                <input
                  type="color"
                  value={fillColor}
                  onChange={(e) => onFillColorChange(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                  title="Fill Color"
                />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 border-l-2 border-gray-200 pl-4">
            <FileText className="w-5 h-5 text-gray-600" />
            <select
              value={selectedPageSize}
              onChange={(e) => onPageSizeChange(e.target.value)}
              className="border-2 border-[#1E3A8A] rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              {pageSizes.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>

          {hasSelection && (
            <div className="border-l-2 border-gray-200 pl-4">
              <button
                onClick={onDeleteFeature}
                className="p-2 rounded hover:bg-red-50 text-red-600 group relative"
              >
                <Trash2 className="w-6 h-6" />
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Delete Selected
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}