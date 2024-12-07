import { create } from 'zustand';

interface AssignmentSections {
    section_id: string;
    sectionName: string;
    releaseDate: string | null;
    dueDate: string | null;
    cutOffDate: string | null;
}

interface Assignment {
    assignment_id: string;
    assignmentName: string;
    assignmentDescription: string;
    gradingType: string;
    groupSubmiss: boolean;
    lateSubmiss: boolean;
    published: boolean;
    regrades: boolean;
    submissBy: string;
}

interface AssignmentSetting {
    assignment: Assignment | null;
    assignmentSections: AssignmentSections[];
}

interface AssignmentSettingStore {
    assignmentSetting: AssignmentSetting | null;
    setAssignmentSetting: (assignmentSetting: AssignmentSetting) => void;
    resetAssignmentSetting: () => void;
}

export const useAssignmentSettingStore = create<AssignmentSettingStore>((set) => ({
    assignmentSetting: null,
    setAssignmentSetting: (assignmentSetting) => set({ assignmentSetting }),
    resetAssignmentSetting: () => set({ assignmentSetting: null }),
}));
