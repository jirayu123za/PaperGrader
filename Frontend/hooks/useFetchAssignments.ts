import { useQuery } from '@tanstack/react-query';
import { useAssignmentStore, useAssignmentsListTableStore } from '../store/useAssignmentStore';
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

interface AssignmentsList {
  assignment_id: string;
  assignment_name: string;
  assignment_sections: AssignmentsSectionList[];
  published: boolean;
  regrades: boolean;
  submiss_by: string;
}

interface AssignmentsSectionList {
  assignment_id: string;
  assignment_section_id: string;
  release_date: string | null;
  due_date: string | null;
  cut_off_date: string | null;
  section_id: string;
  section_name: string;
}

export const useFetchAssignmentsTable = (course_id: string) => {
  const setAssignmentList = useAssignmentsListTableStore((state) => state.setAssignmentList);

  return useQuery<AssignmentsList[], Error>({
    queryKey: ['ins_assignments', course_id],
    queryFn: async () => {
      const response = await axios.get('/api/api/instructor/assignments/sections', {
        params: { course_id },
      });

      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }

      const data: AssignmentsList[] = response.data.ins_assignments;
      setAssignmentList(data);
      return data;
    },
    enabled: !!course_id,
    refetchOnWindowFocus: false,
  });
}

