import React, { useEffect } from 'react';
import { useFetchCourses } from '../hooks/useFetchCourse';
import { useCourseStore } from '../store/useCourseStore';
import CourseCard from '../components/CourseCard';
import LeftINSMain from '../components/LeftINS/LeftOverview'; // นำเข้า Sidebar ฝั่งผู้สอน

const CourseOverview = () => {
  const { data: courses, isLoading, error } = useFetchCourses({ isStudent: false }); // ใช้ hook สำหรับผู้สอน
  const { setCourses } = useCourseStore(); // ใช้ store เพื่อเก็บคอร์ส

  // เมื่อดึงข้อมูล courses ได้แล้ว จะใช้ store เพื่อเก็บข้อมูล
  useEffect(() => {
    if (courses) {
      setCourses(courses); // เก็บข้อมูลคอร์สใน store
    }
  }, [courses, setCourses]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading courses: {error.message}</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar ฝั่งซ้าย */}
      <LeftINSMain />

      {/* เนื้อหาฝั่งขวา */}
      <div className="flex-grow p-8">
        <h1 className="text-3xl font-bold mb-8">Courses Overview</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card สำหรับการสร้างคอร์สใหม่ */}
          <CourseCard studentMode={false} />

          {/* แสดงคอร์สที่ดึงมาจาก API */}
          {courses.map((course: any) => (
            <CourseCard key={course.course_id} course={course} studentMode={false} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseOverview;
