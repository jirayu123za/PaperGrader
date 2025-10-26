// store/exportGrade.store.ts
import { create } from "zustand";

export type FileStatus = "pending" | "completed" | "failed";

export interface ExportGradeItem {
    export_grade_id: string;
    course_id: string;
    assignment_id: string;
    file_name: string;
    file_status: FileStatus;
    file_url: string;
    processed_at?: string | null;
    created_at: string;
    requested_by: string;
}

export interface ExportGradeData {
    exportList: ExportGradeItem[];
    lastFetchedAt?: number;
}

interface ExportGradeStore extends ExportGradeData {
    setExportList: (list: ExportGradeItem[]) => void;
    clear: () => void;
}

export const useExportGradeStore = create<ExportGradeStore>((set) => ({
    exportList: [],
    lastFetchedAt: undefined,
    setExportList: (list) =>
        set({ exportList: list ?? [], lastFetchedAt: Date.now() }),
    clear: () => set({ exportList: [], lastFetchedAt: undefined }),
}));
