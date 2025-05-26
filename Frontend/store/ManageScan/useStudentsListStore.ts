import { create } from "zustand";

interface Student {
    personal_data_id: string;
    full_name: string;
    email: string;
    student_code: string;
}

interface StudentsListStore {
    withSubmission: Student[];
    withoutSubmission: Student[];
    setWithSubmission: (students: Student[]) => void;
    setWithoutSubmission: (students: Student[]) => void;
}

export const useStudentsListStore = create<StudentsListStore>((set) => ({
    withSubmission: [],
    withoutSubmission: [],
    setWithSubmission: (students) => set({ withSubmission: students }),
    setWithoutSubmission: (students) => set({ withoutSubmission: students }),
}));