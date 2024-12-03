import create from 'zustand';

interface ModalState {
    isOpen: boolean;
    selectedSection: { sectionName: string; section_id: string } | null;
    openModal: (section: { sectionName: string; section_id: string }) => void;
    closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
    isOpen: false,
    selectedSection: null,
    openModal: (section) =>
        set(() => ({
            isOpen: true,
            selectedSection: section,
        })),
    closeModal: () =>
        set(() => ({
            isOpen: false,
            selectedSection: null,
        })),
}));

// Modal edit course member
interface EditCourseMember {
    personal_data_id: string;
    opened: boolean;
    openModal: (id: string) => void;
    closeModal: () => void;
}

export const useModalEditRosterMemberStore = create<EditCourseMember>((set) => ({
    personal_data_id: '',
    opened: false,
    openModal: (id: string) => {
        console.log('Opening modal with ID:', id);
        set({ personal_data_id: id, opened: true });
    },
    closeModal: () => {
        console.log('Closing modal');
        set({ personal_data_id: '', opened: false });
    },
}));