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
    searchQuery: "",
    setSearchQuery: (query) => set({ searchQuery: query }),
    filterStatus: "All",
    setFilterStatus: (status) => set({ filterStatus: status }),
    pageSize: 5,
    setPageSize: (size) => set({ pageSize: size }),
}));
