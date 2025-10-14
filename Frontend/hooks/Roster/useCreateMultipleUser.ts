import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE } from '@/src/lib/api';

const createMultipleUser = async ({ formData, course_id }: { formData: FormData; course_id: string }) => {
    const { data: response } = await axios.post(`${API_BASE}/instructor/rosters`,
        formData, {
        params: { course_id },
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response;
};

export const useCreateMultipleUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createMultipleUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roster'] });
        },
        onError: (error: any) => {
        },
    });
};