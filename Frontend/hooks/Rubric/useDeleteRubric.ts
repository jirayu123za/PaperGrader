import axios from "axios";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE, api, qf } from '@/src/lib/api';

interface DeleteRubricParams {
    assignment_id: string;
    question_id?: string;
    sub_question_id?: string;
    rubric_id: string;
    rubric_detail_id: string;
}

const deleteRubric = async ({ assignment_id, question_id, sub_question_id, rubric_id, rubric_detail_id }: DeleteRubricParams) => {
    const response = await axios.delete(`${API_BASE}/instructor/rubric`, {
        data: {
            question_id: question_id,
            sub_question_id: sub_question_id,
            rubric_id: rubric_id,
            rubric_detail_id: rubric_detail_id
        },
        params: { assignment_id }
    });

    if (response.status !== 200) {
        throw new Error('Network response was not ok');
    }
    return response.data;
};

export const useDeleteRubric = (assignment_id: string, submission_id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteRubric,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['rubric', assignment_id, variables.question_id, variables.sub_question_id] });
            queryClient.invalidateQueries({ queryKey: ['rubric_grader', assignment_id, submission_id, variables.rubric_id, variables.question_id, variables.sub_question_id] });
        },
        onError: (error) => {
        },
    });
};