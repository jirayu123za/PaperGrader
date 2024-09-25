import create from 'zustand';

// สร้าง interface สำหรับ assignment
interface Assignment {
  assignment_id: string;
  CourseId: string;
  assignment_name: string;
  assignment_decription: string;
  assignment_duedate: string;
}

// สร้าง Zustand store สำหรับ assignments
interface AssignmentStore {
  assignments: Assignment[];
  setAssignments: (assignments: Assignment[]) => void;
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  assignments: [], // ค่าเริ่มต้นของ assignments เป็น array ว่าง
  setAssignments: (assignments) => set({ assignments }),
}));
