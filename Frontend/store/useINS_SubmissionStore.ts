import { create } from 'zustand';

interface Submission {
  submission_id: string;
  submitted_at: string;
  personal_data_id: string;
  student_code: string;
  full_name: string;
  email: string;
  section_name: string;
}

interface INSSubmissionStoreState {
  submissions: Submission[];
  setSubmissions: (submissions: Submission[]) => void;
  clearSubmissions: () => void;

  searchTerm: string;
  setSearchTerm: (term: string) => void;
  // submissionFilter: string | null;
  // setSubmissionFilter: (role: string | null) => void;
}

export const useINS_SubmissionStore = create<INSSubmissionStoreState>((set) => ({
  submissions: [],
  setSubmissions: (submissions) => set({ submissions }),
  clearSubmissions: () => set({ submissions: [] }),

  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),
  // submissionFilter: null,
  // setSubmissionFilter: (role) => set({ submissionFilter: role }),
}));
