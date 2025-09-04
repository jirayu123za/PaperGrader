import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';


interface UpdateRubricParams {
    assignment_id: string;
    question_id?: string;
    sub_question_id?: string;
    rubric: {
        rubric_id?: string;
        rubric_details: RubricDetail[];
    };
}

interface RubricDetail {
    rubric_detail_id?: string;
    rubric_point?: number;
    rubric_description?: string;
}

const updateRubric = async ({ assignment_id, question_id, sub_question_id, rubric }: UpdateRubricParams) => {
    const response = await axios.put('/api/api/instructor/rubric', {
        question_id: question_id,
        sub_question_id: sub_question_id,
        rubric: {
            rubric_id: rubric.rubric_id,
            rubric_details: rubric.rubric_details,
        }
    }, { params: { assignment_id } });

    if (response.status !== 200) {
        throw new Error('Network response was not ok');
    }
    return response.data;
};

export const useUpdateRubric = (assignment_id: string, submission_id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateRubric,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['rubric', assignment_id, variables.question_id, variables.sub_question_id] });
            queryClient.invalidateQueries({ queryKey: ['rubric_grader', assignment_id, submission_id, variables.question_id, variables.sub_question_id] });
        },
        onError: (error) => {
        },
    });
};