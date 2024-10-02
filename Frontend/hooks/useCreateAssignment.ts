// useCreateAssignment.ts
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAssignmentStore } from '../store/AssignmentStore';

// Interface สำหรับข้อมูล Assignment
interface AssignmentData {
  assignmentName: string;
  templateFile: File | null;
  uploadBy: string;
  releaseDate: string;
  dueDate: string;
  allowLateSubmission: boolean;
  cutOffDate: string;
}

const createAssignment = async (assignmentData: AssignmentData) => {
  const formData = new FormData();

  formData.append('assignmentName', assignmentData.assignmentName);

  if (assignmentData.templateFile) {
    formData.append('templateFile', assignmentData.templateFile);
  }

  formData.append('uploadBy', assignmentData.uploadBy);
  formData.append('releaseDate', assignmentData.releaseDate);
  formData.append('dueDate', assignmentData.dueDate);
  formData.append('allowLateSubmission', String(assignmentData.allowLateSubmission));

  if (assignmentData.allowLateSubmission) {
    formData.append('cutOffDate', assignmentData.cutOffDate);
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
