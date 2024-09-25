import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export const useGoogleLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setToken = useAuthStore((state) => state.setToken);
  
  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      window.location.href = '/api/api/google';
    } catch (err) {
      setError('Failed to initiate Google login');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { loginWithGoogle, loading, error };
};