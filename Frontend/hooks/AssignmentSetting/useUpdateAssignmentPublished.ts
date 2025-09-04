import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type Body = {
    assignment_id: string;
    assignment_section_id: string;
    section_id: string;
    published: boolean;
};

const updateAssignmentPublished = async ({ body, course_id }: { body: Body; course_id: string }) => {
    const { data: publishedResponse } = await axios.put(`/api/api/instructor/assignment/publish`,
        body, {
        params: { course_id },
    });
    return publishedResponse;
}

export const useUpdateAssignmentPublished = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateAssignmentPublished,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ins_assignments'] });
        },
        onError: (error: any) => {
        }
    });
}