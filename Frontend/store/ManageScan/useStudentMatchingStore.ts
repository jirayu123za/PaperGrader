import { create } from "zustand";

interface StudentMatchingData {
    submission_id: string;
    is_match: boolean;
    has_assigned: boolean;
    personal_data_id: string | null;
    full_name: string;
    student_code: string;
    section_name: string;
    best_match_name: string;
    best_match_id: string;
    similarity: number;
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
}));