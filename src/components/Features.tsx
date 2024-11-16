import React from 'react';
import { HardHat, Ruler, Construction } from 'lucide-react';

export function Features() {
  return (
    <section className="bg-[#F0F7FF] border-y-8 border-[#1E3A8A] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-black mb-12 text-center text-[#1E3A8A]">Why Choose MuniCAD?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 border-4 border-[#1E3A8A] shadow-[4px_4px_0px_0px_rgba(30,58,138,1)]">
            <Construction className="w-12 h-12 mb-4 text-[#2563EB]" />
            <h3 className="text-xl font-bold mb-2 text-[#1E3A8A]">MUTCD Compliant</h3>
            <p className="text-gray-600">All signs and markings follow the latest MUTCD standards</p>
          </div>
          <div className="bg-white p-6 border-4 border-[#1E3A8A] shadow-[4px_4px_0px_0px_rgba(30,58,138,1)]">
            <Ruler className="w-12 h-12 mb-4 text-[#2563EB]" />
            <h3 className="text-xl font-bold mb-2 text-[#1E3A8A]">Precise Measurements</h3>
            <p className="text-gray-600">Accurate scaling and measurements for professional plans</p>
          </div>
          <div className="bg-white p-6 border-4 border-[#1E3A8A] shadow-[4px_4px_0px_0px_rgba(30,58,138,1)]">
            <HardHat className="w-12 h-12 mb-4 text-[#2563EB]" />
            <h3 className="text-xl font-bold mb-2 text-[#1E3A8A]">Easy to Use</h3>
            <p className="text-gray-600">Intuitive interface designed for professionals</p>
          </div>
        </div>
      </div>
    </section>
  );
}