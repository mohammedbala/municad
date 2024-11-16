import React from 'react';
import { CalendarIcon, RulerIcon } from 'lucide-react';

interface TitleBlockData {
  projectTitle: string;
  projectSubtitle: string;
  designer: string;
  checker: string;
  scale: string;
  date: string;
  drawingNumber: string;
}

interface TitleBlockProps {
  data: TitleBlockData;
  onChange: (data: TitleBlockData) => void;
}

export function TitleBlock({ data, onChange }: TitleBlockProps) {
  const handleChange = (field: keyof TitleBlockData, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="h-[120px] border-t-4 border-[#1E3A8A] grid grid-cols-12 gap-0.5 bg-gray-100">
      {/* Main Title Section */}
      <div className="col-span-6 bg-white p-3 border border-gray-300">
        <input
          type="text"
          value={data.projectTitle}
          onChange={(e) => handleChange('projectTitle', e.target.value)}
          className="w-full text-xl font-bold text-[#1E3A8A] bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#2563EB]"
        />
        <input
          type="text"
          value={data.projectSubtitle}
          onChange={(e) => handleChange('projectSubtitle', e.target.value)}
          className="w-full mt-1 text-sm text-gray-600 bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#2563EB]"
        />
      </div>

      {/* Project Info Section */}
      <div className="col-span-4 bg-white p-3 border border-gray-300">
        <div className="space-y-1">
          <div className="flex items-center">
            <span className="w-16 text-xs text-gray-600">Designer:</span>
            <input
              type="text"
              value={data.designer}
              onChange={(e) => handleChange('designer', e.target.value)}
              className="flex-1 text-sm bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#2563EB]"
            />
          </div>
          <div className="flex items-center">
            <span className="w-16 text-xs text-gray-600">Checker:</span>
            <input
              type="text"
              value={data.checker}
              onChange={(e) => handleChange('checker', e.target.value)}
              className="flex-1 text-sm bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>
      </div>

      {/* Drawing Info Section */}
      <div className="col-span-2 bg-white p-3 border border-gray-300">
        <div className="space-y-1">
          <div className="flex items-center">
            <RulerIcon className="w-3 h-3 mr-1 text-gray-600" />
            <input
              type="text"
              value={data.scale}
              onChange={(e) => handleChange('scale', e.target.value)}
              className="flex-1 text-sm bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#2563EB]"
            />
          </div>
          <div className="flex items-center">
            <CalendarIcon className="w-3 h-3 mr-1 text-gray-600" />
            <input
              type="text"
              value={data.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="flex-1 text-sm bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#2563EB]"
            />
          </div>
          <div className="flex items-center">
            <span className="text-xs text-gray-600 mr-1">#</span>
            <input
              type="text"
              value={data.drawingNumber}
              onChange={(e) => handleChange('drawingNumber', e.target.value)}
              className="flex-1 text-sm bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}