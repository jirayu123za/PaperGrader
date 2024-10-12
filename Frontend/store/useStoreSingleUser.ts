import create from 'zustand';

interface UserStore {
  first_name: string;
  last_name: string;
  email: string;
  studentId?: string;
  role: string;
  notifyUser: boolean;
  setUser: (user: Partial<UserStore>) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  first_name: '',
  last_name: '',
  email: '',
  studentId: '',
  role: '',
  notifyUser: false,
  setUser: (user) => set((state) => ({ ...state, ...user })),
}));
