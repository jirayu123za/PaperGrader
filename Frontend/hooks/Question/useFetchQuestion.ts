import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useQuestionStore } from "@/store/question/useQuestionStore";
import { API_BASE, api, qf } from '@/src/lib/api';

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

export const useFetchQuestion = (assignment_id: string) => {
    const setQuestions = useQuestionStore((state) => state.setQuestions);
    const setDefaultSelectedQuestion = useQuestionStore((state) => state.setDefaultSelectedQuestion);

    return useQuery<Question[]>({
        queryKey: ['questions', assignment_id],
        queryFn: async () => {
            const response = await axios.get(`${API_BASE}/instructor/assignment/questions`, {
                params: {
                    assignment_id
                }
            });

            const responseData = response.data.questions ?? [];
            setQuestions(responseData);
            setDefaultSelectedQuestion();
            return responseData;
        },
        enabled: !!assignment_id,
        refetchOnWindowFocus: false,
    });
};
