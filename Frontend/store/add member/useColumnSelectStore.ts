import create from 'zustand';

interface ColumnData {
  first_name: string[];
  last_name: string[];
  email: string[];
  student_code: string[];
  section: string[];
  role_type: string;
}

interface ColumnSelectStore {
  importData: ColumnData[]; // เก็บข้อมูล Import
  setImportData: (data: ColumnData) => void; // สำหรับตั้งค่าข้อมูล Import
  clearImportData: () => void; // สำหรับล้างข้อมูล Import
}

const useColumnSelectStore = create<ColumnSelectStore>((set) => ({
  importData: [],
  setImportData: (data) =>
    set((state) => ({
      importData: [...state.importData, data],
    })),
  clearImportData: () =>
    set(() => ({
      importData: [],
    })),
}));

export default useColumnSelectStore;
