import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useAssignmentStore } from '@/store/Student/useSTD_AssignmentStore';
import { API_BASE, api, qf } from '@/src/lib/api';

interface StudentAssignment {
  course_id: string;
  assignment_id: string;
  course_code: string;
  course_name?: string;
  assignment_name: string;
  assignment_description: string;
  cut_off_date: string;
  due_date: string;
  release_Date: string;
  section_name: string;
  has_submitted?: boolean; 
}

export const useFetchStdAssignments = () => {
  const setAssignments = useAssignmentStore((state) => state.setAssignments);

  return useQuery<StudentAssignment[], Error>({
    queryKey: ['assignments'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/student/dashboard`);

      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }

      const data = response.data.assignments;
      setAssignments(data || []);
      return data;
    },
  });
};
