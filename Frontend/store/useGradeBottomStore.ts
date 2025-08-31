import { create } from 'zustand';

export type TTotalSubmission = {
  submission_id: string;
  has_grade: boolean;
};

type State = {
  total: TTotalSubmission[];
  setTotal: (items: TTotalSubmission[]) => void;
  clear: () => void;
};

export const useTotalSubmissionsStore = create<State>((set) => ({
  total: [],
  setTotal: (items) => set({ total: items }),
  clear: () => set({ total: [] }),
}));
