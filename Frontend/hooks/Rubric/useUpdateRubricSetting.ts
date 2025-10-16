import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE } from '@/src/lib/api';

// Part 1: Update rubric scoring method
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
    const response = await axios.put(`${API_BASE}/instructor/rubric/setting`, {
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

// Part 2: Update rubric score bounds
interface UpdateRubricScoreBounds {
    assignment_id: string;
    question_id?: string;
    sub_question_id?: string;
    rubric: {
        rubric_id?: string;
        has_ceiling: boolean;
        has_floor: boolean;
    };
}

const updateRubricScoreBounds = async ({ assignment_id, question_id, sub_question_id, rubric }: UpdateRubricScoreBounds) => {
    const response = await axios.put(`${API_BASE}/instructor/rubric/scoreBounds`, {
        question_id: question_id,
        sub_question_id: sub_question_id,
        rubric: {
            rubric_id: rubric.rubric_id,
            has_ceiling: rubric.has_ceiling,
            has_floor: rubric.has_floor,
        }
    }, { params: { assignment_id } });

    if (response.status !== 200) {
        throw new Error('Network response was not ok');
    }
    return response.data;
};

export const useUpdateRubricScoreBounds = (assignment_id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateRubricScoreBounds,
        onSuccess: (data, variables) => {
            console.log('Rubric score bounds updated successfully:', data);
            queryClient.invalidateQueries({ queryKey: ['rubric', assignment_id, variables.question_id, variables.sub_question_id] });
        },
        onError: (error) => {
            console.error('Failed to update rubric score bounds:', error);
            alert('Failed to update the rubric score bounds. Please try again.');
        },
    });
};