import { create } from "zustand";

interface SubmissionsResponse {
    submission_id: string;
    user_name: {
        first_name: string;
        last_name: string;
        email: string;
    };
    section_name: string;
    graded_by: string;
    score: number;
    grade_status: boolean;
}

interface Submissions {
    submissions: SubmissionsResponse[];
}

interface SubmissionsStore {
    submissions: Submissions | null;
    setSubmissions: (submissions: Submissions) => void;

    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

export const useSubmissionsStore = create<SubmissionsStore>((set) => ({
    submissions: null,
    setSubmissions: (submissions) => set({ submissions }),

    searchTerm: '',
    setSearchTerm: (term) => set({ searchTerm: term }),
}));
