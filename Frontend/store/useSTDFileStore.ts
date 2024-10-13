import create from 'zustand';

interface FileStoreState {
  studentFile: File | null;
  setStudentFile: (file: File | null) => void;
}

export const useFileStore = create<FileStoreState>((set) => ({
  studentFile: null,
  setStudentFile: (file) => set({ studentFile: file }),
}));
