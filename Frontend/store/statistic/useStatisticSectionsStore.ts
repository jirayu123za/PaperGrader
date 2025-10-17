import { create } from 'zustand';

export type StatisticSection = {
  section_id: string[];
  section_name: string;
  is_all?: boolean;
};

type State = {
  courseId: string | null;
  assignmentId: string | null;
  sections: StatisticSection[];
  selectedSectionIds: string[];
};

type Actions = {
  setCourseId: (id: string | null) => void;
  setAssignmentId: (id: string | null) => void;
  setSections: (s: StatisticSection[]) => void;
  setSelectedByRows: (rows: StatisticSection[]) => void;
  selectAllIfExists: () => void;
  clearSelection: () => void;
};

export const useStatisticSectionsStore = create<State & Actions>((set, get) => ({
  courseId: null,
  assignmentId: null,
  sections: [],
  selectedSectionIds: [],

  setCourseId: (id) => set({ courseId: id }),
  setAssignmentId: (id) => set({ assignmentId: id }),
  setSections: (s) => set({ sections: s }),

  setSelectedByRows: (rows) => {
    const ids = rows.flatMap((r) => r.section_id);
    set({ selectedSectionIds: ids });
  },

  selectAllIfExists: () => {
    const allRow = get().sections.find((s) => s.is_all);
    if (allRow) {
      set({ selectedSectionIds: allRow.section_id });
    }
  },

  clearSelection: () => set({ selectedSectionIds: [] }),
}));
