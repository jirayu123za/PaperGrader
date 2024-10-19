// CourseOverview.tsx
import React from 'react';
import { useFetchCourses } from '../hooks/useFetchCourse';
import { useCourseStore } from '../store/useCourseStore';
import CourseCard from '../components/CourseCard';
import STD_LeftMain from '../components/LeftINS/LeftOverview'; // นำเข้า LeftMain

const CourseOverview = () => {
  const { data: courses, isLoading, error } = useFetchCourses();
  const selectedCourseId = useCourseStore((state) => state.selectedCourseId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading courses: {error.message}</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar ฝั่งซ้าย */}
      <STD_LeftMain/> {/* ส่งค่า studentId เพื่อใช้งานในเมนู */}

      {/* เนื้อหาฝั่งขวา */}
      <div className="flex-grow p-8">
        <h1 className="text-3xl font-bold mb-8">Courses Overview</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CourseCard /> {/* Card สำหรับ Create a new course */}
          {courses.map((course: any) => (
            <CourseCard key={course.course_id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseOverview;
