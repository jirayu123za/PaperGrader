import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useUserStore } from '../../store/usecreatestore';
import axios from 'axios';
import { API_BASE, api, qf } from '@/src/lib/api';

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

const createUser = async (userData: CreateUserParams): Promise<any> => {
  const response = await axios.post(`${API_BASE}/user`, userData);
  return response.data;
};

export const useCreateUser = (
  options?: UseMutationOptions<any, Error, CreateUserParams, unknown>
) => {
  const setUser = useUserStore((state) => state.setUser);
  const setError = useUserStore((state) => state.setError);
  const setLoading = useUserStore((state) => state.setIsLoading);

  return useMutation<any, Error, CreateUserParams, unknown>({
    mutationFn: createUser,
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data: any) => {
      setUser(data);
      setLoading(false);
    },
    onError: (error: Error) => {
      setError(error.message);
      setLoading(false);
    },
  });
};
