// store/modal/useExportModalStore.ts
import create from 'zustand';

export interface ExportModalState {
  opened: boolean;
  course_id: string | null;
  openModal: (courseID: string) => void;
  closeModal: () => void;
}

export const useExportModalStore = create<ExportModalState>((set) => ({
  opened: false,
  course_id: null,
  openModal: (courseID: string) =>
    set({ opened: true, course_id: courseID }),
  closeModal: () =>
    set({ opened: false, course_id: null }),
}));
