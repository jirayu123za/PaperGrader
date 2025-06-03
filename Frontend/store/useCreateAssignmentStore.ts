import { create } from 'zustand';

interface AssignmentStore {
  assignment_name: string;
  assignment_description: string;
  submitted_by: string;
  release_date: Date | null;
  due_date: Date | null;
  group_submitted: boolean;
  late_submitted: boolean;
  cut_off_date: Date | null;
  setAssignmentName: (name: string) => void;
  setAssignmentDescription: (description: string) => void;
  setUploadBy: (uploadBy: string) => void;
  setReleaseDate: (date: Date | null) => void;
  setDueDate: (date: Date | null) => void;
  setGroupSubmiss: (submission: boolean) => void;
  setAllowLateSubmission: (allow: boolean) => void;
  setCutOffDate: (date: Date | null) => void;
  reset: () => void;
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  assignment_name: '',
  assignment_description: '',
  submitted_by: 'student',
  release_date: null,
  due_date: null,
  group_submitted: false,
  late_submitted: false,
  cut_off_date: null,
  setAssignmentName: (name) => set({ assignment_name: name }),
  setAssignmentDescription: (description) => set({ assignment_description: description }),
  setUploadBy: (submitted_by) => set({ submitted_by }),
  setReleaseDate: (date) => set({ release_date: date }),
  setDueDate: (date) => set({ due_date: date }),
  setGroupSubmiss: (submission: boolean) => set({ group_submitted: submission }),
  setAllowLateSubmission: (allow) => set({ late_submitted: allow }),
  setCutOffDate: (date) => set({ cut_off_date: date }),
  reset: () =>
    set({
      assignment_name: '',
      assignment_description: '',
      submitted_by: 'student',
      release_date: null,
      due_date: null,
      group_submitted: false,
      late_submitted: false,
      cut_off_date: null,
    }),
}));

