import { create } from "zustand";

interface OCRProcessData {
    submission_id: string;
    personal_data_id: string;
    best_match_name: string;
    best_match_id: string;
}

interface OCRDataStore {
    ocrProcessingData: OCRProcessData[];
    setOCRProcessingData: (ocrProcessData: OCRProcessData[]) => void;
    resetOCRProcessingData: () => void;
}

export const useOCRDataStore = create<OCRDataStore>((set) => ({
    ocrProcessingData: [],
    setOCRProcessingData: (ocrProcessingData) => set({ ocrProcessingData }),
    resetOCRProcessingData: () => set({ ocrProcessingData: [] }),
}));