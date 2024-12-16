import { create } from 'zustand';

interface StudentAssignment {
  course_id: string;
  assignment_id: string;
  course_code: string;
  course_name?: string;
  assignment_name: string;
  assignment_description: string;
  cut_off_date: string;
  due_date: string;
  release_Date: string;
  section_name: string;
}

interface AssignmentStore {
  assignments: StudentAssignment[];
  setAssignments: (assignments: StudentAssignment[]) => void;
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  assignments: [],
  setAssignments: (assignments) => set({ assignments }),
}));
