import { create } from 'zustand';

interface ReviewGradeParams {
  courseID: string | null;
  assignmentID: string | null;
  bin: number;
};

interface Table {
  personal_data_id: string;
  student_name: string;
  email: string;
  sections: string | null;
  score: number | null;
  graded: boolean;
  has_submission: boolean;
  submitted_at: Date | null;
}

interface Bin {
  lower: number;
  upper: number;
  count: number;
  label: string;
}

export interface ReviewGradeStatistics {
  minimum: number | null;
  median: number | null;
  maximum: number | null;
  mean: number | null;
  sd: number | null;
  total_submission: number;
  total_assignment_score: number;
  submission_scores: number[];
  grades_data: Bin[];
  table: Table[];
}

interface ReviewGradeStore {
  setCourseID: (v: string | null) => void;
  setAssignmentID: (v: string | null) => void;
  setBin: (v: number) => void;
  setAll: (p: Partial<ReviewGradeParams>) => void;

  courseID: string | null;
  assignmentID: string | null;
  bin: number;

  gradeStatistics?: ReviewGradeStatistics;
  setGradeStatistics: (stats: ReviewGradeStatistics) => void;
};

export const useReviewGradeStore = create<ReviewGradeStore>((set) => ({
  courseID: null,
  assignmentID: null,
  bin: 10,

  setCourseID: (v) => set({ courseID: v }),
  setAssignmentID: (v) => set({ assignmentID: v }),
  setBin: (v) => set({ bin: v }),
  setAll: (p) => set((s) => ({ ...s, ...p })),

  gradeStatistics: undefined,
  setGradeStatistics: (stats) => set({ gradeStatistics: stats }),
}));
