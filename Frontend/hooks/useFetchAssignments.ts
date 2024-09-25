import { useQuery } from '@tanstack/react-query';
import { useAssignmentStore } from '../store/useAssignmentStore'; // นำเข้า Zustand store

// สร้าง interface ของ Assignment
interface Assignment {
  assignment_id: string;
  CourseId: string;
  assignment_name: string;
  assignment_decription: string;
  assignment_duedate: string;
}

// Custom Hook สำหรับดึงข้อมูล assignments ตาม CourseId
export const useFetchAssignments = (courseId: string) => {
  const setAssignments = useAssignmentStore((state) => state.setAssignments); // ดึงฟังก์ชัน setAssignments จาก Zustand store

  return useQuery<Assignment[], Error>({
    queryKey: ['assignments', courseId], // ใช้ courseId เป็นส่วนหนึ่งของ queryKey
    queryFn: async () => {
      const response = await fetch(`https://66f1054741537919154f2c12.mockapi.io/api/Course/${courseId}/assignment`); // แก้ URL ให้ตรงกับ API ที่ดึงข้อมูล assignment ตาม courseId
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setAssignments(data); // เก็บข้อมูล assignments ใน Zustand store
      return data;
    },
  });
};
