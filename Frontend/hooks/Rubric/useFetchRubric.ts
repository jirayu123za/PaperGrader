import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useRubricStore } from "@/store/rubric/useRubricStore";
import { useQuestionStore } from "@/store/question/useQuestionStore";

interface RubricDetail {
    rubric_detail_id: string;
    rubric_point: number;
    rubric_description: string;
}

interface Rubric {
    rubric_id: string | null;
    rubric_setting: string | null;
    rubric_details: RubricDetail[] | null;
}


export const useFetchRubric = (assignment_id: string) => {
    const setRubricData = useRubricStore((state) => state.setRubricData);
    const { selectedQuestion, defaultSelectedQuestion } = useQuestionStore();
    const target = selectedQuestion ?? defaultSelectedQuestion;

    return useQuery<Rubric, Error>({
        queryKey: ['rubric', assignment_id, target?.question_id, target?.sub_question_id],
        queryFn: async () => {
            const response = await axios.get('/api/api/instructor/rubric', {
                params: {
                    assignment_id: assignment_id,
                    question_id: target?.question_id,
                    sub_question_id: target?.sub_question_id
                }
            });

            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }

            const rubric = response.data.rubric;
            setRubricData(rubric);
            return rubric;
        },
        // enabled: !!assignment_id && !!target?.question_id && !!target?.sub_question_id,
        refetchOnWindowFocus: false,
    });
}