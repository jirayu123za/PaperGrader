import { create } from "zustand";


export type RubricDetail = {
  rubric_id: string;
  description?: string | null;
  totals_select: number;
};

export type RubricBlock = {
  total_student: number;
  rubrics_detail: RubricDetail[];
};

export type SubQuestionStat = {
  sub_question_id: string;
  question_number: string;        
  sub_question_title?: string | null;
  sub_question_point?: number | null;
  mean?: number | null;              
  percent_mean?: number | null;     
  rubric?: RubricBlock | null;
};

export type QuestionItem = {
  question_id: string;
  question_number: string;          
  question_title?: string | null;
  question_point?: number | null;
  mean?: number | null;         
  percent_mean?: number | null;    
  rubric?: RubricBlock | null;
  sub_questions?: SubQuestionStat[];
};

export type QuestionsStatisticsIndex = {
  question_id: string;
  question_number: string;
  percent_mean?: number | null;
  sub_questions?: Array<{
    sub_question_id: string;
    question_number: string;
    percent_mean?: number | null;
  }>;
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
  [k: string]: any;
};

export type StatisticsApiResponse = {
  message?: string;
  questions_list: QuestionItem[];
  statistics: AssignmentStatisticsPayload;
};


type StatisticsStore = {
  courseId: string | null;
  assignmentId: string | null;
  sectionIds: string[];

  data: StatisticsApiResponse | null;
  isLoading: boolean;
  isError: boolean;
  errorMsg: string | null;

  setCourseId: (id: string | null) => void;
  setAssignmentId: (id: string | null) => void;
  setSectionIds: (ids: string[]) => void;

  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
  setData: (payload: StatisticsApiResponse | null) => void;
};

export const useStatisticsStore = create<StatisticsStore>((set) => ({
  courseId: null,
  assignmentId: null,
  sectionIds: [],

  data: null,
  isLoading: false,
  isError: false,
  errorMsg: null,

  setCourseId: (id) => set({ courseId: id }),
  setAssignmentId: (id) => set({ assignmentId: id }),
  setSectionIds: (ids) => set({ sectionIds: ids }),

  setLoading: (v) => set({ isLoading: v, isError: v ? false : undefined, errorMsg: v ? null : undefined }),
  setError: (msg) => set({ isError: !!msg, errorMsg: msg ?? null, isLoading: false }),
  setData: (payload) => set({ data: payload, isLoading: false, isError: false, errorMsg: null }),
}));
