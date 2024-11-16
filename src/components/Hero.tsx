import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-6xl font-black leading-tight mb-6 text-[#1E3A8A]">
            Create Professional Traffic Control Plans
          </h1>
          <p className="text-xl mb-8 text-gray-600">
            Design MUTCD-compliant traffic control plans and highway signs with our intuitive software. Perfect for municipalities and contractors.
          </p>
          <Link to="/create" className="inline-block">
            <button className="bg-[#2563EB] text-white px-8 py-4 text-xl font-bold hover:bg-[#1E3A8A] transition-colors shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] border-2 border-[#1E3A8A] flex items-center space-x-2">
              <span>Create Your Plan</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </Link>
        </div>
        <div className="relative">
          <div className="bg-[#DBEAFE] border-8 border-[#1E3A8A] p-8 rotate-2 shadow-[8px_8px_0px_0px_rgba(30,58,138,1)]">
            <img
              src="https://illustrations.popsy.co/sky/woman-with-a-laptop.svg"
              alt="Traffic Control Plan Software"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}