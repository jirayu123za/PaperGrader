import { useEffect } from 'react';
import { useStudentListStore } from '../store/useStudentListStore';

const mockStudentList = [
  { student_id: 's001', student_name: 'John Doe' },
  { student_id: 's002', student_name: 'Alice Smith' },
  { student_id: 's003', student_name: 'Bob Lee' },
  { student_id: 's004', student_name: 'Emma Watson' },
  { student_id: 's005', student_name: 'Michael Chan' },
];

export const useFetchStudentList = (course_id: string) => {
  const { setStudentList } = useStudentListStore();

  // Mock loading state
  const isLoading = course_id ? false : true;

  useEffect(() => {
    if (!course_id) return;

    // Simulate API call delay
    const timeout = setTimeout(() => {
      setStudentList(mockStudentList);
    }, 500);

    return () => clearTimeout(timeout);
  }, [course_id, setStudentList]);

  return { isLoading };
};
