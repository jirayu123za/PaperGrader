import { create } from "zustand";

interface SubmissionsResponse {
    submission_id: string;
    user_name: {
        first_name: string | null;
        last_name: string | null;
        email: string | null;
    };
    section_name: string | null;
    graded_by: string | null;
    score: number | null;
    grade_status: boolean;
}

interface QuestionDataResponse {
    question_title: string;
    question_point: number;
}

interface Submissions {
    submissions: SubmissionsResponse[];
}

interface SubmissionsStore {
    submissions: Submissions | null;
    setSubmissions: (submissions: Submissions) => void;

    questionData: QuestionDataResponse | null;
    setQuestionData: (data: QuestionDataResponse | null) => void;

    searchTerm: string;
    setSearchTerm: (term: string) => void;

    selectedSections: string[];
    setSelectedSections: (sections: string[]) => void;

    selectedGradeStatuses: string[];
    setSelectedGradeStatuses: (statuses: string[]) => void;
}

export const useSubmissionsStore = create<SubmissionsStore>((set) => ({
    submissions: null,
    setSubmissions: (submissions) => set({ submissions }),

    questionData: null,
    setQuestionData: (data) => set({ questionData: data }),

    searchTerm: '',
    setSearchTerm: (term) => set({ searchTerm: term }),

    selectedSections: [],
    setSelectedSections: (sections) => set({ selectedSections: sections }),

    selectedGradeStatuses: [],
    setSelectedGradeStatuses: (statuses) => set({ selectedGradeStatuses: statuses }),
}));
