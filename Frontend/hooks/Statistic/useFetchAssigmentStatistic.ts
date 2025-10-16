import { useQuery} from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE } from '@/src/lib/api';

export interface Assignment {
  assignment_id: string;
  assignment_name: string;
}


export function useFetchAssignments(course_id: string | null) {
  return useQuery<Assignment[], Error>({
    queryKey: ['exportAssignmentsList', course_id],
    queryFn: async () => {
      if (!course_id) throw new Error('Missing course_id');
      const response = await axios.get<{
        assignments: Assignment[];
        message: string;
      }>(
        `${API_BASE}/instructor/assignments/export`,
        { params: { course_id } }
      );
      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }

      return response.data.assignments;
    },
    enabled: Boolean(course_id),
    refetchOnWindowFocus: false,
  });
}