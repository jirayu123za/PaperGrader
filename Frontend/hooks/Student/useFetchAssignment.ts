import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useAssignmentStore } from '@/store/Student/useAssignmentStore';
import { API_BASE } from '@/src/lib/api';

interface StudentAssignment {
  course_id: string;
  submission_id?: string | null;
  assignment_id: string;
  course_code: string;
  course_name?: string;
  assignment_name: string;
  assignment_description: string;
  cut_off_date: string | null;
  due_date: string;
  release_date: string;
  section_name: string;
  has_submitted?: boolean;
}

interface StudentAssignmentsGrouped {
  active: StudentAssignment[];
  over_due: StudentAssignment[];
  submitted: StudentAssignment[];
}

export const useFetchStdAssignments = () => {
  const setAssignments = useAssignmentStore((state) => state.setAssignments);

  return useQuery<StudentAssignmentsGrouped, Error>({
    queryKey: ['assignments'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/student/dashboard`);

      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }

      const data: StudentAssignmentsGrouped = response.data.assignments;
      const groups: StudentAssignmentsGrouped = {
        active: data.active ?? [],
        over_due: data.over_due ?? [],
        submitted: data.submitted ?? [],
      };
      setAssignments(groups);
      return groups;
    },
  });
};
