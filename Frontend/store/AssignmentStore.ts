import create from 'zustand';

interface AssignmentStore {
  assignment_name: string;
  templateFile: File | null;
  submiss_by: string;
  release_date: Date | null; 
  due_date: Date | null;      
  group_submiss: boolean;
  late_submiss: boolean;
  cut_off_date: Date | null; 
  setAssignmentName: (name: string) => void;
  setTemplateFile: (file: File | null) => void;
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
  templateFile: null,
  submiss_by: 'student',
  release_date: null,   
  due_date: null,       
  group_submiss: false,
  late_submiss: false,
  cut_off_date: null,  
  setAssignmentName: (name) => set({ assignment_name: name }),
  setTemplateFile: (file) => set({ templateFile: file }),
  setUploadBy: (submiss_by) => set({ submiss_by }),
  setReleaseDate: (date) => set({ release_date: date }),  
  setDueDate: (date) => set({ due_date: date }),          
  setGroupSubmiss: (submission: boolean) => set({ group_submiss: submission }),
  setAllowLateSubmission: (allow) => set({ late_submiss: allow }),
  setCutOffDate: (date) => set({ cut_off_date: date }),   
  reset: () =>
    set({
      assignment_name: '',
      templateFile: null,
      submiss_by: 'student',
      release_date: null,   
      due_date: null,       
      group_submiss: false,
      late_submiss: false,
      cut_off_date: null,   
    }),
}));

