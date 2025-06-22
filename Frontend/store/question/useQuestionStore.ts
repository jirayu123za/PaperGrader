import { create } from "zustand";

interface SubQuestion {
    sub_question_id: string;
    sub_question_title: string;
    sub_question_point: number;
}

interface Question {
    question_id: string;
    question_title: string;
    question_point: number;
    sub_questions?: SubQuestion[];
}

interface QuestionStore {
    questions: Question[];
    setQuestions: (questions: Question[]) => void;

    selectedQuestion: SelectedQuestion | null;
    selectQuestion: (selected: SelectedQuestion) => void;

    defaultSelectedQuestion: SelectedQuestion | null;
    setDefaultSelectedQuestion: () => void;
}

interface SelectedQuestion {
    question_id: string;
    sub_question_id?: string;
}

export const useQuestionStore = create<QuestionStore>((set, get) => ({
    questions: [],
    setQuestions: (questions) => set({ questions }),

    selectedQuestion: null,
    selectQuestion: (selected) => set({ selectedQuestion: selected }),

    defaultSelectedQuestion: null,
    setDefaultSelectedQuestion: () => {
        const questions = get().questions;

        let defaultSelected: SelectedQuestion | null = null;

        if (questions.length > 0) {
            const first = questions[0];

            if (first.sub_questions && first.sub_questions.length > 0) {
                defaultSelected = {
                    question_id: first.question_id,
                    sub_question_id: first.sub_questions[0].sub_question_id,
                };
            } else {
                defaultSelected = {
                    question_id: first.question_id,
                };
            }

            set({
                selectedQuestion: defaultSelected,
                defaultSelectedQuestion: defaultSelected,
            });
        }
    },
}));