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

interface SelectedAssignmentState {
    selectedAssignmentID: string | null;
    setSelectedAssignmentID: (assignment_id: string | null) => void;

    selectedAssignmentSections: string[];
    setSelectedAssignmentSections: (sections: string[]) => void;
    resetAssignmentSelection: () => void;
}

export const useSelectedAssignmentStore = create<SelectedAssignmentState>((set) => ({
    selectedAssignmentID: null,
    setSelectedAssignmentID: (assignment_id) => set({ selectedAssignmentID: assignment_id }),

    selectedAssignmentSections: [],
    setSelectedAssignmentSections: (sections) => set({ selectedAssignmentSections: sections }),
    resetAssignmentSelection: () => set({ selectedAssignmentID: null, selectedAssignmentSections: [] }),
}));

interface SelectAssignmentSectionIDs {
    selectedAssignmentSectionIDs: string[];
    setSelectedAssignmentSectionIDs: (assignment_section_id: string[]) => void;
    resetSelectedAssignmentSectionIDs: () => void;
}

export const useSelectAssignmentSectionIDsStore = create<SelectAssignmentSectionIDs>((set) => ({
    selectedAssignmentSectionIDs: [],
    setSelectedAssignmentSectionIDs: (assignment_section_id) => set({ selectedAssignmentSectionIDs: assignment_section_id }),
    resetSelectedAssignmentSectionIDs: () => set({ selectedAssignmentSectionIDs: [] }),
}));