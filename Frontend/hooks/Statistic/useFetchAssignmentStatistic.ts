import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { API_BASE } from '@/src/lib/api';
import { useAssignmentStatisticStore } from '@/store/statistic/useAssignmentStatisticStore';

export interface Assignment {
  assignment_id: string;
  assignment_name: string;
}

export function useFetchAssignments(course_id: string | null) {
  const setAssignmentsList = useAssignmentStatisticStore((s) => s.setAssignmentsList);

  return useQuery<Assignment[], Error>({
    queryKey: ['assignments-list', course_id],
    queryFn: async () => {
      const response = await axios.get<{ assignments: Assignment[], message: string }>(
        `${API_BASE}/instructor/assignments/export`, {
        params: { course_id }
      }
      );

      setAssignmentsList(
        response.data.assignments.map((a) => ({
          value: a.assignment_id,
          label: a.assignment_name,
        }))
      );

      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }
      return response.data.assignments;
    },
    enabled: !!course_id,
    refetchOnWindowFocus: false,
  });
}