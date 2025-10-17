import { create } from "zustand";

interface StudentAssignment {
  course_id: string;
  assignment_id: string;
  course_code: string;
  course_name?: string;
  assignment_name: string;
  assignment_description: string;
  cut_off_date: string | null;
  due_date: string;
  release_date: string;
  section_name: string;
  has_submitted?: boolean;
}

interface AssignmentStore {
  assignments: StudentAssignment[];
  setAssignments: (assignments: StudentAssignment[]) => void;
  updateAssignment: (id: string, updates: Partial<StudentAssignment>) => void; // ✅ เพิ่มตรงนี้
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  assignments: [],
  setAssignments: (assignments) => set({ assignments }),

  // ✅ ฟังก์ชันอัปเดต assignment เดียว
  updateAssignment: (id, updates) =>
    set((state) => ({
      assignments: state.assignments.map((a) =>
        a.assignment_id === id ? { ...a, ...updates } : a
      ),
    })),
}));
