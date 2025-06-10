import { create } from 'zustand';

interface SubmissionsList {
    submission_id: string;
    file_name: string;
    submitted_at: string;
    total_submissions: number;
    submitted_by: string;
}

interface SubmissionFilesStoreState {
    submissionsList: SubmissionsList[];
    setSubmissionsList: (submissions: SubmissionsList[]) => void;
}

export const useSubmissionFilesStore = create<SubmissionFilesStoreState>((set) => ({
    submissionsList: [],
    setSubmissionsList: (submissionsList) => set({ submissionsList }),
}));