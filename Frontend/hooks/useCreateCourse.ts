import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import axios from 'axios';
import { useCreateCourseStore } from '../store/useCreateCourseStore';

interface CreateCourseParams {
  course_code: string;
  course_name: string;
  course_description?: string;
  semester: string;
  academic_year: string;
  entry_code: boolean;
}

const createCourse = async (courseData: CreateCourseParams): Promise<any> => {
  console.log('courseData:', courseData);

  const response = await axios.post('/api/api/course', courseData);
  return response.data;
};

export const useCreateCourse = (): UseMutationResult<
  any,
  Error,
  CreateCourseParams,
  unknown
> => {
  const queryClient = useQueryClient();
  const resetForm = useCreateCourseStore((state) => state.resetForm);

  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (error: Error) => {
      console.error("Error creating course:", error);
    },
    onSettled: () => {
      resetForm();
    },
  });
};
