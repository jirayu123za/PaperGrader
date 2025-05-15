import { create } from "zustand";

interface ManageSubmissionState {
    editableSubmissionID: string | null;
    setEditableSubmissionID: (id: string | null) => void;
}

export const useManageSubmissionStore = create<ManageSubmissionState>((set) => ({
    editableSubmissionID: null,
    setEditableSubmissionID: (id) => set({ editableSubmissionID: id }),
}));