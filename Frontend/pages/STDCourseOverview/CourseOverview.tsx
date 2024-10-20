import React, { useEffect } from 'react';
import STD_LeftMain from '../../components/STD/STD_Leftmain';
import CourseCard from '../../components/CourseCard';
import { useFetchCourses } from '../../hooks/useFetchCourse';
import { useCourseStore } from '../../store/useCourseStore';

const STDCourse = () => {
  const { data: courses, isLoading, error } = useFetchCourses({ isStudent: true }); // ใช้ hook สำหรับนักศึกษา
  const { setCourses } = useCourseStore(); // ใช้ store เพื่อเก็บคอร์ส

  // เมื่อดึงข้อมูล courses ได้แล้ว จะใช้ store เพื่อเก็บข้อมูล
  useEffect(() => {
    if (courses) {
      setCourses(courses); // เก็บข้อมูลคอร์สใน store
    }
  }, [courses, setCourses]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ซ้ายมือเป็น Sidebar ของนักศึกษา */}
      <STD_LeftMain />

      {/* ขวามือแสดงคอร์สที่ดึงมาจาก API */}
      <div className="w-3/4 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course: any) => (
          <CourseCard key={course.course_id} course={course} studentMode={true}  />
        ))}
      </div>
    </div>
  );
};

export default STDCourse;
