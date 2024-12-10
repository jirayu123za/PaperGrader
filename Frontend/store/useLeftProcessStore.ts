import { create } from 'zustand';

interface AssignmentLeftProcess {
    assignment_id: string;
    assignment_name: string;
    submiss_by: string;
}

interface AssignmentLeftProcessStore {
    assignmentLeftProcess: AssignmentLeftProcess;
    setAssignmentLeftProcess: (assignmentLeftProcess: AssignmentLeftProcess) => void;
}

export const useAssignmentLeftProcessStore = create<AssignmentLeftProcessStore>((set) => ({
    assignmentLeftProcess: {
        assignment_id: '',
        assignment_name: '',
        submiss_by: ''
    },
    setAssignmentLeftProcess: (assignmentLeftProcess) => set({ assignmentLeftProcess }),
}));
