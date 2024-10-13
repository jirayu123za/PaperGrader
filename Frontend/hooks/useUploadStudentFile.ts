import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface UploadFileParams {
  assignmentId: string;
  file: File;
}

// Hook สำหรับอัปโหลดไฟล์ของนักศึกษา
const uploadStudentFile = async ({ assignmentId, file }: UploadFileParams) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await axios.post(`/api/assignments/${assignmentId}/student-file`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
};

export const useUploadStudentFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadStudentFile,
    onSuccess: () => {
      // Refetch data when the upload is successful
      queryClient.invalidateQueries({ queryKey: ['instructorFile'] });
    },
  });
};
