import React from 'react';
import { Link } from 'react-router-dom';
import { SignpostBig, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import logicDoc from '../docs/LOGIC.md?raw';

export function Documentation() {
  return (
    <div className="min-h-screen bg-[#F0F7FF]">
      {/* Header */}
      <header className="border-b-8 border-[#1E3A8A] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <SignpostBig className="h-8 w-8 text-[#1E3A8A]" />
              <span className="text-2xl font-black text-[#1E3A8A]">MUNICAD</span>
            </Link>
            <Link 
              to="/"
              className="flex items-center space-x-2 text-[#1E3A8A] hover:text-[#2563EB] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Documentation Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border-4 border-[#1E3A8A] rounded-lg p-8 shadow-[8px_8px_0px_0px_rgba(30,58,138,1)] prose prose-blue max-w-none">
          <ReactMarkdown>{logicDoc}</ReactMarkdown>
        </div>
      </main>
    </div>
  );
}