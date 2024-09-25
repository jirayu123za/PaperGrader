// CourseCard.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useCourseStore } from '../store/useCourseStore';
import CreateCourse from './CreateCourse'; // Import CreateCourseModal component

interface Course {
  course_Id: string;
  course_name: string;
}

interface CourseCardProps {
  course?: Course; // ทำให้ course เป็น optional เพื่อรองรับการสร้างคอร์สใหม่
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { setSelectedCourseId } = useCourseStore();
  const router = useRouter();

  // สถานะการเปิด/ปิด Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectCourse = () => {
    if (course) {
      setSelectedCourseId(course.course_Id);
      router.push('/Dashboard');
    }
  };

  const handleCreateCourseClick = () => {
    setIsModalOpen(true); // เปิด Modal
  };

  return (
    <>
      {/* ตรวจสอบว่าเป็นการสร้างคอร์สใหม่หรือไม่ */}
      {course ? (
        <div
          className="p-6 bg-white shadow rounded-lg cursor-pointer"
          style={{ height: 150 }}
          onClick={handleSelectCourse}
        >
          <h2 className="text-2xl font-semibold mb-2">{course.course_name}</h2>
          <p className="text-gray-500">Introduction to {course.course_name}</p>
        </div>
      ) : (
        // Card สำหรับสร้างคอร์สใหม่
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
      )}

      {/* Modal สำหรับสร้างคอร์สใหม่ */}
      <CreateCourse isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default CourseCard;
