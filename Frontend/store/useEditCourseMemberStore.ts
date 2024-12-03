import create from 'zustand';

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


interface EditCourseMemberFormState {
  fullName: string;
  studentCode: string;
  role: string;
  setFullName: (value: string) => void;
  setStudentCode: (value: string) => void;
  setRole: (value: string) => void;
  resetForm: () => void;
}

export const useEditCourseMemberFormStore = create<EditCourseMemberFormState>((set) => ({
  fullName: '',
  studentCode: '',
  role: '',
  setFullName: (value) => set({ fullName: value }),
  setStudentCode: (value) => set({ studentCode: value }),
  setRole: (value) => set({ role: value }),
  resetForm: () => set({ fullName: '', studentCode: '', role: '' }),
}));
