import { create } from "zustand";

interface OCRData {
    submission_id: string;
    is_match: boolean;
    has_assigned: boolean;
    personal_data_id: string | null;
    best_match_name: string;
    best_match_id: string;
    similarity: number;
    submitted_at: string;
    url_name_file: string;
    url_id_file: string;
}

interface ManageOCRStore {
    ocrData: OCRData[];
    setOCRData: (ocrData: OCRData[]) => void;
}

export const useManageOCRStore = create<ManageOCRStore>((set) => ({
    ocrData: [],
    setOCRData: (ocrData) => set({ ocrData }),
}));