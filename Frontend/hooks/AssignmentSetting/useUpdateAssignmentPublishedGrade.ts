import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE, api, qf } from '@/src/lib/api';


type Body = {
    assignment_id: string;
    assignment_section_id: string;
    section_id: string;
    published_grade: boolean;
};

const updateAssignmentPublishedGrade = async ({ body, course_id }: { body: Body; course_id: string }) => {
    const { data: publishedResponse } = await axios.put(`${API_BASE}/instructor/assignment/publish/grade`,
        body, {
        params: { course_id },
    });
    return publishedResponse;
}

export const useUpdateAssignmentPublishedGrade = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateAssignmentPublishedGrade,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ins_assignments'] });
        },
        onError: (error: any) => {
        }
    });
}