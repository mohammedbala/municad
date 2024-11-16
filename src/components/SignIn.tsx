import React, { useState, useEffect } from 'react';
import { SignpostBig, Mail, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function SignIn() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/create');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        navigate('/create');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: 'https://frabjous-mochi-76a867.netlify.app/auth/callback',
        },
      });

      if (error) {
        throw error;
      }

      setStatus('sent');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message || 'Failed to send magic link');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://frabjous-mochi-76a867.netlify.app/auth/callback',
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message || 'Failed to sign in with Google');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex flex-col">
      {/* Header */}
      <header className="border-b-8 border-[#1E3A8A] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/" className="flex items-center space-x-2">
            <SignpostBig className="h-8 w-8 text-[#1E3A8A]" />
            <span className="text-2xl font-black text-[#1E3A8A]">MUNICAD</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          {/* Sign In Card */}
          <div className="bg-white border-4 border-[#1E3A8A] p-8 shadow-[8px_8px_0px_0px_rgba(30,58,138,1)]">
            <h2 className="text-3xl font-bold text-[#1E3A8A] mb-6">Sign In</h2>

            {status === 'sent' ? (
              <div className="text-center py-4">
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-4">
                  <p className="text-green-700">Check your email for the magic link!</p>
                </div>
                <button
                  onClick={() => setStatus('idle')}
                  className="text-[#1E3A8A] hover:underline"
                >
                  Try another email
                </button>
              </div>
            ) : (
              <>
                {/* Error Message */}
                {status === 'error' && (
                  <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-4">
                    <p className="text-red-700">{errorMessage}</p>
                  </div>
                )}

                {/* Email Form */}
                <form onSubmit={handleEmailSubmit} className="mb-6">
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 border-2 border-[#1E3A8A] rounded focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-[#1E3A8A] text-white p-3 rounded font-bold hover:bg-[#2563EB] transition-colors flex items-center justify-center space-x-2"
                  >
                    <Mail className="w-5 h-5" />
                    <span>{status === 'loading' ? 'Sending...' : 'Send Magic Link'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-sm text-gray-500">Or continue with</span>
                  </div>
                </div>

                {/* Google Sign In */}
                <button 
                  onClick={handleGoogleSignIn}
                  className="w-full border-2 border-[#1E3A8A] p-3 rounded font-bold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </>
            )}
          </div>

          {/* Footer Text */}
          <p className="text-center mt-6 text-sm text-gray-600">
            By signing in, you agree to our{' '}
            <a href="#" className="text-[#1E3A8A] hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-[#1E3A8A] hover:underline">Privacy Policy</a>
          </p>
        </div>
      </main>
    </div>
  );
}