import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface SectionsList {
  section_id: string;
  section_name: string;
}

interface SectionsListStore {
  sectionsList: SectionsList[];
  setSectionsList: (sectionsList: SectionsList[]) => void;
  resetSectionsList: () => void;
}

export const useSectionsListStore = create<SectionsListStore>((set) => ({
  sectionsList: [],
  setSectionsList: (sectionsList: SectionsList[]) => set({ sectionsList }),
  resetSectionsList: () => set({ sectionsList: [] }),
}));

interface SelectSectionStore {
  selectedSections: string[];
  setSelectedSections: (
    sections: string[] | ((prev: string[]) => string[])
  ) => void;
  resetSelectedSections: () => void;
}

export const useSelectSectionStore = create<SelectSectionStore>()(
  subscribeWithSelector((set) => ({
    selectedSections: [],
    setSelectedSections: (sections) =>
      set((state) => ({
        selectedSections:
          typeof sections === 'function'
            ? sections(state.selectedSections)
            : sections,
      })),
    resetSelectedSections: () => set({ selectedSections: [] }),
  }))
);

interface AssignmentSectionsStore {
  assignmentSections: SectionsList[];
  setAssignmentSections: (assignmentSections: SectionsList[]) => void;
  resetAssignmentSections: () => void;
}

export const useAssignmentSectionsStore = create<AssignmentSectionsStore>((set) => ({
  assignmentSections: [],
  setAssignmentSections: (assignmentSections: SectionsList[]) =>
    set({ assignmentSections }),
  resetAssignmentSections: () => set({ assignmentSections: [] }),
}));
