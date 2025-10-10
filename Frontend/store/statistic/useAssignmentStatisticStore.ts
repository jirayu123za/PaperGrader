import { create } from "zustand";

export type AssignmentOption = { value: string; label: string };

type State = {
  assignmentsList: AssignmentOption[];
  selectedAssignmentId: string | null;
};

type Actions = {
  setAssignmentsList: (list: AssignmentOption[]) => void;
  setSelectedAssignmentId: (id: string | null) => void;
  reset: () => void;
};

export const useAssignmentStatisticStore = create<State & Actions>((set) => ({
  assignmentsList: [],
  selectedAssignmentId: null,
  setAssignmentsList: (list) => set({ assignmentsList: list }),
  setSelectedAssignmentId: (id) => set({ selectedAssignmentId: id }),
  reset: () => set({ assignmentsList: [], selectedAssignmentId: null }),
}));
