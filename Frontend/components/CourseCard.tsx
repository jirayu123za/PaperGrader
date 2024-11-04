import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useCourseStore } from '../store/useCourseStore';
import CreateCourse from './Create/CreateCourse';

interface Course {
  course_id: string;
  course_name: string;
  course_code: string;
  description: string;
  total_assignments: string;
  academic_year: string;
  semester: string;
}

interface CourseCardProps {
  courses: Course[];
  studentMode?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ courses, studentMode = false }) => {
  const { setSelectedCourseId } = useCourseStore();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOlderCourses, setShowOlderCourses] = useState(false);

  // การจัดกลุ่มคอร์สตามปีการศึกษาและเทอม
  const groupedCourses = courses.reduce((acc: Record<string, Course[]>, course: Course) => {
    const key = `${course.academic_year} / ${course.semester}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(course);
    return acc;
  }, {});

  const sortedKeys = Object.keys(groupedCourses).sort().reverse();
  const latestKeys = sortedKeys.slice(0, 2); // ดึง 2 เทอมล่าสุด
  const olderKeys = sortedKeys.slice(2); // ดึงเทอมที่เก่ากว่า

  const handleSelectCourse = (course: Course) => {
    setSelectedCourseId(course.course_id);
    if (studentMode) {
      router.push(`/STDCourseOverview/${course.course_id}/CourseDashboard`);
    } else {
      router.push(`/courses/${course.course_id}`);
    }
  };

  const handleCreateCourseClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div style={{ maxHeight: '600px', overflowY: 'auto' }}> {/* เลื่อนเฉพาะคอมโพเนนต์ */}
      {/* แสดง 2 เทอมล่าสุด */}
      {latestKeys.map((key) => (
        <div key={key} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{key}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {groupedCourses[key].map((course) => (
              <div
                key={course.course_id}
                className="p-4 bg-gray-100 shadow rounded-lg cursor-pointer relative"
                style={{ height: 180, width: 450 }}
                onClick={() => handleSelectCourse(course)}
              >
                <h2 className="text-base text-gray-600 mb-2">{course.course_code}</h2>
                <h3 className="text-xl font-semibold mb-2">{course.course_name}</h3>
                <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                <div className="absolute bottom-0 left-0 right-0 bg-purple-900 text-white p-2 text-center text-sm">
                  {course.total_assignments ? `${course.total_assignments} assignments` : 'No assignments'}
                </div>
              </div>
            ))}
            {key === latestKeys[0] && !studentMode && (
              <div
                className="p-6 bg-white border-dashed border-2 border-teal-600 shadow-sm rounded-lg cursor-pointer flex items-center justify-center"
                onClick={handleCreateCourseClick}
                style={{ height: 180, width: 450,marginLeft: '60px' }}
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
        <div className="text-left mt-4"> {/* จัดชิดซ้าย */}
          <button
            className="text-blue-600 underline"
            onClick={() => setShowOlderCourses(!showOlderCourses)}
          >
            {showOlderCourses ? 'Hide older courses' : 'See older courses'}
          </button>
        </div>
      )}

      {/* แสดงเทอมเก่ากว่าเมื่อกดปุ่ม */}
      {showOlderCourses && olderKeys.map((key) => (
        <div key={key} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{key}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {groupedCourses[key].map((course) => (
              <div
                key={course.course_id}
                className="p-4 bg-gray-100 shadow rounded-lg cursor-pointer relative"
                style={{ height: 180, width: 450 }}
                onClick={() => handleSelectCourse(course)}
              >
                <h2 className="text-base text-gray-600 mb-2">{course.course_code}</h2>
                <h3 className="text-xl font-semibold mb-2">{course.course_name}</h3>
                <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                <div className="absolute bottom-0 left-0 right-0 bg-purple-900 text-white p-2 text-center text-sm">
                  {course.total_assignments ? `${course.total_assignments} assignments` : 'No assignments'}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {!studentMode && <CreateCourse isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default CourseCard;
