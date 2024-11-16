import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the OAuth and magic link response
    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const expiresIn = hashParams.get('expires_in');
      const tokenType = hashParams.get('token_type');

      if (accessToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
          expires_in: parseInt(expiresIn || '36000'),
          token_type: tokenType || 'bearer',
        });

        if (error) {
          console.error('Error setting session:', error);
          navigate('/signin?error=Unable to sign in');
        } else if (data.session) {
          navigate('/create');
        }
      } else {
        // Check if we already have a session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate('/create');
        } else {
          navigate('/signin');
        }
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center">
      <div className="bg-white border-4 border-[#1E3A8A] p-8 shadow-[8px_8px_0px_0px_rgba(30,58,138,1)]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xl font-bold text-[#1E3A8A]">Signing you in...</p>
        </div>
      </div>
    </div>
  );
}