import { create } from "zustand";

interface StudentsList {
    personal_data_id: string;
    full_name: string;
    email: string;
    student_code: string;
    has_submission: boolean;
}

interface SubmissionsList {
    submission_id: string;
    section_name: string;
    full_name: string;
    student_code: string;
    has_assigned: boolean;
    submitted_at: string;
    submission_box_files?: string;
    submission_box_urls?: string[];
}

interface StudentsListStore {
    studentsList: StudentsList[];
    setStudentsList: (studentsList: StudentsList[]) => void;
    submissionsList: SubmissionsList[];
    setSubmissionsList: (submissionsList: SubmissionsList[]) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filterStatus: 'All' | 'true' | 'false';
    setFilterStatus: (status: 'All' | 'true' | 'false') => void;
    pageSize: number;
    setPageSize: (size: number) => void;
}

export const useStudentsListStore = create<StudentsListStore>((set) => ({
    studentsList: [],
    setStudentsList: (studentsList) => set({ studentsList }),
    submissionsList: [],
    setSubmissionsList: (submissionsList) => set({ submissionsList }),
    searchQuery: "",
    setSearchQuery: (query) => set({ searchQuery: query }),
    filterStatus: "All",
    setFilterStatus: (status) => set({ filterStatus: status }),
    pageSize: 5,
    setPageSize: (size) => set({ pageSize: size }),
}));
