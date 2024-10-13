import { useMutation } from '@tanstack/react-query';
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
  const { data: response } = await axios.post('/api/users', from);
  return response;
};


export const useCreateSingleUser = () => {
  return useMutation({
    mutationFn: createSingleUser,
    onSuccess: () => {
    },
    onError: (error: any) => {
      console.error("Error creating assignment:", error);
    },
  });
};
