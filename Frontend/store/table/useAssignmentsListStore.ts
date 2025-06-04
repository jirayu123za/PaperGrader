import { create } from 'zustand';

// Part: 1
interface Store {
    selectedAssignmentSectionIDs: string[];
    selectedAssignmentIDs: string[];
    setAssignmentSectionIDs: (IDs: string[]) => void;
    toggleAssignmentSectionID: (ID: string) => void;
    addAssignmentSectionIDs: (IDs: string[]) => void;
    removeAssignmentSectionIDs: (IDs: string[]) => void;
    setAssignmentID: (ID: string) => void;
    removeAssignmentID: (ID: string) => void;
}

export const useAssignmentSectionStore = create<Store>((set, get) => ({
    selectedAssignmentSectionIDs: [],
    selectedAssignmentIDs: [],
    setAssignmentSectionIDs: (IDs) => set({ selectedAssignmentSectionIDs: IDs }),
    toggleAssignmentSectionID: (ID) => {
        const { selectedAssignmentSectionIDs } = get();
        set({
            selectedAssignmentSectionIDs: selectedAssignmentSectionIDs.includes(ID)
                ? selectedAssignmentSectionIDs.filter(i => i !== ID)
                : [...selectedAssignmentSectionIDs, ID]
        });
    },
    addAssignmentSectionIDs: (IDs) => {
        const { selectedAssignmentSectionIDs } = get();
        const unique = Array.from(new Set([...selectedAssignmentSectionIDs, ...IDs]));
        set({ selectedAssignmentSectionIDs: unique });
    },
    removeAssignmentSectionIDs: (IDs) => {
        const { selectedAssignmentSectionIDs } = get();
        set({ selectedAssignmentSectionIDs: selectedAssignmentSectionIDs.filter(ID => !IDs.includes(ID)) });
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