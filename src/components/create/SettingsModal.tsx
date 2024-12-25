import React from 'react';
import { X, Monitor, Moon, Sun, Globe, Palette } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  units: 'imperial' | 'metric';
  onUnitsChange: (units: 'imperial' | 'metric') => void;
}

export function SettingsModal({ isOpen, onClose, units, onUnitsChange }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-lg border-4 border-[#1E3A8A] shadow-[8px_8px_0px_0px_rgba(30,58,138,1)]">
        <div className="flex items-center justify-between p-4 border-b-4 border-[#1E3A8A]">
          <h2 className="text-xl font-bold text-[#1E3A8A]">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Theme Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              <span>Theme</span>
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <button className="flex flex-col items-center gap-2 p-3 border-2 border-[#1E3A8A] rounded hover:bg-blue-50 transition-colors">
                <Sun className="w-6 h-6" />
                <span className="text-sm">Light</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-3 border-2 border-[#1E3A8A] rounded hover:bg-blue-50 transition-colors">
                <Moon className="w-6 h-6" />
                <span className="text-sm">Dark</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-3 border-2 border-[#1E3A8A] rounded hover:bg-blue-50 transition-colors">
                <Monitor className="w-6 h-6" />
                <span className="text-sm">System</span>
              </button>
            </div>
          </div>

          {/* Map Style Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <span>Map Style</span>
            </h3>
            <select className="w-full p-2 border-2 border-[#1E3A8A] rounded focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
              <option value="streets-v12">Streets</option>
              <option value="satellite-v9">Satellite</option>
              <option value="light-v11">Light</option>
              <option value="dark-v11">Dark</option>
            </select>
          </div>

          {/* Units Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"/>
                <path d="M12 4V22"/>
                <path d="M7 8H9"/>
                <path d="M15 8H17"/>
                <path d="M7 12H9"/>
                <path d="M15 12H17"/>
                <path d="M7 16H9"/>
                <path d="M15 16H17"/>
              </svg>
              <span>Units</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                className={`flex flex-col items-center gap-2 p-3 border-2 border-[#1E3A8A] rounded hover:bg-blue-50 transition-colors ${
                  units === 'imperial' ? 'bg-blue-50' : ''
                }`}
                onClick={() => onUnitsChange('imperial')}
              >
                <span className="text-sm">Imperial</span>
                <span className="text-xs text-gray-500">mi, ft</span>
              </button>
              <button 
                className={`flex flex-col items-center gap-2 p-3 border-2 border-[#1E3A8A] rounded hover:bg-blue-50 transition-colors ${
                  units === 'metric' ? 'bg-blue-50' : ''
                }`}
                onClick={() => onUnitsChange('metric')}
              >
                <span className="text-sm">Metric</span>
                <span className="text-xs text-gray-500">km, m</span>
              </button>
            </div>
          </div>

          {/* Color Scheme Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              <span>Default Colors</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line Color
                </label>
                <input
                  type="color"
                  className="w-full h-10 rounded cursor-pointer"
                  defaultValue="#1E3A8A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fill Color
                </label>
                <input
                  type="color"
                  className="w-full h-10 rounded cursor-pointer"
                  defaultValue="#2563EB"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t-4 border-[#1E3A8A] p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#1E3A8A] hover:bg-gray-100 rounded font-medium transition-colors"
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-[#1E3A8A] text-white rounded font-medium hover:bg-[#2563EB] transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}