import { create } from 'zustand';

export type RubricDetail = {
  rubric_id: string;
  description: string;
  totals_select: number;
};

export type RubricBlock = {
  total_student: number;
  rubrics_detail: RubricDetail[];
};

export type SubQuestionStat = {
  sub_question_id: string;
  question_number: string;   // เช่น "1.1"
  sub_question_title?: string;
  sub_question_point?: number;
  percent_mean: number;
  rubric?: RubricBlock;
};

export type QuestionItem = {
  question_id: string;
  question_number: string;   // เช่น "1"
  question_title?: string;
  question_point?: number;
  percent_mean?: number;
  rubric?: RubricBlock;
  sub_questions?: SubQuestionStat[];
};

export type QuestionsStatisticsIndex = {
  question_id: string;
  question_number: string;
  percent_mean?: number;
  sub_questions?: Pick<SubQuestionStat, 'sub_question_id' | 'question_number' | 'percent_mean'>[];
};

export type AssignmentStatisticsPayload = {
  minimum: number;
  median: number;
  maximum: number;
  mean: number;
  sd: number;
  total_submission: number;
  total_assignment_score: number;
  questions_statistics: QuestionsStatisticsIndex[];
};

export type StatisticsApiResponse = {
  message: string;
  questions_list: QuestionItem[];
  statistics: AssignmentStatisticsPayload;
};

type State = {
  // ฟิลเตอร์ที่ใช้ยิง API (เก็บไว้เพื่อให้หน้าอื่นเข้าถึงได้)
  courseId: string | null;
  assignmentId: string | null;
  sectionIds: string[]; // มักจะมาจาก useStatisticSectionsStore.selectedSectionIds

  // ผลลัพธ์จาก API
  data: StatisticsApiResponse | null;
};

type Actions = {
  setCourseId: (id: string | null) => void;
  setAssignmentId: (id: string | null) => void;
  setSectionIds: (ids: string[]) => void;

  setData: (data: StatisticsApiResponse | null) => void;
  reset: () => void;
};

export const useStatisticsStore = create<State & Actions>((set) => ({
  courseId: null,
  assignmentId: null,
  sectionIds: [],

  data: null,

  setCourseId: (id) => set({ courseId: id }),
  setAssignmentId: (id) => set({ assignmentId: id }),
  setSectionIds: (ids) => set({ sectionIds: ids }),

  setData: (data) => set({ data }),
  reset: () =>
    set({
      courseId: null,
      assignmentId: null,
      sectionIds: [],
      data: null,
    }),
}));
