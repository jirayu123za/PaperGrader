import create from 'zustand';

interface Section {
  id: string;
  name: string;
  studentCount: number;
}

interface ManageSectionStore {
  sections: Section[];
  setSections: (sections: Section[]) => void;
}

export const useManageSectionStore = create<ManageSectionStore>((set) => ({
  sections: [],
  setSections: (sections) => set({ sections }),
}));
