// CourseOverview.tsx
import React from 'react';
import { useFetchCourses } from '../hooks/useFetchCourse';
import { useCourseStore } from '../store/useCourseStore';
import CourseCard from '../components/CourseCard';


const CourseOverview = () => {
  const { data: courses, isLoading, error } = useFetchCourses();
  const selectedCourseId = useCourseStore((state) => state.selectedCourseId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading courses: {error.message}</div>;
    

  return (
    <div className="flex min-h-screen bg-gray-50">

      <div className="flex-grow p-8">
        <h1 className="text-3xl font-bold mb-8">Courses Overview</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CourseCard /> {/* Card สำหรับ Create a new course */}
          {courses.map((course :any) => (
            <CourseCard key={course.course_id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseOverview;
