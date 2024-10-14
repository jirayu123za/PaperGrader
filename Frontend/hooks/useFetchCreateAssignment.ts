import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAssignmentStore } from '../store/useCreateAssignmentStore';

// interface AssignmentData {
//   course_id: string;
//   assignment_name: string;
//   assignment_description: string;
//   templateFile: File | null;
//   submiss_by: string;
//   release_date: string;
//   due_date: string;
//   group_submiss: boolean;
//   late_submiss: boolean;
//   cut_off_date: string;
// }

const createAssignment = async (formData: FormData) => {
  const course_id = formData.get('course_id');
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
