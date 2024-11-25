import create from 'zustand';

interface CustomizeTimeState {
  sections: string[];
  releaseDate: string | null;
  dueDate: string | null;
  cutOffDate: string | null;
  setSections: (sections: string[]) => void;
  setDates: (dates: { releaseDate: string | null; dueDate: string | null; cutOffDate: string | null }) => void;
}

export const useCustomizeTimeStore = create<CustomizeTimeState>((set) => ({
  sections: [],
  releaseDate: null,
  dueDate: null,
  cutOffDate: null,
  setSections: (sections) => set({ sections }),
  setDates: ({ releaseDate, dueDate, cutOffDate }) =>
    set({ releaseDate, dueDate, cutOffDate }),
}));
