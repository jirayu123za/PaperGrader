// AssignmentStore.ts
import create from 'zustand';

interface AssignmentStore {
  assignmentName: string;
  templateFile: File | null;
  uploadBy: string;
  releaseDate: string;
  dueDate: string;
  allowLateSubmission: boolean;
  cutOffDate: string; // เพิ่ม cutOffDate
  setAssignmentName: (name: string) => void;
  setTemplateFile: (file: File | null) => void;
  setUploadBy: (uploadBy: string) => void;
  setReleaseDate: (date: string) => void;
  setDueDate: (date: string) => void;
  setAllowLateSubmission: (allow: boolean) => void;
  setCutOffDate: (date: string) => void; // Setter สำหรับ cutOffDate
  reset: () => void;
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  assignmentName: '',
  templateFile: null,
  uploadBy: 'student',
  releaseDate: '',
  dueDate: '',
  allowLateSubmission: false,
  cutOffDate: '', // ค่าเริ่มต้นของ cutOffDate
  setAssignmentName: (name) => set({ assignmentName: name }),
  setTemplateFile: (file) => set({ templateFile: file }),
  setUploadBy: (uploadBy) => set({ uploadBy }),
  setReleaseDate: (date) => set({ releaseDate: date }),
  setDueDate: (date) => set({ dueDate: date }),
  setAllowLateSubmission: (allow) => set({ allowLateSubmission: allow }),
  setCutOffDate: (date) => set({ cutOffDate: date }), // ฟังก์ชัน setter สำหรับ cutOffDate
  reset: () =>
    set({
      assignmentName: '',
      templateFile: null,
      uploadBy: 'student',
      releaseDate: '',
      dueDate: '',
      allowLateSubmission: false,
      cutOffDate: '', // Reset cutOffDate เมื่อรีเซ็ต state
    }),
}));
