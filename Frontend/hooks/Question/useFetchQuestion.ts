import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useQuestionStore } from "@/store/question/useQuestionStore";

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

    return useQuery<Question[]>({
        queryKey: ['template', assignment_id],
        queryFn: async () => {
            const response = await axios.get(`/api/api/instructor/assignment/template`, {
                params: {
                    assignment_id
                }
            });

            const responseData = response.data.questions.questions_data ?? [];
            const parsedQuestions: Question[] = responseData.map((q: any) => ({
                question_id: q.question_id,
                question_title: q.question_title,
                question_point: q.question_point,
                sub_questions: q.sub_questions?.map((sq: any) => ({
                    sub_question_id: sq.sub_question_id,
                    sub_question_title: sq.sub_question_title,
                    sub_question_point: sq.sub_question_point
                }))
            }));
            setQuestions(parsedQuestions);
            return parsedQuestions;
        },
        enabled: !!assignment_id,
        refetchOnWindowFocus: false
    });
};
