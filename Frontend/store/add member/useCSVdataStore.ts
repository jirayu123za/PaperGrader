import create from 'zustand';

interface CsvData {
  columns: string[];
  data: { [key: string]: string }[];
}

interface CsvDataStore {
  csvData: CsvData | null;
  setCsvData: (data: CsvData) => void;
  clearCsvData: () => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
}

const useCSVdataStore = create<CsvDataStore>((set) => ({
  csvData: null,
  setCsvData: (data: CsvData) => set({ csvData: data }),
  clearCsvData: () => set({ csvData: null }),
  selectedFile: null,
  setSelectedFile: (file: File | null) => set({ selectedFile: file }),
}));

export default useCSVdataStore;
