import create from 'zustand';
import * as XLSX from 'xlsx';

interface CsvData {
  columns: string[];
  data: { [key: string]: string }[];
}

interface CsvDataStore {
  csvData: CsvData | null;
  setCsvData: (data: CsvData) => void;
  clearCsvData: () => void;
  processXlsxData: (file: File) => Promise<void>;
}

const useCSVdataStore = create<CsvDataStore>((set) => ({
  csvData: null,
  setCsvData: (data: CsvData) => set({ csvData: data }),
  clearCsvData: () => set({ csvData: null }),
  processXlsxData: async (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: Array<Record<string, any>> = XLSX.utils.sheet_to_json(worksheet);

        const xlsxData: CsvData = {
          columns: Object.keys(jsonData[0] || {}),
          data: jsonData as { [key: string]: string }[],
        };

        set({ csvData: xlsxData });
        console.log('XLSX data processed:', xlsxData);
      } catch (error) {
        console.error('Error processing XLSX file:', error);
      }
    };
    reader.readAsArrayBuffer(file);
  },
}));

export default useCSVdataStore;
