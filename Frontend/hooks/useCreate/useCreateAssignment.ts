import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useAssignmentStore } from '../../store/useCreateAssignmentStore';
import { API_BASE, api, qf } from '@/src/lib/api';

const createAssignment = async ({ formData, course_id }: { formData: FormData; course_id: string }) => {
  const { data: assignmentResponse } = await axios.post(`${API_BASE}/instructor/assignment/files`,
    formData, {
    params: { course_id },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return assignmentResponse;
};

export const useCreateAssignment = () => {
  const reset = useAssignmentStore((state) => state.reset);

  return useMutation({
    mutationFn: createAssignment,
    onSuccess: () => {
      reset();
    },
    onError: (error: any) => {
    },
  });
};
