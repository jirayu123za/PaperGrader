import { create } from 'zustand';

// store section list data on create assignment component
interface SectionsList {
    section_id: string;
    section_name: string;
}

interface SectionsListStore {
    sectionsList: SectionsList[];
    setSectionsList: (sectionsList: SectionsList[]) => void;
}

export const useSectionsListStore = create<SectionsListStore>((set) => ({
    sectionsList: [],
    setSectionsList: (sectionsList: SectionsList[]) => set({ sectionsList }),
}));

// store select section data on create assignment component
interface SelectSectionStore {
    selectedSections: string[];
    setSelectedSections: (sections: string[]) => void;
    resetSelectedSections: () => void;
}

export const useSelectSectionStore = create<SelectSectionStore>((set) => ({
    selectedSections: [],
    setSelectedSections: (selectedSections: string[]) => set({ selectedSections }),
    resetSelectedSections: () => set({ selectedSections: [] }),
}));

// store sections data on assignment setting component
interface AssignmentSectionsStore {
    assignmentSections: SectionsList[];
    setAssignmentSections: (assignmentSections: SectionsList[]) => void;
}

export const useAssignmentSectionsStore = create<AssignmentSectionsStore>((set) => ({
    assignmentSections: [],
    setAssignmentSections: (assignmentSections: SectionsList[]) => set({ assignmentSections }),
}));