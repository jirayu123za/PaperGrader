import { create } from 'zustand';

interface ReceiveFileStoreState {
  studentFile: File | null;
  setStudentFile: (file: File | null) => void;
}

export const useReceiveFileStore = create<ReceiveFileStoreState>((set) => ({
  studentFile: null,
  setStudentFile: (file) => set({ studentFile: file }),
}));
