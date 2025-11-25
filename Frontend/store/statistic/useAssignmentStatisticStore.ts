import { create } from "zustand";

export type AssignmentOption = { value: string; label: string };

type State = {
  assignmentsList: AssignmentOption[];
  selectedAssignmentID: string | null;
};

type Actions = {
  setAssignmentsList: (list: AssignmentOption[]) => void;
  setSelectedAssignmentID: (id: string | null) => void;
  reset: () => void;
};

export const useAssignmentStatisticStore = create<State & Actions>((set) => ({
  assignmentsList: [],
  selectedAssignmentID: null,
  setAssignmentsList: (list) => set({ assignmentsList: list }),
  setSelectedAssignmentID: (id) => set({ selectedAssignmentID: id }),
  reset: () => set({ assignmentsList: [], selectedAssignmentID: null }),
}));
