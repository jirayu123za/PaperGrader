import { create } from 'zustand';

interface FileStoreState {
  files: File[];
  setFiles: (files: File[]) => void;
  templateFile: File | null;
  setTemplateFile: (file: File | null) => void;
  clearFiles: () => void;
}

export const useFileStore = create<FileStoreState>((set) => ({
  files: [],
  setFiles: (files) => set({ files }),
  templateFile: null,
  setTemplateFile: (file) => set({ templateFile: file }),
  clearFiles: () => set({ files: [] }),
}));
