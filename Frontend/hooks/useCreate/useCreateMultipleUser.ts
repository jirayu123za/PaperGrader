import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const createMultipleUser = async ({ formData, course_id }: { formData: FormData; course_id: string }) => {
    const { data: response } = await axios.post('/api/api/instructor/rosters',
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
            queryClient.invalidateQueries({ queryKey: ['rosters'] });
        },
        onError: (error: any) => {
            console.error("Error creating assignment:", error);
        },
    });
};