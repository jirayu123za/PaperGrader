import { create } from "zustand";

interface StudentMatchingData {
    submission_id: string;
    has_assigned: boolean;
    personal_data_id: string | null;
    full_name: string;
    student_code: string;
    section_name: string;
    matched_by: string | null;
    submitted_at: string;
    url_file_name: string;
    url_file_id: string;
}

interface MatchedStudent {
    name: string;
    student_code: string;
}

interface StudentMatchingStore {
    studentMatchingData: StudentMatchingData[];
    setStudentMatchingData: (studentMatchingData: StudentMatchingData[]) => void;

    // Store matched students with submission_id as the key
    matchedStudents: Record<string, MatchedStudent>;
    setMatchedStudent: (submission_id: string, student: MatchedStudent) => void;
    resetMatchedStudents: () => void;

    // search, filter and pagination
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filterStatus: 'All' | 'true' | 'false';
    setFilterStatus: (status: 'All' | 'true' | 'false') => void;
    pageSize: number;
    setPageSize: (size: number) => void;
    isPageChanging: boolean;
    setIsPageChanging: (value: boolean) => void;
}

export const useStudentMatchingStore = create<StudentMatchingStore>((set) => ({
    studentMatchingData: [],
    setStudentMatchingData: (studentMatchingData) => set({ studentMatchingData }),

    // Store matched students with submission_id as the key
    matchedStudents: {},
    setMatchedStudent: (submission_id, student) =>
        set((state) => ({
            matchedStudents: {
                ...state.matchedStudents,
                [submission_id]: student,
            },
        })),
    resetMatchedStudents: () => set({ matchedStudents: {} }),

    // search, filter and pagination
    searchQuery: "",
    setSearchQuery: (query) => set({ searchQuery: query }),
    filterStatus: "All",
    setFilterStatus: (status) => set({ filterStatus: status }),
    pageSize: 5,
    setPageSize: (size) => set({ pageSize: size }),
    isPageChanging: false,
    setIsPageChanging: (value) => set({ isPageChanging: value }),
}));