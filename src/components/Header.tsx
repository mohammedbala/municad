import React from 'react';
import { SignpostBig } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="border-b-8 border-[#1E3A8A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <SignpostBig className="h-8 w-8 text-[#1E3A8A]" />
            <span className="text-2xl font-black text-[#1E3A8A]">MUNICAD</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/signin" 
              className="bg-[#1E3A8A] text-white px-6 py-2 font-bold hover:bg-[#2563EB] transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/home" 
              className="border-2 border-[#1E3A8A] text-[#1E3A8A] px-6 py-2 font-bold hover:bg-blue-50 transition-colors"
            >
              Projects
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}