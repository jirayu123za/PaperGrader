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
}

// ฟังก์ชันสำหรับสร้าง Assignment ใหม่
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

  const response = await axios.post('/api/assignments', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Custom Hook สำหรับการสร้าง Assignment โดยใช้ mutationFn
export const useCreateAssignment = () => {
  const reset = useAssignmentStore((state) => state.reset);

  return useMutation({
    mutationFn: createAssignment, // ใช้ mutationFn ระบุฟังก์ชันที่ต้องการใช้เมื่อมีการเรียกใช้งาน
    onSuccess: () => {
      reset(); // รีเซ็ต state หลังจากสร้างสำเร็จ
    },
    onError: (error: any) => {
      console.error("Error creating assignment:", error); // จัดการข้อผิดพลาดที่นี่
    },
  });
};
