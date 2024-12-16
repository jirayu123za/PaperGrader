import { create } from 'zustand';

interface ModalState {
    assignment_id: string;
    course_id: string;
    files: string[];
    fileNames: string[];
    setFiles: (files: string[], fileNames: string[]) => void;
    opened: boolean;
    openModal: (assignment_id: string, course_id: string) => void;
    closeModal: () => void;
}

export const useSubmitAndDownloadModalStore = create<ModalState>((set) => ({
    assignment_id: '',
    course_id: '',
    files: [],
    fileNames: [],
    setFiles: (files, fileNames) => set({ files, fileNames }),
    opened: false,
    openModal: (assignment_id: string, course_id: string) => {
        set({ assignment_id: assignment_id, course_id: course_id, opened: true });
    },
    closeModal: () => {
        set({ assignment_id: '', course_id: '', opened: false, files: [], fileNames: [] });
    },
}));