import { useQuery } from '@tanstack/react-query';
import { useCourseStore } from '../store/useCourseStore';

// เปลี่ยนชื่อฟังก์ชันเป็น useFetchCourses เพื่อบ่งบอกว่าดึงข้อมูล courses ทั้งหมด
export const useFetchCourses = () => {
  const setCourses = useCourseStore((state) => state.setCourses);

  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      //const response = await fetch('https://66f1054741537919154f2c12.mockapi.io/api/Course');
      const response = await fetch('api/api/instructor/courses');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();

      const transformedData = data.courses.map((course: any) => ({
        course_id: course.course_id,
        course_name: course.course_name,
        course_code: course.course_code,
        course_description: course.course_description,
        semester: course.semester,
        academic_year: course.academic_year,
        entry_code: course.entry_code,
      }));

      setCourses(transformedData);
      return transformedData;
    }
  });
};
