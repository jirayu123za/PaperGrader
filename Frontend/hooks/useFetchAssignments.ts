import { useQuery } from '@tanstack/react-query';
import { useAssignmentStore, useInsAssignmentStore } from '../store/useAssignmentStore';
import axios from 'axios';

interface Assignment {
  assignment_id: string;
  assignment_name: string;
  release_date: string;
  due_date: string;
  cut_off_date: string;
  published: boolean;
  regrades: boolean;
  submiss_by: string;
}

export const useFetchAssignments = (course_id: string) => {
  const setAssignments = useAssignmentStore((state) => state.setAssignments);

  return useQuery<Assignment[], Error>({
    queryKey: ['assignments', course_id],
    queryFn: async () => {
      const response = await axios.get('/api/api/student/assignments', {
        params: { course_id: course_id },
      });

      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }

      const data = response.data.assignments;
      const normalizedData = Array.isArray(data) ? data : [data];
      console.log("Assignments Data:", normalizedData);

      setAssignments(normalizedData || []);
      return normalizedData || [];
    },
    enabled: !!course_id,
  });
};

interface AssignmentSection {
  assignment_id: string;
  assignment_section_id: string;
  cut_off_date: string | null;
  due_date: string | null;
  release_date: string | null;
  section_id: string;
  section_name: string;
}

interface InsAssignment {
  assignment_due_date: string | null;
  assignment_id: string;
  assignment_name: string;
  assignment_release_date: string | null;
  assignment_sections: AssignmentSection[];
  published: boolean;
  regrades: boolean;
  submiss_by: string;
}

export const useFetchInsAssignments = (course_id: string) => {
  const setInsAssignments = useInsAssignmentStore((state) => state.setInsAssignments);

  return useQuery<InsAssignment[], Error>({
    queryKey: ['ins_assignments', course_id],
    queryFn: async () => {
      const response = await axios.get('/api/api/instructor/assignments/sections', {
        params: { course_id },
      });

      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }

      const data: InsAssignment[] = response.data.ins_assignments;
      setInsAssignments(data);
      return data;
    },
    enabled: !!course_id,
  });
}

