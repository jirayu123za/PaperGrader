import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  studentId?: string;
  role: string;
  notifyUser: boolean;
}


const createUser = async (userData: UserData) => {
  const response = await axios.post('/api/users', userData);
  return response.data;
};


export const useCreateUser = () => {
  return useMutation({
    mutationFn: createUser,
  });
};
