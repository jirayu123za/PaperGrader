import { create } from 'zustand';

interface FileStoreState {
  files: File[];
  setFiles: (files: File[]) => void;
  removeFile: (file: File) => void;
  templateFile: File | null;
  setTemplateFile: (file: File | null) => void;
  clearFiles: () => void;
}

export const useFileStore = create<FileStoreState>((set, get) => ({
  files: [],
  setFiles: (files) => set({ files }),
  removeFile: (file) => {
    const { files: current } = get();
    set({ files: current.filter((f) => f !== file) });
    if (get().templateFile === file) {
      set({ templateFile: null });
    }
  },
  templateFile: null,
  setTemplateFile: (file) => set({ templateFile: file }),
  clearFiles: () => set({ files: [], templateFile: null }),
}));

