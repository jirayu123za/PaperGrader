// useGoogleLogin.ts
import { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { useModalStore } from '../store/useModalStore'; // Import useModalStore

export const useGoogleLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setToken = useAuthStore((state) => state.setToken);
  const setEmail = useAuthStore((state) => state.setEmail); 
  const openSignIn = useModalStore((state) => state.openSignIn); // เรียกฟังก์ชันเปิด SignIn modal

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/auth/google'); // เรียก API จาก backend
      setToken(response.data.token); // เก็บ token ใน Zustand store
      setEmail(response.data.email); // เก็บ email ใน Zustand store
      openSignIn(); // เปิด SignIn modal แทนการ redirect
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false); // ปิด loading ไม่ว่าจะสำเร็จหรือไม่
    }
  };

  return { loginWithGoogle, loading, error }; // คืนค่าฟังก์ชันและสถานะต่างๆ
};
