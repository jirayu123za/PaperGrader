import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useUserStore } from '../store/usecreatestore';
import axios from 'axios';

interface CreateUserParams {
  google_id: string;
  group_id: number;
  first_name: string;
  last_name: string;
  email: string;
  birth_date?: string;
  student_id?: string | null;
  university: string;
}

// ฟังก์ชันสำหรับการสร้างผู้ใช้ใหม่
const createUser = async (userData: CreateUserParams): Promise<any> => {
  console.log('userData:', userData);

  const response = await axios.post('/api/api/user', userData);
  return response.data;
};

// การใช้ UseMutationOptions เพื่อกำหนดประเภทของ mutation
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
