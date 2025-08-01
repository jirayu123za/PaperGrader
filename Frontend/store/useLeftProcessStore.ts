import { create } from 'zustand';

// Part: 1
interface AssignmentLeftProcess {
    assignment_id: string;
    assignment_name: string;
    course_code: string;
    semester: string;
    academic_year: string;
}

interface AssignmentLeftProcessStore {
    assignmentLeftProcess: AssignmentLeftProcess;
    setAssignmentLeftProcess: (assignmentLeftProcess: AssignmentLeftProcess) => void;
}

export const useAssignmentLeftProcessStore = create<AssignmentLeftProcessStore>((set) => ({
    assignmentLeftProcess: {
        assignment_id: '',
        assignment_name: '',
        course_code: '',
        semester: '',
        academic_year: '',
    },
    setAssignmentLeftProcess: (assignmentLeftProcess) => set({ assignmentLeftProcess }),
}));


// Part: 2
interface LeftProcessStore {
    activeOption: string | null;
    setActiveOption: (key: string | null) => void;
}

export const useLeftProcessStore = create<LeftProcessStore>((set) => ({
    activeOption: null,
    setActiveOption: (option) => set({ activeOption: option }),
}));
