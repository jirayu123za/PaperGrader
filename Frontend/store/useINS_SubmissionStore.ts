import create from 'zustand';

interface INSSubmissionStoreState {
  submissions: string[];   // เก็บรายการไฟล์ของ submissions
  urls: string[];          // เก็บ URL ของไฟล์ที่สามารถดาวน์โหลดได้
  setSubmissions: (files: string[], urls: string[]) => void;
  clearSubmissions: () => void;
}

export const useINS_SubmissionStore = create<INSSubmissionStoreState>((set) => ({
  submissions: [],
  urls: [],
  setSubmissions: (files, urls) => set({ submissions: files, urls: urls }),
  clearSubmissions: () => set({ submissions: [], urls: [] }),
}));
