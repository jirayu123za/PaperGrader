import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAssignmentStore } from '../store/AssignmentStore';

// Interface สำหรับข้อมูล Assignment
interface AssignmentData {
  assignment_name: string;
  templateFile: File | null;
  submiss_by: string;
  release_date: string;
  due_date: string;
  group_submiss: boolean;
  late_submiss: boolean;
  cut_off_date: string;
}

const createAssignment = async (assignmentData: AssignmentData) => {
  const formData = new FormData();

  formData.append('assignment_name', assignmentData.assignment_name);

  if (assignmentData.templateFile) {
    formData.append('templateFile', assignmentData.templateFile);
  }

  formData.append('submiss_by', assignmentData.submiss_by);
  formData.append('release_date', assignmentData.release_date);
  formData.append('due_date', assignmentData.due_date);
  formData.append('group_submiss', String(assignmentData.group_submiss));
  formData.append('late_submiss', String(assignmentData.late_submiss));

  if (assignmentData.late_submiss) {
    formData.append('cut_off_date', assignmentData.cut_off_date);
  }

  const response = await axios.post('/api/api/assignment', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
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
