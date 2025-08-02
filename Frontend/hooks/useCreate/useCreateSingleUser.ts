import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const createSingleUser = async (from: FormData) => {
  const course_id = from.get('course_id');
  const { data: response } = await axios.post('/api/api/instructor/roster',
    from, {
    params: { course_id },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};


export const useCreateSingleUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSingleUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roster'] });
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
    },
    onError: (error: any) => {
    },
  });
};
