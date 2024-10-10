import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect } from 'react';
import { useAssignmentStore } from '../store/useSTD_AssignmentStore';


interface StudentAssignment {
  assignment_id: string;
  course_code: string;
  course_name?: string;
  assignment_name: string;
  due_date: string;
  release_Date: string;
}

const fetchAssignments = async (): Promise<StudentAssignment[]> => {
    const response = await axios.get(`/assignments.json`);
    const assignments = response.data.assignments; // ไม่ต้องแปลง
    return assignments;
  };
  
  export const useAssignments = () => {
    const { setAssignments } = useAssignmentStore();
  
    const query = useQuery<StudentAssignment[], Error>({
      queryKey: ['assignments'],
      queryFn: fetchAssignments,
    });
  
    useEffect(() => {
      if (query.data) {
        setAssignments(query.data); 
      }
    }, [query.data, setAssignments]);
  
    return query;
  };
