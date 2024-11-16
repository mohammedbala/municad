import React from 'react';
import { X, Monitor, Moon, Sun, Globe, Palette } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
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