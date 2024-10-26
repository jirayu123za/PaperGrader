import { useQuery } from '@tanstack/react-query';
import { useCourseStore } from '../store/useCourseStore';

interface FetchCoursesOptions {
  isStudent: boolean; // ระบุว่าเป็นนักศึกษาหรือไม่
}

export const useFetchCourses = ({ isStudent }: FetchCoursesOptions) => {
  const setCourses = useCourseStore((state) => state.setCourses);

  return useQuery({
    queryKey: ['courses', isStudent],
    queryFn: async () => {
      const apiUrl = isStudent
        ? '/api/api/student/courses' // API สำหรับนักศึกษา
        : '/api/api/instructor/courses'; // API สำหรับผู้สอน

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();

      // ตรวจสอบว่า data.courses เป็น array ที่ถูกต้อง
      if (!data.courses || !Array.isArray(data.courses)) {
        return []; // ส่งกลับ array ว่างเมื่อไม่มีข้อมูลคอร์ส
      }

      // แปลงข้อมูลให้ตรงกับโครงสร้างของ courses
      const transformedData = data.courses.map((course: any) => ({
        course_id: course.course_id,
        course_name: course.course_name,
        course_code: course.course_code,
        course_description: course.course_description,
        semester: course.semester,
        academic_year: course.academic_year,
        entry_code: course.entry_code,
        total_assignments: course.total_assignments,
      }));

      setCourses(transformedData); // เก็บข้อมูลใน store
      return transformedData;
    },
  });
};
