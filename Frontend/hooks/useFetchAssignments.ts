import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAssignmentStore } from '../store/useAssignmentStore';

// สร้าง interface ของ Assignment
interface Assignment {
  assignment_id: string;
  assignment_name: string;
  assignment_release_date: string;
  assignment_due_date: string;
  published: boolean;
  regrades: boolean;
  submiss_by: string;
}

export const useFetchAssignments = (courseId: string, isStudent: boolean) => {
  const setAssignments = useAssignmentStore((state) => state.setAssignments);

  return useQuery<Assignment[], Error>({
    queryKey: ['assignments', courseId, isStudent],
    queryFn: async () => {
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

