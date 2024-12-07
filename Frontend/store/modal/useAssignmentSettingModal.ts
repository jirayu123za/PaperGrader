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