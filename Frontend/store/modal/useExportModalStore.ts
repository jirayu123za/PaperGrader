// store/modal/useExportModalStore.ts
import create from 'zustand';

export interface ExportModalState {
  opened: boolean;
  course_id: string | null;
  openModal: (courseId: string) => void;
  closeModal: () => void;
}

export const useExportModalStore = create<ExportModalState>((set) => ({
  opened: false,
  course_id: null,
  openModal: (courseId: string) =>
    set({ opened: true, course_id: courseId }),
  closeModal: () =>
    set({ opened: false, course_id: null }),
}));
