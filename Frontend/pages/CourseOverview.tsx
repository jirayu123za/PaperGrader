// CourseOverview.tsx
import React from 'react';
import { useFetchCourses } from '../hooks/useFetchCourse'; // Import custom hook
import { useCourseStore } from '../store/useCourseStore'; // Import Zustand store
import CourseCard from '../components/CourseCard'; // Import CourseCard component


const CourseOverview = () => {
  const { data: courses, isLoading, error } = useFetchCourses(); // ดึงข้อมูล courses ทั้งหมด
  const selectedCourseId = useCourseStore((state) => state.selectedCourseId); // ดึง selectedCourseId จาก store

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading courses: {error.message}</div>;
    
  return (
    <div className="flex min-h-screen bg-gray-50">

      <div className="flex-grow p-8">
        <h1 className="text-3xl font-bold mb-8">Courses Overview</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CourseCard /> {/* Card สำหรับ Create a new course */}
          {courses.map((course :any) => (
            <CourseCard key={course.course_id} course={course} /> // แสดง CourseCard สำหรับแต่ละ course
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseOverview;
