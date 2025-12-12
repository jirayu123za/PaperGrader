import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useCourseStore, useInsCourseStore, useStdCourseDashboardStore } from '../store/useCourseStore';
import { API_BASE } from '@/src/lib/api';

interface FetchInsCoursesResponse {
  course_id: string;
  course_name: string;
  course_code: string;
  course_description: string;
  semester: number;
  academic_year: number;
  entry_code: boolean;
  total_assignments: number;
  term_key: number;
  term_label: string;
};

export const useFetchInsCourses = () => {
  const setCourses = useCourseStore((state) => state.setCourses);

  return useQuery<FetchInsCoursesResponse[], Error>({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/instructor/courses`);

      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }

      const data = response.data.courses;
      setCourses(data || []);
      return data;
    },
  });
}

export const useFetchStdCourses = () => {
  const setCourses = useCourseStore((state) => state.setCourses);

  return useQuery<FetchInsCoursesResponse[], Error>({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/student/courses`);

      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }

      const data = response.data.courses;
      setCourses(data || []);
      return data;
    },
  });
};

export const useFetchStdCourse = (course_id: string) => {
  const setCourse = useStdCourseDashboardStore((state) => state.setCourse);

  return useQuery<FetchInsCoursesResponse[], Error>({
    queryKey: ['course'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/student/course`, {
        params: { course_id: course_id },
      });

      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }

      const data = response.data.course;
      setCourse(data || null);
      return data || null;
    },
    enabled: !!course_id,
  });
};

interface FetchCourseResponse {
  course_id: string;
  course_name: string;
  course_code: string;
  course_description: string;
  semester: string;
  academic_year: string;
  entry_code: string;
}

export const useFetchCourse = (course_id: string) => {
  const setInsCourse = useInsCourseStore((state) => state.setCourses);

  return useQuery<FetchCourseResponse>({
    queryKey: ['course', course_id],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/instructor/course`, {
        params: { course_id: course_id },
      });

      setInsCourse(response.data.course);
      return response.data || null;
    },
    enabled: !!course_id,
  });
}