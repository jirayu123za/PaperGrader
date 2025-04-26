import { create } from 'zustand';

interface LeftMainStore {
    activeOption: string | null;
    setActiveOption: (key: string | null) => void;
}

export const useLeftMainStore = create<LeftMainStore>((set) => ({
    activeOption: null,
    setActiveOption: (option) => set({ activeOption: option }),
}));
