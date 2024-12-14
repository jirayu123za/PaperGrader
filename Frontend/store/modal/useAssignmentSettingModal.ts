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
    release_date: Date | null;
    due_date: Date | null;
    cut_off_date: Date | null;
    selectedSections: string[];
    setCustomizeTime: (values: {
        release_date: Date | null;
        due_date: Date | null;
        cut_off_date: Date | null;
        selectedSections: string[];
    }) => void;
    resetCustomizeTime: () => void;
}

export const useCustomizeTimeStore = create<CustomizeTimeState>((set) => ({
    release_date: null,
    due_date: null,
    cut_off_date: null,
    selectedSections: [],
    setCustomizeTime: (values) => set(values),
    resetCustomizeTime: () =>
        set({
            release_date: null,
            due_date: null,
            cut_off_date: null,
            selectedSections: [],
        }),
}));