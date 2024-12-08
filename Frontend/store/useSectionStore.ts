import { create } from 'zustand';

// Interface สำหรับ SectionsList
interface SectionsList {
  section_id: string;
  section_name: string;
}

// Interface สำหรับ SectionsListStore
interface SectionsListStore {
  sectionsList: SectionsList[];
  setSectionsList: (sectionsList: SectionsList[]) => void;
  resetSectionsList: () => void;
}

// Store สำหรับ SectionsList
export const useSectionsListStore = create<SectionsListStore>((set) => ({
  sectionsList: [],
  setSectionsList: (sectionsList: SectionsList[]) => set({ sectionsList }),
  resetSectionsList: () => set({ sectionsList: [] }),
}));

// Interface สำหรับ SelectSectionStore
interface SelectSectionStore {
  selectedSections: string[];
  setSelectedSections: (
    sections: string[] | ((prev: string[]) => string[])
  ) => void;
  resetSelectedSections: () => void;
}

// Store สำหรับ SelectSection
export const useSelectSectionStore = create<SelectSectionStore>((set) => ({
  selectedSections: [],
  setSelectedSections: (sections) =>
    set((state) => ({
      selectedSections:
        typeof sections === "function" ? sections(state.selectedSections) : sections,
    })),
  resetSelectedSections: () => set({ selectedSections: [] }),
}));

// Interface สำหรับ AssignmentSectionsStore
interface AssignmentSectionsStore {
  assignmentSections: SectionsList[];
  setAssignmentSections: (assignmentSections: SectionsList[]) => void;
  resetAssignmentSections: () => void;
}

// Store สำหรับ AssignmentSections
export const useAssignmentSectionsStore = create<AssignmentSectionsStore>((set) => ({
  assignmentSections: [],
  setAssignmentSections: (assignmentSections: SectionsList[]) =>
    set({ assignmentSections }),
  resetAssignmentSections: () => set({ assignmentSections: [] }),
}));
