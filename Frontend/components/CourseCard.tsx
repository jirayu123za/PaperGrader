import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useCourseStore } from '../store/useCourseStore';
import CreateCourse from './CreateCourse';

interface Course {
  course_id: string;
  course_name: string;
  course_code: string;
  description: string;
  total_assignments: string;
}

interface CourseCardProps {
  course?: Course;
  studentMode?: boolean; // เพื่อตรวจสอบว่าอยู่ในโหมดนักศึกษาหรือไม่
}

const CourseCard: React.FC<CourseCardProps> = ({ course, studentMode = false }) => {
  const { setSelectedCourseId } = useCourseStore();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectCourse = () => {
    if (course) {
      setSelectedCourseId(course.course_id);
  
      // ส่งไปที่หน้าเฉพาะของนักศึกษา
      if (studentMode) {
        router.push(`/STDCourseOverview/${course.course_id}/CourseDashboard`);
      } else {
        // ส่งไปที่หน้าเฉพาะของผู้สอน
        router.push(`/courses/${course.course_id}`);
      }
    }
  };

  const handleCreateCourseClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      {course ? (
        <div
          className="p-4 bg-gray-100 shadow rounded-lg cursor-pointer relative"
          style={{ height: 150 }}
          onClick={handleSelectCourse}
        >
          <h2 className="text-sm text-gray-500 mb-1">
            {course.course_code}
          </h2>
          <h3 className="text-xl font-semibold mb-1">
            {course.course_name}
          </h3>
          <p className="text-gray-500 mb-3">{course.description}</p>

          {/* แถบที่ด้านล่างเพื่อแสดงจำนวน assignments */}
          <div className="absolute bottom-0 left-0 right-0 bg-purple-900 text-white p-2 text-center">
            {course.total_assignments ? `${course.total_assignments} assignments` : 'No assignments'}
          </div>
        </div>
      ) : (
        // หากเป็นโหมดผู้สอน (studentMode = false) จะแสดงปุ่มสร้างคอร์สใหม่
        !studentMode && (
          <div
            className="p-6 bg-white border-dashed border-2 border-teal-600 shadow-sm rounded-lg cursor-pointer flex items-center justify-center"
            onClick={handleCreateCourseClick}
            style={{ height: 150 }}
          >
            <div className="text-teal-600 text-center">
              <div className="text-3xl mb-2">+</div>
              <div>Create a new course</div>
            </div>
          </div>
        )
      )}

      {!studentMode && (
        <CreateCourse isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

export default CourseCard;
