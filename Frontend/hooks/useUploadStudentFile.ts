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
  
  // ใช้ API ที่ถูกต้องในการอัปโหลดไฟล์
  const { data } = await axios.post(`api/api/student/file`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: {
      assignment_id: assignmentId,  // ส่ง assignmentId เป็น query parameter
    },
  });

  return data;
};

export const useUploadStudentFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadStudentFile,
    onSuccess: () => {
      // Refetch data เมื่ออัปโหลดสำเร็จ
      queryClient.invalidateQueries({ queryKey: ['instructorFile'] });
    },
  });
};
