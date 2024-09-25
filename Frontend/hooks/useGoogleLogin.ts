import { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

export const useGoogleLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setToken = useAuthStore((state) => state.setToken);

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/auth/google'); // เรียก API จาก backend
      setToken(response.data.token); // เก็บ token ใน Zustand store
      // คุณอาจจะต้องการทำ action อื่นๆ เช่น redirect หรือแสดงข้อความแจ้งเตือน
    } catch (err) {
    } finally {
      setLoading(false); // ปิด loading ไม่ว่าจะสำเร็จหรือไม่
    }
  };

  return { loginWithGoogle, loading, error }; // คืนค่าฟังก์ชันและสถานะต่างๆ
};