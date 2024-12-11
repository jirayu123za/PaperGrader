import { create } from 'zustand';

interface AssignmentExpandState {
    expandedAssignments: Record<string, boolean>;
    toggleAssignment: (assignment_id: string) => void;
}

export const useAssignmentExpandStore = create<AssignmentExpandState>((set) => ({
    expandedAssignments: {},
    toggleAssignment: (assignment_id) =>
        set((state) => ({
            expandedAssignments: {
                ...state.expandedAssignments,
                [assignment_id]: !state.expandedAssignments[assignment_id],
            },
        })),
}));