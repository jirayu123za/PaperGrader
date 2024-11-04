import React, { useEffect } from 'react';
import { useFetchCourses } from '../hooks/useFetchCourse';
import { useCourseStore } from '../store/useCourseStore';
import CourseCard from '../components/CourseCard';
import LeftINSMain from '../components/LeftINS/LeftOverview';

const INSCourseOverview = () => {
  const { data: courses, isLoading, error } = useFetchCourses({ isStudent: false });
  const { setCourses } = useCourseStore();

  // เมื่อดึงข้อมูล courses ได้แล้ว จะใช้ store เพื่อเก็บข้อมูล
  useEffect(() => {
    if (courses) {
      setCourses(courses);
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
        {courses && <CourseCard courses={courses} studentMode={false} />}
      </div>
    </div>
  );
};

export default INSCourseOverview;
