import React from 'react';
import STD_LeftAss from '../../../components/STD/STD_LeftAss'; // นำเข้า STD_LeftAss
import { useCourseStore } from '../../../store/useCourseStore'; // ดึงข้อมูลคอร์สจาก store
import { useFetchCourses } from '../../../hooks/useFetchCourse'; // Hook สำหรับดึงข้อมูลคอร์ส
import STD_CourseDashboard from '../../../components/STD/STD_CourseDashboard'; // นำเข้า STD_CourseDashboard

const CourseDashboard: React.FC = () => {
  const { selectedCourseId } = useCourseStore(); // ใช้ store เพื่อดึงข้อมูลคอร์สที่เลือกอยู่
  const { data: courses, isLoading, error } = useFetchCourses({ isStudent: true }); // ดึงข้อมูลคอร์สจาก API ของนักศึกษา

  // กรณีที่ข้อมูลกำลังโหลดหรือเกิดข้อผิดพลาด
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading courses: {error.message}</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar ทางซ้าย */}
        <STD_LeftAss courseId={selectedCourseId || ''} />
        <div className="flex-grow p-6">
        {selectedCourseId ? (
          <div>
            <STD_CourseDashboard courseId={selectedCourseId}  isStudent={true}/>
          </div>
        ) : (
          <div>Please select a course from the left menu.</div>
        )}
      </div>
    </div>
  );
};

export default CourseDashboard;
