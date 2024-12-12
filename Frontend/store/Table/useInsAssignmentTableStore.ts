import { create } from 'zustand';

interface AssignmentExpandState {
    expandedAssignments: Record<string, boolean>;
    toggleAssignment: (assignment_id: string) => void;
}

export const useAssignmentExpandStore = create<AssignmentExpandState>((set) => ({
    expandedAssignments: {},

    toggleAssignment: (assignment_id: string) =>
        set((state) => {
            const isExpanded = state.expandedAssignments[assignment_id];
            const newExpandedAssignments = isExpanded
                ? {}
                : { [assignment_id]: true };

            return {
                expandedAssignments: newExpandedAssignments,
            };
        }),
}));