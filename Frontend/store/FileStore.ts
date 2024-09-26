import create from 'zustand';

interface FileStoreState {
  files: File[];
  setFiles: (files: File[]) => void;
  addFile: (file: File) => void;
  removeFile: (fileName: string) => void;
  templateFile: File | null; // เพิ่ม templateFile
  setTemplateFile: (file: File | null) => void; // เพิ่ม setTemplateFile
}

export const useFileStore = create<FileStoreState>((set) => ({
  files: [],
  setFiles: (files) => set({ files }),
  addFile: (file) =>
    set((state) => ({
      files: [...state.files, file],
    })),
  removeFile: (fileName) =>
    set((state) => ({
      files: state.files.filter((file) => file.name !== fileName),
    })),
  templateFile: null, // กำหนดค่าเริ่มต้นให้ templateFile
  setTemplateFile: (file) => set({ templateFile: file }), // ฟังก์ชันสำหรับตั้งค่า templateFile
}));
