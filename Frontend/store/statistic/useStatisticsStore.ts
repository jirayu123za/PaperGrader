import { create } from "zustand";

// Interfaces for Statistics API Response
// 1.1: Questions_list
interface RubricDetail {
  rubric_id: string;
  description?: string | null;
  totals_select: number;
}

interface Rubrics {
  total_student: number;
  rubrics_detail: RubricDetail[];
}

interface SubQuestions {
  sub_question_id: string;
  question_number: string;
  sub_question_title?: string | null;
  sub_question_point?: number | null;
  mean?: number | null;
  percent_mean?: number | null;
  rubric?: Rubrics | null;
}

interface Questions {
  question_id: string;
  question_number: string;
  question_title?: string | null;
  question_point?: number | null;
  mean?: number | null;
  percent_mean?: number | null;
  rubric?: Rubrics | null;
  sub_questions?: SubQuestions[];
}

// 1.2: Statistics
export interface SubQuestionsStat {
  sub_question_id: string;
  question_number: string;
  percent_mean?: number | null;
}

export interface Question {
  question_id: string;
  question_number: string;
  percent_mean?: number | null;
  sub_questions?: SubQuestionsStat[];
};

interface StatisticsOverview {
  minimum: number;
  median: number;
  maximum: number;
  mean: number;
  sd: number;
  total_submission: number;
  total_assignment_score: number;
  questions_statistics: Question[];
}

export interface statisticsData {
  questions_list: Questions[];
  statistics: StatisticsOverview;
}

interface StatisticsStore {
  assignmentID: string | null;
  sectionIDs: string[];

  setAssignmentID: (id: string | null) => void;
  setSectionIDs: (ids: string[]) => void;

  statisticsData: statisticsData | null;
  setStatisticsData: (data: statisticsData) => void;
};

export const useStatisticsStore = create<StatisticsStore>((set) => ({
  assignmentID: null,
  sectionIDs: [],

  setAssignmentID: (id) => set({ assignmentID: id }),
  setSectionIDs: (ids) => set({ sectionIDs: ids }),

  statisticsData: null,
  setStatisticsData: (data) => set({ statisticsData: data }),
}));
