import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE, api, qf } from '@/src/lib/api';

interface UpdateGradeParams {
    assignment_id: string;
    submission_id: string;
}

interface RequestBody {
    question_id: string;
    sub_question_id?: string | null;
    rubric_id: string;
    rubric_detail_id: string;
    has_selected: boolean;
}

type UpdateGradeInput = {
    params: UpdateGradeParams;
    body: RequestBody;
};


const updateGrade = async ({ params, body }: UpdateGradeInput) => {
    const response = await axios.post(`${API_BASE}/instructor/grade/`, {
        ...body
    }, { params: { ...params } });
    if (response.status !== 201) {
        throw new Error('Failed to update grade');
    }
    return response.data;
};

export const useUpdateGrade = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateGrade,
        onSuccess: (data, variables) => {
            // queryClient.invalidateQueries({'rubric', variables.params.assignment_id, variables.params.submission_id});
        },
    });
};
