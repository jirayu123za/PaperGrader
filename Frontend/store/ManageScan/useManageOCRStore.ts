import { create } from "zustand";

interface OCRData {
    submission_id: string;
    is_match: boolean;
    has_assigned: boolean;
    personal_data_id: string | null;
    best_match_name: string;
    best_match_id: string;
    similarity: number;
    submitted_at: string;
    url_name_file: string;
    url_id_file: string;
}

interface MatchedStudent {
    name: string;
    student_code: string;
}

interface ManageOCRStore {
    ocrData: OCRData[];
    setOCRData: (ocrData: OCRData[]) => void;

    matchedStudents: Record<string, MatchedStudent>;
    setMatchedStudent: (submission_id: string, student: MatchedStudent) => void;
    resetMatchedStudents: () => void;
}

export const useManageOCRStore = create<ManageOCRStore>((set) => ({
    ocrData: [],
    setOCRData: (ocrData) => set({ ocrData }),

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