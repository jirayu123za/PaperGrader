import { create } from 'zustand';

interface AssignmentTimeSetting {
    assignment_id: string;
    opened: boolean;
    openModal: (id: string) => void;
    closeModal: () => void;
}

export const useModalAssignmentTimeSettingStore = create<AssignmentTimeSetting>((set) => ({
    assignment_id: '',
    opened: false,
    openModal: (id: string) => {
        set({ assignment_id: id, opened: true });
    },
    closeModal: () => {
        set({ assignment_id: '', opened: false });
    },
}));
