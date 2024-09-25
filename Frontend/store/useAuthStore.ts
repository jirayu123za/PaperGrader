import create from 'zustand';

interface AuthState {
  token: string | null;
  email: string | null; // เพิ่ม email state
  setToken: (token: string) => void;
  setEmail: (email: string) => void; // เพิ่มฟังก์ชัน setEmail
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  email: null, // กำหนดค่าเริ่มต้นของ email
  setToken: (token) => set({ token }),
  setEmail: (email) => set({ email }), // ฟังก์ชันสำหรับตั้งค่า email
  clearAuth: () => set({ token: null, email: null }),
}));
