import { UUID } from "crypto";
import { create } from "zustand";

interface RubricDetail {
    rubric_detail_id: UUID;
    has_selected: boolean;
    rubric_point: number;
    rubric_description: string;
}

interface Rubrics {
    rubric_id: UUID;
    has_floor: boolean;
    has_ceiling: boolean;
    rubric_setting: string;
    rubric_details: RubricDetail[];
}

interface SubQuestion {
    sub_question_id: UUID;
    sub_question_title: string;
    sub_question_point: number;
    bounding_box_id?: UUID | null;
    rubrics?: Rubrics;
}

interface Question {
    question_id: UUID;
    question_title: string;
    question_point: number;
    bounding_box_id?: UUID | null;
    rubrics?: Rubrics;
    sub_questions?: SubQuestion[];
}

interface header_details {
    full_name: string;
    nick_name: string;
    section: string;
}

interface assignment_details {
    assignment_name: string;
}

interface summary {
    grade_status: boolean;
    total_assignment_point: number;
    total_submission_point: number;
}

interface SubmissionDetails {
    questions_details: Question[];
    header_details: header_details;
    assignment_details: assignment_details;
    summary: summary;
}

interface GradeSubmissionStore {
    // Data store
    submissionDetails: SubmissionDetails | null;
    setSubmissionDetails: (submission: SubmissionDetails | null) => void;
    clearSubmissionDetails: () => void;

    // UI store
    selectedRubricID: string | null;
    setSelectedRubricID: (id: string | null) => void;
    toggleSelectedRubricID: (id: string) => void;
}

export const useGradeSubmissionStore = create<GradeSubmissionStore>((set) => ({
    // Data store
    submissionDetails: null,
    setSubmissionDetails: (submissionDetails) => set({ submissionDetails }),
    clearSubmissionDetails: () => set({ submissionDetails: null }),

    // UI store
    selectedRubricID: null,
    setSelectedRubricID: (id) => set({ selectedRubricID: id }),
    toggleSelectedRubricID: (id) =>
        set((state) => ({
            selectedRubricID: state.selectedRubricID === id ? null : id,
        })
        ),
}));