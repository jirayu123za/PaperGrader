import { create } from "zustand";

interface StudentSubmissionFile {
  submission_file_url: string;
}

interface StudentSubmissionFileStore {
  submissionFile: StudentSubmissionFile | null;
  setSubmissionFile: (file: StudentSubmissionFile) => void;
  clearSubmissionFile: () => void;
}

export const useSTD_SubmissionFileStore = create<StudentSubmissionFileStore>((set) => ({
  submissionFile: null,

  setSubmissionFile: (file) => set({ submissionFile: file }),

  clearSubmissionFile: () => set({ submissionFile: null }),
}));
