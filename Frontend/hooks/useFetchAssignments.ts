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

// Custom Hook สำหรับดึงข้อมูล assignments ตาม CourseId
export const useFetchAssignments = (courseId: string) => {
  const setAssignments = useAssignmentStore((state) => state.setAssignments);

  return useQuery<Assignment[], Error>({
    queryKey: ['assignments', courseId],
    queryFn: async () => {
      //const response = await fetch(`https://66f1054741537919154f2c12.mockapi.io/api/Course/${courseId}/assignment`);
      const response = await axios.get(`/api/api/instructor/assignments`, {
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
