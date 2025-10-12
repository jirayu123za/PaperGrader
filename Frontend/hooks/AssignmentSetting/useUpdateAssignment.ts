import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE, api, qf } from '@/src/lib/api';


const updateAssignment = async ({ formData, course_id, assignment_id }: { formData: FormData; course_id: string; assignment_id: string }) => {
    const { data: assignmentResponse } = await axios.put(`${API_BASE}/instructor/assignment/`,
        formData, {
        params: { course_id, assignment_id },
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return assignmentResponse;
}

export const useUpdateAssignment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateAssignment,
        onSuccess: () => {
            console.log("Assignment updated successfully");
            queryClient.invalidateQueries({ queryKey: ['ins_assignments'] });
        },
        onError: (error: any) => {
            console.error("Error updating assignment:", error);
        },
    });
};