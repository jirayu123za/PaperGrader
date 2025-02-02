import { create } from 'zustand';

interface TemplateStore {
    selectedTemplate: number | null;
    setSelectedTemplate: (id: number) => void;
}

const useTemplateStore = create<TemplateStore>((set) => ({
    selectedTemplate: null,
    setSelectedTemplate: (id) => set({ selectedTemplate: id }),
}));

export default useTemplateStore;
