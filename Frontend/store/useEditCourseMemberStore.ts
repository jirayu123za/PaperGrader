import { create } from 'zustand';

interface EditCourseMember {
  personal_data_id: string;
  full_name: string;
  email: string;
  role_type: string;
  student_code: string;
  section_name: string;
}

interface EditCourseMemberStore {
  editMember: EditCourseMember | null;
  setEditMember: (member: EditCourseMember) => void;
  resetEditMember: () => void;
}

export const useEditCourseMemberStore = create<EditCourseMemberStore>((set) => ({
  editMember: null,
  setEditMember: (member) => set({ editMember: member }),
  resetEditMember: () => set({ editMember: null }),
}));