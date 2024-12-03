import { create } from "zustand";

interface ActiveAssignments {
    assignment_id: string;
    assignment_name: string;
    published: boolean;
    regrades: boolean;
    assignment_release_date: string;
    assignment_due_date: string;
    assignment_cut_off_date: string;
    created_at: string;
    assignment_description: string;
}

interface ActiveAssignmentStore {
    activeAssignments: ActiveAssignments[];
    setActiveAssignments: (activeAssignments: ActiveAssignments[]) => void;
    selectedAssignmentId: string | null;
    setSelectedAssignmentId: (assignment_id: string | null) => void;
}

export const useActiveAssignmentStore = create<ActiveAssignmentStore>((set) => ({
    activeAssignments: [],
    setActiveAssignments: (activeAssignments) => set({ activeAssignments }),
    selectedAssignmentId: null,
    setSelectedAssignmentId: (assignment_id) => set({ selectedAssignmentId: assignment_id }),
}));