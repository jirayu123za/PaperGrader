import create from 'zustand';
import * as XLSX from 'xlsx';

interface CsvData {
  columns: string[]; // ชื่อคอลัมน์จาก CSV หรือ XLSX
  data: { [key: string]: string }[]; // ข้อมูลจาก CSV หรือ XLSX
}

interface CsvDataStore {
  csvData: CsvData | null;
  setCsvData: (data: CsvData) => void;
  clearCsvData: () => void;
  processXlsxData: (file: File) => Promise<void>; // ฟังก์ชันสำหรับจัดการ XLSX
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
          columns: Object.keys(jsonData[0] || {}), // ดึงชื่อคอลัมน์
          data: jsonData as { [key: string]: string }[], // เก็บข้อมูลทั้งหมด
        };

        set({ csvData: xlsxData }); // เก็บข้อมูลลงใน Zustand store
        console.log('XLSX data processed:', xlsxData);
      } catch (error) {
        console.error('Error processing XLSX file:', error);
      }
    };
    reader.readAsArrayBuffer(file);
  },
}));

export default useCSVdataStore;
