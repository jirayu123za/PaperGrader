import { create } from 'zustand';

export type StatisticSection = {
  section_id: string[];
  section_name: string;
  is_all?: boolean;
};

type State = {
  assignmentID: string | null;
  sections: StatisticSection[];
  selectedSections: StatisticSection[];
  selectedSectionIDs: string[];

  setAssignmentID: (id: string | null) => void;
  setSections: (rows: StatisticSection[]) => void;
  setSelectedSections: (rows: StatisticSection[]) => void;
};


export const useStatisticSectionsStore = create<State>((set) => ({
  assignmentID: null,
  sections: [],
  selectedSections: [],
  selectedSectionIDs: [],

  setAssignmentID: (id) =>
    set({
      assignmentID: id,
      sections: [],
      selectedSections: [],
      selectedSectionIDs: [],
    }),

  setSections: (rows) => {
    const allRow = rows.find((r) => r.is_all);
    if (allRow) {
      set({
        sections: rows,
        selectedSections: [allRow],
        selectedSectionIDs: allRow.section_id.map(String),
      });
    } else {
      set({
        sections: rows,
        selectedSections: [],
        selectedSectionIDs: [],
      });
    }
  },

  setSelectedSections: (rows) => {
    const allRow = rows.find((r) => r.is_all);
    if (allRow) {
      set({
        selectedSections: [allRow],
        selectedSectionIDs: allRow.section_id.map(String),
      });
    } else {
      set({
        selectedSections: rows,
        selectedSectionIDs: rows.map((r) => String(r.section_id[0])),
      });
    }
  },
}));
