import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateRubricParams {
    assignment_id: string;
    question_id?: string;
    sub_question_id?: string;
    rubric: {
        rubric_setting: string;
        rubric_details: RubricDetail[];
    };
}

interface RubricDetail {
    rubric_point?: number;
    rubric_description?: string;
}

const createRubric = async ({ assignment_id, question_id, sub_question_id, rubric }: CreateRubricParams) => {
    const response = await axios.post('/api/api/instructor/rubric', {
        question_id: question_id,
        sub_question_id: sub_question_id,
        rubric: {
            rubric_setting: rubric.rubric_setting,
            rubric_details: rubric.rubric_details,
        }
    }, { params: { assignment_id } });

    if (response.status !== 201) {
        throw new Error('Network response was not ok');
    }
    return response.data;
};

export const useCreateRubric = (assignment_id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createRubric,
        onSuccess: (variables) => {
            queryClient.invalidateQueries({ queryKey: ['rubric', assignment_id, variables.question_id, variables.sub_question_id] });
        },
        onError: (error) => {
        },
    });
}