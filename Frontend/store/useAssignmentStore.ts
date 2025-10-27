import { create } from 'zustand';

// Part: 1
interface Assignment {
  [x: string]: any;
  assignment_id: string;
  assignment_name: string;
  release_date: string;
  due_date: string;
  cut_off_date: string;
  published: boolean;
  regrades: boolean;
  submitted_by: string;
  

}

interface AssignmentStore {
  assignments: Assignment[];
  setAssignments: (assignments: Assignment[]) => void;
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  assignments: [],
  setAssignments: (assignments) => set({ assignments }),
}));

// Part: 2
interface AssignmentsList {
  assignment_id: string;
  assignment_name: string;
  assignment_sections: AssignmentsSectionList[];
  regrades: boolean;
  submitted_by: string;
}

interface AssignmentsSectionList {
  assignment_id: string;
  assignment_section_id: string;
  section_id: string;
  section_name: string;
  published_grade: boolean;
  published_assignment: boolean;
  release_date: string | null;
  due_date: string | null;
  cut_off_date: string | null;
}

interface AssignmentsListTableStore {
  assignmentList: AssignmentsList[];
  setAssignmentList: (assignmentList: AssignmentsList[]) => void;
}

export const useAssignmentsListTableStore = create<AssignmentsListTableStore>((set) => ({
  assignmentList: [],
  setAssignmentList: (assignmentList) => set({ assignmentList: assignmentList }),
}));
