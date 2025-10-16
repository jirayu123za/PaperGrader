import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useRubricGradeStore } from "@/store/rubric/useRubricGradeStore";
import { API_BASE } from '@/src/lib/api';

interface RubricDetail {
    rubric_detail_id: string;
    rubric_point: number;
    rubric_description: string;
    has_selected: boolean;
}

interface Rubric {
    rubric_id: string | null;
    has_ceiling: boolean;
    has_floor: boolean;
    rubric_setting: string | null;
    rubric_details: RubricDetail[] | null;
}

export const useFetchRubricParams = (assignment_id: string, submission_id: string, question_id: string, sub_question_id?: string | undefined) => {
    const setRubricData = useRubricGradeStore((state) => state.setRubricData);

    return useQuery<Rubric, Error>({
        queryKey: ["rubric_grader", assignment_id, submission_id, question_id, sub_question_id],
        queryFn: async () => {
            const response = await axios.get(`${API_BASE}/instructor/rubric/graded`, {
                params: {
                    assignment_id,
                    submission_id,
                    question_id,
                    sub_question_id,
                },
            });

            if (response.status !== 200) {
                throw new Error("Network response was not ok");
            }

            const rubric = response.data.rubric;
            setRubricData(rubric);
            return rubric;
        },
        enabled: !!assignment_id && !!submission_id && !!question_id,
        refetchOnWindowFocus: false,
    });
};
