'use client';
import React, { useEffect } from 'react';
import STD_LeftMain from '@/components/STD/STD_Leftmain';
import CourseCard from '@/components/CourseCard';
import { useFetchStdCourses } from '@/hooks/useFetchCourse';
import { useCourseStore } from '@/store/useCourseStore';

const STDCourse = () => {
  const { data: courses, isLoading, error } = useFetchStdCourses();
  const { setCourses } = useCourseStore();

  useEffect(() => {
    if (courses) {
      setCourses(courses);
    }
  }, [courses, setCourses]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <STD_LeftMain/>

      <div className="grow p-8">
        {courses && Array.isArray(courses) && courses.length > 0 ? (
          <CourseCard courses={courses} studentMode={true} />
        ) : (
          <div className="text-center col-span-full text-gray-500">
            No courses have been joined yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default STDCourse;
