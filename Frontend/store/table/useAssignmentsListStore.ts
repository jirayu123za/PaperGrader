import { create } from 'zustand';

// Part: 1
interface Store {
    selectedSectionIDs: string[];
    selectedAssignmentIDs: string[];
    setSectionIDs: (IDs: string[]) => void;
    toggleSectionID: (ID: string) => void;
    addSectionIDs: (IDs: string[]) => void;
    removeSectionIDs: (IDs: string[]) => void;
    setAssignmentID: (ID: string) => void;
    removeAssignmentID: (ID: string) => void;
}

export const useAssignmentSectionStore = create<Store>((set, get) => ({
    selectedSectionIDs: [],
    selectedAssignmentIDs: [],
    setSectionIDs: (IDs) => set({ selectedSectionIDs: IDs }),
    toggleSectionID: (ID) => {
        const { selectedSectionIDs } = get();
        set({
            selectedSectionIDs: selectedSectionIDs.includes(ID)
                ? selectedSectionIDs.filter(i => i !== ID)
                : [...selectedSectionIDs, ID]
        });
    },
    addSectionIDs: (IDs) => {
        const { selectedSectionIDs } = get();
        const unique = Array.from(new Set([...selectedSectionIDs, ...IDs]));
        set({ selectedSectionIDs: unique });
    },
    removeSectionIDs: (IDs) => {
        const { selectedSectionIDs } = get();
        set({ selectedSectionIDs: selectedSectionIDs.filter(ID => !IDs.includes(ID)) });
    },
    setAssignmentID: (ID) => {
        const { selectedAssignmentIDs } = get();
        if (!selectedAssignmentIDs.includes(ID)) {
            set({ selectedAssignmentIDs: [...selectedAssignmentIDs, ID] });
        }
    },
    removeAssignmentID: (ID) => {
        const { selectedAssignmentIDs } = get();
        set({ selectedAssignmentIDs: selectedAssignmentIDs.filter(aid => aid !== ID) });
    },
}));

// Part: 2
interface ExpandedAssignmentStore {
    expandedAssignmentIDs: string[];
    toggleExpandedAssignmentID: (ID: string) => void;
}

export const useExpandedAssignmentStore = create<ExpandedAssignmentStore>((set, get) => ({
    expandedAssignmentIDs: [],
    toggleExpandedAssignmentID: (ID) => {
        const { expandedAssignmentIDs } = get();
        set({
            expandedAssignmentIDs: expandedAssignmentIDs.includes(ID)
                ? expandedAssignmentIDs.filter((aid) => aid !== ID)
                : [...expandedAssignmentIDs, ID],
        });
    },
}));