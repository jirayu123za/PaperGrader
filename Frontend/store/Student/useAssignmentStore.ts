import { create } from "zustand";

interface StudentAssignment {
  course_id: string;
  assignment_id: string;
  submission_id?: string | null;
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

interface StudentAssignmentsGrouped {
  active: StudentAssignment[];
  over_due: StudentAssignment[];
  submitted: StudentAssignment[];
}

interface AssignmentStore {
  active: StudentAssignment[];
  over_due: StudentAssignment[];
  submitted: StudentAssignment[];
  setAssignments: (groups: StudentAssignmentsGrouped) => void;
  updateAssignment: (id: string, updates: Partial<StudentAssignment>) => void;
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  active: [],
  over_due: [],
  submitted: [],

  setAssignments: (groups) =>
    set({
      active: groups.active ?? [],
      over_due: groups.over_due ?? [],
      submitted: groups.submitted ?? [],
    }),

  updateAssignment: (id, updates) =>
    set((state) => {
      const findInList = (list: StudentAssignment[]) => list.find((a) => a.assignment_id === id);
      const currentFromActive = findInList(state.active);
      const currentFromOverDue = findInList(state.over_due);
      const currentFromSubmitted = findInList(state.submitted);
      const current = currentFromActive || currentFromOverDue || currentFromSubmitted;
      if (!current) return state;

      const updated: StudentAssignment = { ...current, ...updates };
      const removeFrom = (list: StudentAssignment[]) => list.filter((a) => a.assignment_id !== id);
      let active = removeFrom(state.active);
      let over_due = removeFrom(state.over_due);
      let submitted = removeFrom(state.submitted);

      let prevGroup: keyof StudentAssignmentsGrouped = "active";
      if (currentFromOverDue) prevGroup = "over_due";
      else if (currentFromSubmitted) prevGroup = "submitted";

      if (updated.has_submitted) {
        submitted = [...submitted, updated];
      } else {
        if (prevGroup === "active") active = [...active, updated];
        else if (prevGroup === "over_due") over_due = [...over_due, updated];
        else submitted = [...submitted, updated];
      }
      return { active, over_due, submitted };
    }),
}));
