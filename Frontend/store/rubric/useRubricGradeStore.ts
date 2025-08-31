import { create } from "zustand";

interface RubricDetail {
    rubric_detail_id: string;
    rubric_point: number;
    rubric_description: string;
    has_selected: boolean;
}

interface Rubric {
    rubric_id: string | null;
    has_ceiling: boolean;
    has_floor: boolean;
    rubric_setting: string | null;
    rubric_details: RubricDetail[] | null;
}

interface RubricGradeStore {
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
export interface RubricItem {
    rubric_id: string;
    rubric_detail_id: string;
    rubric_point: number;
    rubric_description: string;
    has_selected: boolean;
    has_ceiling: boolean;
    has_floor: boolean;
    rubric_setting: 'Positive scoring' | 'Negative scoring' | null;
}

export const useRubricGradeStore = create<RubricGradeStore>((set) => ({
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