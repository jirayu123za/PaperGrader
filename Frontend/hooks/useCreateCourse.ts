// useCreateCourse.ts
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios from 'axios';
import { useCreateCourseStore } from '../store/useCreateCourseStore';

// Interface สำหรับการสร้างคอร์ส
interface CreateCourseParams {
  courseNumber: string;
  courseName: string;
  courseDescription?: string;
  term: string;
  year: string;
  entryCode: boolean;
}

// ฟังก์ชันสำหรับสร้างคอร์สใหม่
const createCourse = async (courseData: CreateCourseParams): Promise<any> => {
  const response = await axios.post('/api/CreateCourse', courseData);
  return response.data; // ค่าที่ถูก return จาก API จะถูกใช้ใน onSuccess หรือ mutateResult
};

// Custom Hook สำหรับการสร้างคอร์ส
export const useCreateCourse = (): UseMutationResult<
  any, // Return type ของ mutation หลังจากการสร้างคอร์ส
  Error, // ประเภทของ Error
  CreateCourseParams, // ประเภทของข้อมูลที่ส่งเข้าไปใน mutation
  unknown // ประเภทของ Context หากไม่ใช้สามารถตั้งเป็น unknown ได้
> => {
  const resetForm = useCreateCourseStore((state) => state.resetForm);

  return useMutation({
    mutationFn: createCourse, // ใช้ mutationFn เพื่อระบุฟังก์ชันที่จะถูกเรียกเมื่อมีการเรียกใช้ mutation
    onSuccess: () => {
      // เมื่อสร้างคอร์สสำเร็จ ให้ทำการ reset ฟอร์ม
      resetForm();
    },
    onError: (error: Error) => {
      // จัดการข้อผิดพลาดที่นี่
      console.error("Error creating course:", error);
    },
    onSettled: () => {
      // จะทำงานเมื่อเสร็จสิ้นการทำงาน (ไม่ว่าจะสำเร็จหรือเกิดข้อผิดพลาด)
      resetForm();
    },
  });
};
