import { create } from "zustand";

interface StudentsList {
    personal_data_id: string;
    full_name: string;
    email: string;
    student_code: string;
    has_submission: boolean;
}

interface StudentsListStore {
    studentsList: StudentsList[];
    setStudentsList: (studentsList: StudentsList[]) => void;
    pageSize: number;
    setPageSize: (size: number) => void;
}

export const useStudentsListStore = create<StudentsListStore>((set) => ({
    studentsList: [],
    setStudentsList: (studentsList) => set({ studentsList }),
    pageSize: 5,
    setPageSize: (size) => set({ pageSize: size }),
}));