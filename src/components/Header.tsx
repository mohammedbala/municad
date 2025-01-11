import React, { useState, useEffect } from 'react';
import { SignpostBig, Book } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function Header() {
  const [userSession, setUserSession] = useState<any>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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
              to="/docs" 
              className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded"
            >
              <Book className="w-5 h-5" />
              <span>Documentation</span>
            </Link>
            <Link 
              to="/signin" 
              className="bg-[#1E3A8A] text-white px-6 py-2 font-bold hover:bg-[#2563EB] transition-colors"
            >
              Sign In
            </Link>
            {userSession && (
              <Link 
                to="/home" 
                className="border-2 border-[#1E3A8A] text-[#1E3A8A] px-6 py-2 font-bold hover:bg-blue-50 transition-colors"
              >
                Home
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}