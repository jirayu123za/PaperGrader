import { useMutation } from '@tanstack/react-query';
import { useFileStore } from '../store/FileStore';

const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('File upload failed');
  }

  return response.json();
};

export const useUploadFile = () => {
  const { file } = useFileStore();  // รับไฟล์จาก store

  return useMutation({
    mutationFn: async () => {
      if (!file) {
        throw new Error('No file selected');
      }
      return await uploadFile(file);  // ใช้ไฟล์จาก store ในการอัพโหลด
    },
    onSuccess: (data) => {
      console.log('File uploaded successfully:', data);
      // ดำเนินการเพิ่มเติมตามความต้องการ เช่น อัปเดต state หรือแสดงผล
    },
    onError: (error: any) => {
      console.error('Error uploading file:', error.message);
    },
  });
};
