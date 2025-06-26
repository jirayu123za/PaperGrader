import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateRubricSettingParams {
    assignment_id: string;
    question_id?: string;
    sub_question_id?: string;
    rubric: {
        rubric_id?: string;
        rubric_setting?: "Positive scoring" | "Negative scoring";
    };
}

const updateRubricScoringMethod = async ({ assignment_id, question_id, sub_question_id, rubric }: UpdateRubricSettingParams) => {
    const response = await axios.put('/api/api/instructor/rubric/setting', {
        question_id: question_id,
        sub_question_id: sub_question_id,
        rubric: {
            rubric_id: rubric.rubric_id,
            rubric_setting: rubric.rubric_setting,
        }
    }, { params: { assignment_id } });

    if (response.status !== 200) {
        throw new Error('Network response was not ok');
    }
    return response.data;
};

export const useUpdateRubricScoringMethod = (assignment_id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateRubricScoringMethod,
        onSuccess: (data, variables) => {
            console.log('Rubric setting updated successfully:', data);
            queryClient.invalidateQueries({ queryKey: ['rubric', assignment_id, variables.question_id, variables.sub_question_id] });
        },
        onError: (error) => {
            console.error('Failed to update rubric setting:', error);
            alert('Failed to update the rubric setting. Please try again.');
        },
    });
};