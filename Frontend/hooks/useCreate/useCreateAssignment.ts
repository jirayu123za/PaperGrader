import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAssignmentStore } from '../../store/useCreateAssignmentStore';

const createAssignment = async ({ formData, course_id }: { formData: FormData; course_id: string }) => {
  const { data: assignmentResponse } = await axios.post('/api/api/instructor/assignment/files',
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
      console.error("Error creating assignment:", error);
    },
  });
};
