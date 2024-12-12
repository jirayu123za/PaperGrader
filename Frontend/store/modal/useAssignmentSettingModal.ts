import { create } from 'zustand';

interface ModalState {
    isOpen: boolean;
    selectedAssignment: { assignment_id: string } | null;
    openModal: (assignment: { assignment_id: string }) => void;
    closeModal: () => void;
}

export const useAssignmentSettingStore = create<ModalState>((set) => ({
    isOpen: false,
    selectedAssignment: null,
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

interface CustomizeTimeState {
    release_date: string;
    due_date: string;
    cut_off_date: string;
    selectedSections: string[];
    setCustomizeTime: (values: {
        release_date: string;
        due_date: string;
        cut_off_date: string;
        selectedSections: string[];
    }) => void;
    resetCustomizeTime: () => void;
}

export const useCustomizeTimeStore = create<CustomizeTimeState>((set) => ({
    release_date: '',
    due_date: '',
    cut_off_date: '',
    selectedSections: [],
    setCustomizeTime: (values) => set(values),
    resetCustomizeTime: () =>
        set({
            release_date: '',
            due_date: '',
            cut_off_date: '',
            selectedSections: [],
        }),
}));