import React from 'react';
import { DrawnLine } from './types';
import { 
  Pencil, 
  Type, 
  Square,
  Hexagon, 
  Circle, 
  ArrowRight,
  Ruler,
  Eraser,
  Hand,
  StickyNote,
  FileText,
  MinusSquare,
  Trash2,
  MousePointer,
  Map as MapIcon
} from 'lucide-react';

const tools = [
  { id: 'select', icon: MousePointer, label: 'Select' },
  { id: 'pan', icon: Hand, label: 'Pan' },
  { id: 'line', icon: MinusSquare, label: 'Draw Line' },
  { id: 'arrow', icon: ArrowRight, label: 'Draw Arrow' },
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'polygon', icon: Hexagon, label: 'Polygon' },
  { id: 'draw', icon: Pencil, label: 'Draw' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'circle', icon: Circle, label: 'Circle' },
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

const fonts = [
  { id: 'Arial', label: 'Arial' },
  { id: 'Helvetica', label: 'Helvetica' },
  { id: 'Times New Roman', label: 'Times New Roman' },
  { id: 'Georgia', label: 'Georgia' },
  { id: 'Courier New', label: 'Courier New' },
  { id: 'Verdana', label: 'Verdana' },
  { id: 'Tahoma', label: 'Tahoma' },
  { id: 'Impact', label: 'Impact' }
];

const hatchPatterns = [
  { id: 'none', label: 'No Pattern' },
  { id: 'diagonal', label: 'Diagonal Lines' },
  { id: 'cross', label: 'Cross Hatch' },
  { id: 'horizontal', label: 'Horizontal Lines' },
  { id: 'vertical', label: 'Vertical Lines' },
];

const mapStyles = [
  { id: 'mapbox://styles/mapbox/streets-v12', label: 'Street View' },
  { id: 'mapbox://styles/mapbox/satellite-streets-v12', label: 'Satellite View' },
];

interface ToolbarProps {
  selectedTool: string | null;
  onToolSelect: (tool: string) => void;
  selectedPageSize: string;
  onPageSizeChange: (size: string) => void;
  lineColor: string;
  onLineColorChange: (color: string) => void;
  fillColor: string | null;
  onFillColorChange: (color: string | null) => void;
  fontColor: string;
  onFontColorChange: (color: string) => void;
  lineThickness: number;
  onLineThicknessChange: (thickness: number) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  selectedFeatureId: string | null;
  selectedTextId: string | null;
  onDeleteFeature: () => void;
  hatchPattern: string;
  onHatchPatternChange: (pattern: string) => void;
  selectedShape: DrawnLine | null;
  mapStyle: string;
  onMapStyleChange: (style: string) => void;
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
  fontColor,
  onFontColorChange,
  lineThickness,
  onLineThicknessChange,
  fontSize,
  onFontSizeChange,
  selectedFeatureId,
  selectedTextId,
  onDeleteFeature,
  hatchPattern,
  onHatchPatternChange,
  selectedShape,
  mapStyle,
  onMapStyleChange
}: ToolbarProps) {
  const hasSelection = selectedFeatureId !== null || selectedTextId !== null;
  const isTextSelected = selectedTextId !== null;
  const showTextControls = selectedTool === 'text' || isTextSelected;

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
                <div className="flex items-center">
                  <input
                    type="color"
                    value={fillColor || '#ffffff'}
                    onChange={(e) => onFillColorChange(e.target.value)}
                    className={`w-8 h-8 rounded cursor-pointer ${!fillColor ? 'opacity-50' : ''}`}
                    title="Fill Color"
                    disabled={!fillColor}
                  />
                  <button
                    onClick={() => onFillColorChange(fillColor ? null : '#ffffff')}
                    className={`ml-1 px-2 py-1 text-xs rounded ${
                      !fillColor 
                        ? 'bg-gray-200 text-gray-700' 
                        : 'bg-white text-gray-600 border border-gray-300'
                    }`}
                    title={fillColor ? "Remove Fill" : "Enable Fill"}
                  >
                    {fillColor ? "No Fill" : "Fill"}
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Thickness:</span>
                <input
                  type="number"
                  value={lineThickness}
                  onChange={(e) => onLineThicknessChange(Number(e.target.value))}
                  min={0.25}
                  max={10}
                  step={0.25}
                  className="w-16 px-2 py-1 border-2 border-[#1E3A8A] rounded focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
              {selectedShape && (selectedShape.type === 'rectangle' || selectedShape.type === 'polygon') && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Pattern:</span>
                  <select
                    value={hatchPattern}
                    onChange={(e) => onHatchPatternChange(e.target.value)}
                    className="border-2 border-[#1E3A8A] rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    {hatchPatterns.map((pattern) => (
                      <option key={pattern.id} value={pattern.id}>
                        {pattern.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {showTextControls && (
            <div className="flex items-center space-x-4 border-l-2 border-gray-200 pl-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Font:</span>
                <select
                  className="px-2 py-1 border-2 border-[#1E3A8A] rounded focus:outline-none focus:ring-2 focus:ring-[#2563EB] min-w-[120px]"
                >
                  {fonts.map(font => (
                    <option key={font.id} value={font.id}>{font.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Size:</span>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => onFontSizeChange(Number(e.target.value))}
                  min={8}
                  max={72}
                  step={1}
                  className="w-16 px-2 py-1 border-2 border-[#1E3A8A] rounded focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Color:</span>
                <input
                  type="color"
                  value={fontColor}
                  onChange={(e) => onFontColorChange(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                  title="Font Color"
                />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 border-l-2 border-gray-200 pl-4">
            <MapIcon className="w-5 h-5 text-gray-600" />
            <select
              value={mapStyle}
              onChange={(e) => onMapStyleChange(e.target.value)}
              className="border-2 border-[#1E3A8A] rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              {mapStyles.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>

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