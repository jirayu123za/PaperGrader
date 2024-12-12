import { create } from 'zustand';

interface Assignment {
  assignment_id: string;
  assignment_name: string;
  assignment_release_date: string;
  assignment_due_date: string;
  assignment_cut_off_date: string;
  published: boolean;
  regrades: boolean;
  submiss_by: string;
}

interface AssignmentStore {
  assignments: Assignment[];
  setAssignments: (assignments: Assignment[]) => void;
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  assignments: [],
  setAssignments: (assignments) => set({ assignments }),
}));

interface AssignmentSection {
  assignment_id: string;
  assignment_section_id: string;
  cut_off_date: string | null;
  due_date: string | null;
  release_date: string | null;
  section_id: string;
  section_name: string;
}

interface InsAssignment {
  assignment_due_date: string | null;
  assignment_id: string;
  assignment_name: string;
  assignment_release_date: string | null;
  assignment_sections: AssignmentSection[];
  published: boolean;
  regrades: boolean;
  submiss_by: string;
}

interface InsAssignmentStore {
  insAssignments: InsAssignment[];
  setInsAssignments: (insAssignments: InsAssignment[]) => void;
}

export const useInsAssignmentStore = create<InsAssignmentStore>((set) => ({
  insAssignments: [],
  setInsAssignments: (insAssignments) => set({ insAssignments }),
}));
