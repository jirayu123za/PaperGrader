import { create } from 'zustand';

interface University {
  university_id: string;
  university_name: string;
}

interface universityState {
  universities: University[];
  setUniversities: (universities: University[]) => void;
}

export const useUniversityStore = create<universityState>((set) => ({
  universities: [],
  setUniversities: (universities) => set(() => ({ universities })),
}));

