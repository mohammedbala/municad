import React from 'react';
import { Mail, Phone } from 'lucide-react';

export function EditorFooter() {
  return (
    <footer className="bg-[#1E3A8A] text-white border-t-8 border-[#2563EB] py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="text-sm text-blue-200">
            &copy; {new Date().getFullYear()} MuniCAD. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="mailto:info@municad.com" className="flex items-center space-x-2 text-blue-200 hover:text-white">
              <Mail className="w-4 h-4" />
              <span>info@municad.com</span>
            </a>
            <a href="tel:+1234567890" className="flex items-center space-x-2 text-blue-200 hover:text-white">
              <Phone className="w-4 h-4" />
              <span>+1 (234) 567-890</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}