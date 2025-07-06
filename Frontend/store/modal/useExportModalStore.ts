import create from 'zustand';

export type FileType = 'csv' | 'pdf';

interface ExportModalState {
  opened: boolean;
  course_id: string | null;
  onExportCallback: (selected: string[], fileType: FileType) => void;
  openModal: (
    callback: (selected: string[], fileType: FileType) => void,
    course_id: string
  ) => void;
  closeModal: () => void;
}

export const useExportModalStore = create<ExportModalState>((set) => ({
  opened: false,
  course_id: null,
  onExportCallback: () => {},
  openModal: (callback, course_id) =>
    set({
      opened: true,
      onExportCallback: callback,
      course_id,
    }),
  closeModal: () =>
    set({
      opened: false,
      course_id: null,
      onExportCallback: () => {},
    }),
}));
