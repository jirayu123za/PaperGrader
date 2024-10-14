import create from 'zustand';

interface StudentAssignment {
  assignment_id: string;
  course_code: string;
  course_name?: string;
  assignment_name: string;
  due_date: string;
  release_Date: string;
}

interface AssignmentStore {
  assignments: StudentAssignment[];
  setAssignments: (assignments: StudentAssignment[]) => void;
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  assignments: [],
  setAssignments: (assignments) => set({ assignments }),
}));
