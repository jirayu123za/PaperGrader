// useCreateCourse.ts
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios from 'axios';
import { useCreateCourseStore } from '../store/useCreateCourseStore';

// Interface สำหรับการสร้างคอร์ส
interface CreateCourseParams {
  course_code: string;
  course_name: string;
  course_description?: string;
  term: string;
  year: string;
  entry_code: boolean;
}

// ฟังก์ชันสำหรับสร้างคอร์สใหม่
const createCourse = async (courseData: CreateCourseParams): Promise<any> => {
  console.log('courseData:', courseData);

  const response = await axios.post('/api/api/course', courseData);
  return response.data;
};

// Custom Hook สำหรับการสร้างคอร์ส
export const useCreateCourse = (): UseMutationResult<
  any,
  Error,
  CreateCourseParams,
  unknown
> => {
  const resetForm = useCreateCourseStore((state) => state.resetForm);

  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      resetForm();
    },
    onError: (error: Error) => {
      console.error("Error creating course:", error);
    },
    onSettled: () => {
      resetForm();
    },
  });
};
