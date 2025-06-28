import { create } from "zustand";

interface RubricDetail {
    rubric_detail_id: string;
    rubric_point: number;
    rubric_description: string;
    has_selected: boolean;
}

interface Rubric {
    rubric_id: string | null;
    rubric_setting: string | null;
    rubric_details: RubricDetail[] | null;
}

interface RubricStore {
    rubricData: Rubric | null;
    setRubricData: (rubric: Rubric) => void;
    resetRubricData: () => void;

    // For rubrics
    rubrics: RubricItem[];
    setRubrics: (rubrics: RubricItem[]) => void;

    editingRubricID: string | null;
    setEditingRubricID: (id: string | null) => void;

    editingDescriptionID: string | null;
    setEditingDescriptionID: (id: string | null) => void;
}

// For rubrics
interface RubricItem {
    rubric_id: string;
    rubric_detail_id: string;
    rubric_point: number;
    rubric_description: string;
    has_selected: boolean;
    rubric_setting: 'Positive scoring' | 'Negative scoring' | null;
}

export const useRubricStore = create<RubricStore>((set) => ({
    rubricData: null,
    setRubricData: (rubric) => set({ rubricData: rubric }),
    resetRubricData: () => set({ rubricData: null }),

    // For rubrics
    rubrics: [],
    setRubrics: (rubrics) => set({ rubrics }),

    editingRubricID: null,
    setEditingRubricID: (id) => set({ editingRubricID: id }),

    editingDescriptionID: null,
    setEditingDescriptionID: (id) => set({ editingDescriptionID: id }),
}));