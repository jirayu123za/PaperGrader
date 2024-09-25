import create from 'zustand';

interface UserState {
  user: any | null; // สามารถกำหนดประเภทข้อมูลให้เหมาะสม
  setUser: (user: any) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set(() => ({ user })),
  isLoading: false,
  setIsLoading: (isLoading) => set(() => ({ isLoading })),
  error: null,
  setError: (error) => set(() => ({ error })),
}));
