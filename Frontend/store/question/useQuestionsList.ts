import { create } from "zustand";

interface SubQuestion {
    sub_question_id: string;
    sub_question_title: string;
    sub_question_point: number;
    submission_id: string;
}

interface Question {
    question_id: string;
    question_title: string;
    question_point: number;
    submission_id: string | null;
    sub_questions?: SubQuestion[];
}

interface QuestionStore {
    questions: Question[];
    setQuestions: (questions: Question[]) => void;
}

export const useQuestionsListStore = create<QuestionStore>((set, get) => ({
    questions: [],
    setQuestions: (questions) => set({ questions }),
}));