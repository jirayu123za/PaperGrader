import create from 'zustand';

// สร้าง interface สำหรับ assignment
interface Assignment {
  assignment_id: string;
  //CourseId: string;
  assignment_name: string;
  //assignment_decription: string;
  assignment_release_date: string;
  assignment_due_date: string;
  assignment_cut_off_date: string;
}

// สร้าง Zustand store สำหรับ assignments
interface AssignmentStore {
  assignments: Assignment[];
  setAssignments: (assignments: Assignment[]) => void;
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  assignments: [],
  setAssignments: (assignments) => set({ assignments }),
}));
