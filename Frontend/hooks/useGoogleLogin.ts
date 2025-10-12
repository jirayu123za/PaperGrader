"use client";

import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { API_BASE, api, qf } from '@/src/lib/api';

export const useGoogleLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setToken = useAuthStore((state) => state.setToken);
  
  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      window.location.href = `${API_BASE}/google`;
    } catch (err) {
      setError('Failed to initiate Google login');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { loginWithGoogle, loading, error };
};