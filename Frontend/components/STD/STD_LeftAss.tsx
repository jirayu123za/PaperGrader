import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaBars, FaHome, FaClipboardList, FaUserCircle } from 'react-icons/fa';
import AccountMenu from '../../components/Account'; // นำเข้า AccountMenu
import { useFetchInstructorList } from '../../hooks/useFetchInstructorList'; // นำเข้า hook สำหรับดึงข้อมูล Instructors
import { useCourseStore } from '../../store/useCourseStore'; // ใช้ store เพื่อเก็บข้อมูลคอร์ส

interface LeftMainProps {
  studentId: string;
  courseId: string ; // เพิ่ม courseId เพื่อดึงรายชื่อ Instructor
}

export default function STD_LeftMain({ studentId, courseId }: LeftMainProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { data: instructorList, isLoading, error } = useFetchInstructorList(courseId); // ใช้ hook เพื่อดึงข้อมูล Instructor
  const { courses } = useCourseStore(); // ดึงข้อมูลคอร์สจาก store
  const course = courses.find((c) => c.course_id === courseId); // หา course จาก store ตาม courseId

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (isLoading) return <div>Loading instructors...</div>;
  if (error) return <div>Error loading instructors: {error.message}</div>;

  return (
    <div
      className={`relative h-screen flex flex-col justify-between border-r border-gray-300 ${
        isCollapsed ? 'w-16 p-4' : 'w-64 p-6'
      } bg-gray-100 transition-all duration-300`}
    >
      {/* Header section */}
      <div className="flex items-center justify-between mb-4">
        <div className={`${isCollapsed ? 'hidden' : 'block'} text-2xl font-semibold`}>Logo</div>
        <button onClick={toggleCollapse} className="text-sm">
          <FaBars
            size={24}
            className={`transition-transform duration-300 ${isCollapsed ? '' : 'transform rotate-180'}`}
          />
        </button>
      </div>

      {/* Course Information */}
      {!isCollapsed && course && (
        <div className="mb-4">
          <h1 className="text-lg font-bold">{course.course_code}</h1>
          <p className="text-gray-600">{course.course_name}</p>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-grow ${isCollapsed ? 'flex flex-col items-center justify-center' : ''}`}>
        {/* Dashboard และ Regrade Requests */}
        <div className="flex flex-col space-y-4">
          <Link href={`/student/${studentId}/dashboard`} passHref>
            <button className="flex items-center justify-center space-x-2 hover:text-teal-700">
              <FaHome size={24} />
              {!isCollapsed && <span>Dashboard</span>}
            </button>
          </Link>

          <Link href={`/student/${studentId}/regrade`} passHref>
            <button className="flex items-center justify-center space-x-2 hover:text-teal-700">
              <FaClipboardList size={24} />
              {!isCollapsed && <span>Regrade Requests</span>}
            </button>
          </Link>
        </div>

        {/* Instructors Section */}
        {!isCollapsed && (
          <div>
            <h3 className="font-bold text-md mt-4">Instructors</h3>
            <ul>
              {instructorList && instructorList.map((instructor: any) => (
                <li key={instructor.instructor_id} className="flex items-center space-x-2">
                  <FaUserCircle />
                  <span>{instructor.instructor_name}</span> {/* แสดงรายชื่อ Instructor */}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* User Account Section */}
      <AccountMenu isCollapsed={isCollapsed} /> {/* ใช้ AccountMenu ที่เป็น component */}
    </div>
  );
}
