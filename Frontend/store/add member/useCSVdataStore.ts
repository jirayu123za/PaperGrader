import create from 'zustand';

interface CsvData {
  columns: string[]; // ชื่อคอลัมน์จาก CSV
  data: { [key: string]: string }[]; // ข้อมูลจาก CSV
}

interface CsvDataStore {
  csvData: CsvData | null;
  setCsvData: (data: CsvData) => void;
  clearCsvData: () => void;
}

const useCSVdataStore = create<CsvDataStore>((set) => ({
  csvData: null,
  setCsvData: (data: CsvData) => set({ csvData: data }),
  clearCsvData: () => set({ csvData: null }),
}));

export default useCSVdataStore;
