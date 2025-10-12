import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useQuestionsListStore } from "@/store/question/useQuestionsList";
import { API_BASE, api, qf } from '@/src/lib/api';

interface SubQuestion {
    sub_question_id: string;
    sub_question_title: string;
    sub_question_point: number;
    submission_id: string;
    progress?: number;
    graded_by?: string | null;
}

interface Question {
    question_id: string;
    question_title: string;
    question_point: number;
    submission_id: string | null;
    progress?: number;
    graded_by?: string | null;
    sub_questions?: SubQuestion[];
}

export const useFetchQuestionsList = (assignment_id: string) => {
    const setQuestions = useQuestionsListStore((state) => state.setQuestions);

    return useQuery<Question[]>({
        queryKey: ['questions', assignment_id],
        queryFn: async () => {
            const response = await axios.get(`${API_BASE}/instructor/assignment/questions/noSubmitted`, {
                params: {
                    assignment_id
                }
            });

            const responseData = response.data.questions ?? [];
            setQuestions(responseData);
            return responseData;
        },
        enabled: !!assignment_id,
        refetchOnWindowFocus: false,
    });
};
