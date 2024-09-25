import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useUserStore } from '../store/usecreatestore';
import axios from 'axios';

interface CreateUserParams {
  email: string;
  firstName: string;
  lastName: string;
  university: string;
  role: string;
  studentID?: string;
  dateOfBirth?: string;
}

// ฟังก์ชันสำหรับการสร้างผู้ใช้ใหม่
const createUser = async (userData: CreateUserParams): Promise<any> => {
  const response = await axios.post('/api/CreateUser', userData);
  return response.data;
};

// การใช้ UseMutationOptions เพื่อกำหนดประเภทของ mutation
export const useCreateUser = (
  options?: UseMutationOptions<any, Error, CreateUserParams, unknown> // เพิ่ม `unknown` เป็น argument สุดท้าย
) => {
  const setUser = useUserStore((state) => state.setUser);
  const setError = useUserStore((state) => state.setError);
  const setLoading = useUserStore((state) => state.setIsLoading);

  return useMutation<any, Error, CreateUserParams, unknown>({
    mutationFn: createUser, // กำหนด mutation function ที่ต้องการใช้
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
