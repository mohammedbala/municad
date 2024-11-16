import React from 'react';
import { SignpostBig, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1E3A8A] text-white border-t-8 border-[#2563EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <SignpostBig className="h-6 w-6" />
              <span className="text-xl font-bold">MUNICAD</span>
            </div>
            <p className="text-blue-200">
              Professional traffic control plan software for modern infrastructure management.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Contact</h4>
            <div className="space-y-2">
              <a href="mailto:info@municad.com" className="flex items-center space-x-2 text-blue-200 hover:text-white">
                <Mail className="w-4 h-4" />
                <span>info@municad.com</span>
              </a>
              <a href="tel:+1234567890" className="flex items-center space-x-2 text-blue-200 hover:text-white">
                <Phone className="w-4 h-4" />
                <span>+1 (234) 567-890</span>
              </a>
              <div className="flex items-center space-x-2 text-blue-200">
                <MapPin className="w-4 h-4" />
                <span>123 Traffic Way, Road City, ST 12345</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-blue-200 hover:text-white">About Us</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white">Documentation</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white">Resources</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-blue-200 hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="text-blue-200 hover:text-white">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-blue-800 mt-12 pt-8 text-center text-blue-200">
          <p>&copy; {new Date().getFullYear()} MuniCAD. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}