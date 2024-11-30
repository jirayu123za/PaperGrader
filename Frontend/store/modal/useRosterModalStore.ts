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
