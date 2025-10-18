import { create } from 'zustand';

export type ReviewGradeParams = {
  courseId: string | null;
  assignmentId: string | null;
  bin: number;
};

type ReviewGradeStore = ReviewGradeParams & {
  setCourseId: (v: string | null) => void;
  setAssignmentId: (v: string | null) => void;
  setBin: (v: number) => void;
  setAll: (p: Partial<ReviewGradeParams>) => void;
};

export const useReviewGradeStore = create<ReviewGradeStore>((set) => ({
  courseId: null,
  assignmentId: null,
  bin: 10,
  setCourseId: (v) => set({ courseId: v }),
  setAssignmentId: (v) => set({ assignmentId: v }),
  setBin: (v) => set({ bin: v }),
  setAll: (p) => set((s) => ({ ...s, ...p })),
}));
