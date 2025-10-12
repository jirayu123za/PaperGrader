import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE, api, qf } from '@/src/lib/api';

const updateAssignmentTimeSettings = async ({ timeData, course_id, assignment_id }: { timeData: FormData; course_id: string; assignment_id: string }) => {
    const { data: timeSettingResponse } = await axios.put(`${API_BASE}/instructor/assignment/time`,
        timeData, {
        params: { course_id, assignment_id },
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
    return timeSettingResponse;
}

export const useUpdateAssignmentTimeSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateAssignmentTimeSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ins_assignments'] });
        },
        onError: (error: any) => {
        }
    });
}
