import axios from 'axios';
import { API_BASE } from '@/src/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAssignmentStore } from '@/store/useCreateAssignmentStore';

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
  const queryClient = useQueryClient();
  const reset = useAssignmentStore((state) => state.reset);

  return useMutation({
    mutationFn: createAssignment,
    onSuccess: (_data, variables) => {
      reset();
      queryClient.invalidateQueries({ queryKey: ['assignments', variables.course_id] });
    },
    onError: (error: any) => {
    },
  });
};
