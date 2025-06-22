import { create } from "zustand";

interface RubricDetail {
    rubric_detail_id: string;
    rubric_point: number;
    rubric_description: string;
}

interface Rubric {
    rubric_id: string | null;
    rubric_details: RubricDetail[] | null;
}

interface RubricStore {
    rubricData: Rubric | null;
    setRubricData: (rubric: Rubric) => void;
    resetRubricData: () => void;
}

export const useRubricStore = create<RubricStore>((set) => ({
    rubricData: null,
    setRubricData: (rubric) => set({ rubricData: rubric }),
    resetRubricData: () => set({ rubricData: null }),
}));