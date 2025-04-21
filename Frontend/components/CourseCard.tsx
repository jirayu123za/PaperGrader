"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCourseStore } from '../store/useCourseStore';
import CreateCourse from './Create/CreateCourse';
import { ScrollArea } from '@mantine/core';
import { useForm } from '@mantine/form';

interface Course {
  course_id: string;
  course_name: string;
  course_code: string;
  course_description: string;
  total_assignments: string;
  academic_year: string;
  semester: string;
}

interface CourseCardProps {
  courses?: Course[];
  studentMode?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ courses = [], studentMode = false }) => {
  const router = useRouter();
  const { setSelectedCourseId } = useCourseStore();

  // ใช้ useForm สำหรับจัดการสถานะ
  const form = useForm({
    initialValues: {
      isModalOpen: false,
      showOlderCourses: false,
    },
  });

  const groupedCourses = Array.isArray(courses)
    ? courses.reduce((acc: Record<string, Course[]>, course: Course) => {
        const key = `${course.academic_year} / ${course.semester}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(course);
        return acc;
      }, {})
    : {};

  const sortedKeys = Object.keys(groupedCourses).sort().reverse();
  const latestKeys = sortedKeys.slice(0, 2);
  const olderKeys = sortedKeys.slice(2);

  const handleSelectCourse = (course: Course) => {
    setSelectedCourseId(course.course_id);
    if (studentMode) {
      router.push(`/STDCourseOverview/${course.course_id}/CourseDashboard`);
    } else {
      router.push(`/instructor/course/${course.course_id}/dashboard`);
    }
  };

  const handleCreateCourseClick = () => {
    form.setFieldValue('isModalOpen', true);
  };

  return (
    <ScrollArea h={600} type="auto">
      {courses.length === 0 && !studentMode ? (
        <div
          className="p-6 bg-white border-dashed border-2 border-teal-600 shadow-sm rounded-lg cursor-pointer flex items-center justify-center"
          onClick={handleCreateCourseClick}
          style={{ height: 180, width: 380 }}
        >
          <div className="text-teal-600 text-center">
            <div className="text-3xl mb-2">+</div>
            <div className="text-lg">Create a new course</div>
          </div>
        </div>
      ) : (
        <>
          {/* แสดง 2 เทอมล่าสุด */}
          {latestKeys.map((key) => (
            <div key={key} className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{key}</h2>
              <div className="flex flex-wrap gap-5">
                {groupedCourses[key].map((course) => (
                  <div
                    key={course.course_id}
                    className="p-4 bg-gray-100 shadow rounded-lg cursor-pointer relative"
                    style={{
                      width: 380,
                      height: 180,
                    }}
                    onClick={() => handleSelectCourse(course)}
                  >
                    <h2 className="text-base text-gray-600 mb-2">{course.course_code}</h2>
                    <h3 className="text-xl font-semibold mb-2">{course.course_name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{course.course_description}</p>
                    <div className="absolute bottom-0 left-0 right-0 bg-purple-900 text-white p-2 text-center text-sm">
                      {course.total_assignments ? `${course.total_assignments} assignments` : 'No assignments'}
                    </div>
                  </div>
                ))}
                {key === latestKeys[0] && !studentMode && (
                  <div
                    className="p-6 bg-white border-dashed border-2 border-teal-600 shadow-sm rounded-lg cursor-pointer flex items-center justify-center"
                    onClick={handleCreateCourseClick}
                    style={{
                      width: 380,
                      height: 180,
                    }}
                  >
                    <div className="text-teal-600 text-center">
                      <div className="text-3xl mb-2">+</div>
                      <div className="text-lg">Create a new course</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* ปุ่มแสดง/ซ่อนเทอมเก่ากว่า */}
          {olderKeys.length > 0 && (
            <div className="text-left mt-4">
              <button
                className="text-blue-600 underline"
                onClick={() => form.setFieldValue('showOlderCourses', !form.values.showOlderCourses)}
              >
                {form.values.showOlderCourses ? 'Hide older courses' : 'See older courses'}
              </button>
            </div>
          )}

          {/* แสดงเทอมเก่ากว่าเมื่อกดปุ่ม */}
          {form.values.showOlderCourses &&
            olderKeys.map((key) => (
              <div key={key} className="mb-8">
                <h2 className="text-xl font-semibold mb-4">{key}</h2>
                <div className="flex flex-wrap gap-5">
                  {groupedCourses[key].map((course) => (
                    <div
                      key={course.course_id}
                      className="p-4 bg-gray-100 shadow rounded-lg cursor-pointer relative"
                      style={{
                        width: 380,
                        height: 180,
                      }}
                      onClick={() => handleSelectCourse(course)}
                    >
                      <h2 className="text-base text-gray-600 mb-2">{course.course_code}</h2>
                      <h3 className="text-xl font-semibold mb-2">{course.course_name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{course.course_description}</p>
                      <div className="absolute bottom-0 left-0 right-0 bg-purple-900 text-white p-2 text-center text-sm">
                        {course.total_assignments ? `${course.total_assignments} assignments` : 'No assignments'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </>
      )}

      {!studentMode && <CreateCourse isOpen={form.values.isModalOpen} onClose={() => form.setFieldValue('isModalOpen', false)} />}
    </ScrollArea>
  );
};

export default CourseCard;
