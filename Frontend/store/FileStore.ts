import create from 'zustand';

interface FileStoreState {
  files: File[];
  setFiles: (files: File[]) => void;
  addFile: (file: File) => void;
  removeFile: (fileName: string) => void;
  templateFile: File | null;
  setTemplateFile: (file: File | null) => void;
}

export const useFileStore = create<FileStoreState>((set) => ({
  files: [],
  setFiles: (files) => set({ files }),
  addFile: (file) =>
    set((state) => ({
      files: [...state.files, file],
    })),
  removeFile: (fileName) =>
    set((state) => ({
      files: state.files.filter((file) => file.name !== fileName),
    })),
  templateFile: null,
  setTemplateFile: (file) => set({ templateFile: file }),
}));
