import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAssignmentStore } from '../store/useAssignmentStore';

// สร้าง interface ของ Assignment
interface Assignment {
  assignment_id: string;
  CourseId: string;
  assignment_name: string;
  //assignment_decription: string;
  assignment_release_date: string;
  assignment_due_date: string;
  assignment_cut_off_date: string;
  
}

// Custom Hook สำหรับดึงข้อมูล assignments ตาม CourseId และ role ของผู้ใช้
export const useFetchAssignments = (courseId: string, isStudent: boolean) => {
  const setAssignments = useAssignmentStore((state) => state.setAssignments);

  return useQuery<Assignment[], Error>({
    queryKey: ['assignments', courseId, isStudent],
    queryFn: async () => {
      // เลือกใช้ API ตาม role ของผู้ใช้งาน (Instructor หรือ Student)
      const apiEndpoint = isStudent
        ? '/api/api/student/assignments'
        : '/api/api/instructor/assignments';

      const response = await axios.get(apiEndpoint, {
        params: { course_id: courseId },
      });

      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }

      const data = response.data.assignments;
      setAssignments(data);
      return data;
    },
  });
};
