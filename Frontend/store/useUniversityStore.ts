import create from 'zustand';

interface universityState {
  universities: any[];
  setUniversities: (universities: any[]) => void;
}

export const useUniversityStore = create<universityState>((set) => ({
    universities: [], 
    setUniversities: (universities) => set(() => ({ universities })),
  }));

