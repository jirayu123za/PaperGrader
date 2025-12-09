import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { API_BASE } from '@/src/lib/api';

interface CreateUserParams {
  google_id: string | null;
  group_id: number;
  first_name: string;
  last_name: string;
  email: string;
  birth_date?: string;
  student_id?: string | null;
  university: string;
}

const createUser = async (userData: CreateUserParams) => {
  const { data } = await axios.post(`${API_BASE}/user`, {
    ...userData,
  });
  return data;
};

export const useCreateUser = () => {
  return useMutation({
    mutationFn: createUser,
  });
};