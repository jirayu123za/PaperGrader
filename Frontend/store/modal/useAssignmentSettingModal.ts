import { create } from 'zustand';

interface ModalState {
    isOpen: boolean;
    selectedAssignment: { assignment_id: string } | null;
    selectedSectionIDs: string[];
    setSectionIDs: (sectionIDs: string[]) => void;
    clearSectionIDs: () => void;
    openModal: (assignment: { assignment_id: string }) => void;
    closeModal: () => void;
    showToolbar: boolean;
    toggleToolbar: () => void;
}

export const useAssignmentSettingStore = create<ModalState>((set) => ({
    isOpen: false,
    selectedAssignment: null,
    selectedSectionIDs: [],
    setSectionIDs: (sectionIDs) =>
        set(() => ({
            selectedSectionIDs: sectionIDs,
        })),

    clearSectionIDs: () =>
        set(() => ({
            selectedSectionIDs: [],
        })),
    openModal: (assignment) =>
        set(() => ({
            isOpen: true,
            selectedAssignment: assignment,
        })),
    closeModal: () =>
        set(() => ({
            isOpen: false,
            selectedAssignment: null,
        })),
    showToolbar: false,
    toggleToolbar: () =>
        set((state) => ({
            showToolbar: !state.showToolbar,
        })),
}));

// Modal Assignment Setting
interface AssignmentSetting {
    assignment_id: string;
    opened: boolean;
    openModal: (id: string) => void;
    closeModal: () => void;
}

export const useModalAssignmentSettingStore = create<AssignmentSetting>((set) => ({
    assignment_id: '',
    opened: false,
    openModal: (id: string) => {
        set({ assignment_id: id, opened: true });
    },
    closeModal: () => {
        set({ assignment_id: '', opened: false });
    },
}));

// Part: 2
type AssignmentFormValues = {
    assignmentName: string;
    assignmentDescription: string;
    submittedBy: string;
    lateSubmitted: boolean;
    published: boolean;
    regrades: boolean;
    groupSubmitted: boolean;
    groupSizeLimit: string;
    releaseDate: string | null;
    dueDate: string | null;
    cutOffDate: string | null;
};

interface AssignmentFormStore {
    values: AssignmentFormValues;
    setField: <K extends keyof AssignmentFormValues>(key: K, value: AssignmentFormValues[K]) => void;
    setAll: (values: Partial<AssignmentFormValues>) => void;
    reset: () => void;

    assignmentSections: AssignmentSections[];
    setAssignmentSections: (sections: AssignmentSections[]) => void;
}

interface AssignmentSections {
    section_id: string;
    section_name: string;
    published: boolean;
    release_date: string | null;
    due_date: string | null;
    cut_off_date: string | null;
}

export const useAssignmentSettingFormStore = create<AssignmentFormStore>((set) => ({
    values: {
        assignmentName: '',
        assignmentDescription: '',
        submittedBy: '',
        lateSubmitted: false,
        published: false,
        regrades: false,
        groupSubmitted: false,
        groupSizeLimit: '',
        releaseDate: null,
        dueDate: null,
        cutOffDate: null,
    },
    setField: (key, value) => set((state) => ({
        values: {
            ...state.values,
            [key]: value,
        },
    })),
    setAll: (newValues) => set((state) => ({
        values: {
            ...state.values,
            ...newValues,
        },
    })),
    reset: () =>
        set(() => ({
            values: {
                assignmentName: '',
                assignmentDescription: '',
                submittedBy: '',
                lateSubmitted: false,
                published: false,
                regrades: false,
                groupSubmitted: false,
                groupSizeLimit: '',
                releaseDate: null,
                dueDate: null,
                cutOffDate: null,
            },
        }
        )),
    assignmentSections: [],
    setAssignmentSections: (sections) => set(() => ({ assignmentSections: sections })),
}));