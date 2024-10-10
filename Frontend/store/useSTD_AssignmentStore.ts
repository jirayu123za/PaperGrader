import create from 'zustand';

interface AssignmentStore {
  assignments: {
    assignment_id: string;
    course_code: string;
    course_name?: string;
    assignment_name: string;
    due_date: string;
    release_Date: string;
  }[];
  setAssignments: (assignments: AssignmentStore['assignments']) => void;
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  assignments: [],
  setAssignments: (assignments) => set({ assignments }),
}));
