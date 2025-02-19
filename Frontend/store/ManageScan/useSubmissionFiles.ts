import { create } from 'zustand';

interface Submission {
    submission_id: string;
    submission_file_name: string;
    submitted_at: string;
}

interface SubmissionFilesStoreState {
    submissions: Submission[];
    setSubmissions: (submissions: Submission[]) => void;
    visibleCount: number;
    setVisibleCount: (count: number) => void;
}

export const useSubmissionFilesStore = create<SubmissionFilesStoreState>((set) => ({
    submissions: [],
    setSubmissions: (submissions) => set({ submissions }),
    visibleCount: 7,
    setVisibleCount: (count) => set({ visibleCount: count }),
}));