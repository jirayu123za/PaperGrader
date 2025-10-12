import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { API_BASE, api, qf } from '@/src/lib/api';

interface UploadFileParams {
  assignment_id: string;
  course_id: string;
  file: File;
}

const uploadStudentFile = async ({ assignment_id, course_id, file }: UploadFileParams) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await axios.post(`${API_BASE}/student/file`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: {
      assignment_id,
      course_id,
    },
  });

  return data;
};

export const useUploadStudentFile = () => {
  return useMutation({
    mutationFn: uploadStudentFile,
    onSuccess: (_data, variables) => {
      // ✅ แจ้งเตือนสำเร็จ พร้อมชื่อไฟล์
      notifications.show({
        title: '✅ File uploaded successfully!',
        message: `📄 Submission File name: ${variables.file.name}`,
        color: 'green',
        autoClose: 5000,
        position: 'bottom-right',
      });
    },
    onError: () => {
      // ❌ แจ้งเตือนล้มเหลว
      notifications.show({
        title: '❌ Upload failed',
        message: 'Failed to upload the file. Please try again.',
        color: 'red',
        autoClose: 5000,
        position: 'bottom-right',
      });
    },
  });
};
