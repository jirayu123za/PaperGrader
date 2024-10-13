import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// interface UserData {
//   first_name: string;
//   last_name: string;
//   email: string;
//   student_id?: string;
//   user_group_name: string;
//   // notifyUser: boolean;
// }

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
    },
    onError: (error: any) => {
      console.error("Error creating assignment:", error);
    },
  });
};
