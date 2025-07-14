import { create } from 'zustand';

interface Student {
  student_id: string;
  student_name: string;
}

interface StudentListState {
  studentList: Student[];
  setStudentList: (list: Student[]) => void;
}

export const useStudentListStore = create<StudentListState>((set) => ({
  studentList: [],
  setStudentList: (list) => set({ studentList: list }),
}));