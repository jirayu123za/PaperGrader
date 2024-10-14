import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAssignmentStore } from '../store/useSTD_AssignmentStore';

interface StudentAssignment {
  assignment_id: string;
  course_code: string;
  course_name?: string;
  assignment_name: string;
  due_date: string;
  release_Date: string;
}

// Function สำหรับดึงข้อมูล assignment
export const useAssignments = (courseId: string) => {
  const setAssignments = useAssignmentStore((state) => state.setAssignments);

  return useQuery<StudentAssignment[], Error>({
    queryKey: ['assignments', courseId],
    queryFn: async () => {
      // ใช้ axios เพื่อส่ง course_id ผ่าน params
      const response = await axios.get(`/api/api/student/dashboard`, {
        params: { course_id: courseId },
      });
      console.log(response);
      
      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }

      // แปลงข้อมูลให้ตรงกับโครงสร้าง StudentAssignment
      const data = response.data.assignments as StudentAssignment[];
      setAssignments(data); // ตั้งค่า assignments ใน Zustand store
      return data;
    },
  });
};
