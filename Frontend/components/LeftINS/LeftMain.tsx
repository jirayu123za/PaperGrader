import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaBars, FaUser, FaCog, FaFileAlt, FaUsers, FaHome } from 'react-icons/fa';
import { IoStatsChart } from 'react-icons/io5';
import { BiExport } from 'react-icons/bi'; // นำเข้าไอคอน BiExport
import { Divider } from '@mantine/core'; // นำเข้า Divider จาก Mantine
import { useCourseStore } from '../../store/useCourseStore';
import { useFetchInstructorList } from '../../hooks/useFetchInstructorList';
import AccountMenu from '../Account'; // นำเข้า AccountMenu

interface LeftMainProps {
  courseId: string;
}

export default function LeftMain({ courseId }: LeftMainProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { selectedCourseId, courses } = useCourseStore();
  const { data, isLoading, error } = useFetchInstructorList(courseId);
  const instructorList = data;

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const selectedCourse = courses.find((course) => course.course_id === selectedCourseId);

  useEffect(() => {
    console.log(instructorList);
  }, [instructorList]);

  if (isLoading) return <div>Loading instructorList...</div>;
  if (error) return <div>Error loading instructorList: {error.message}</div>;

  return (
    <div className={`relative h-screen flex flex-col justify-between border-r border-gray-300 ${isCollapsed ? 'w-16 p-4' : 'w-64 p-6'} bg-gray-100`}>
      <div className="flex-grow">
        {/* ส่วนบน: Header และชื่อคอร์ส */}
        <div className="flex items-center justify-between mb-4">
          <div className={`${isCollapsed ? 'hidden' : 'block'} text-2xl font-semibold`}>Logo</div>
          <button onClick={toggleCollapse} className="text-sm">
            <FaBars
              size={24}
              className={`transition-transform duration-300 ${isCollapsed ? '' : 'transform rotate-180'}`}
            />
          </button>
        </div>

        <div className="mb-4">
          {selectedCourse ? (
            <>
              <div className={`${isCollapsed ? 'hidden' : 'block'} text-xl font-bold text-gray-900`}>{selectedCourse.course_name}</div>
              <div className={`${isCollapsed ? 'hidden' : 'block'} text-sm text-gray-500`}>Introduction to {selectedCourse.course_name}</div>
            </>
          ) : (
            <>
              <div className={`${isCollapsed ? 'hidden' : 'block'} text-xl font-bold text-gray-900`}>No Course Selected</div>
              <div className={`${isCollapsed ? 'hidden' : 'block'} text-sm text-gray-500`}>Please select a course</div>
            </>
          )}
        </div>

        <Divider className="mb-4" color="gray" size="md" />  {/* Divider เพื่อแบ่งส่วน */}

        {/* ส่วนกลาง: Main Menu */}
        <div className={`flex-grow ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          <div className={`flex flex-col space-y-4 ${isCollapsed ? 'items-center' : ''}`}>
            <Link href={selectedCourseId ? `/courses/${selectedCourseId}` : '#'} passHref>
              <button className="flex items-center space-x-2 hover:text-teal-700" disabled={!selectedCourseId}>
                <FaHome />
                {!isCollapsed && <span>Dashboard</span>}
              </button>
            </Link>

            <Link href={selectedCourseId ? `/courses/${selectedCourseId}/Assignment` : '#'} passHref>
              <button className="flex items-center space-x-2 hover:text-teal-700" disabled={!selectedCourseId}>
                <FaFileAlt />
                {!isCollapsed && <span>Assignments</span>}
              </button>
            </Link>

            <Link href={selectedCourseId ? `/courses/${selectedCourseId}/ManageRoster` : '#'} passHref>
              <button className="flex items-center space-x-2 hover:text-teal-700" disabled={!selectedCourseId}>
                <FaUsers />
                {!isCollapsed && <span>Roster</span>}
              </button>
            </Link>

            <button className="flex items-center space-x-2 hover:text-teal-700" disabled={!selectedCourseId}>
              <IoStatsChart />
              {!isCollapsed && <span>Statistic</span>}
            </button>

            {/* ปุ่ม Data Exports */}
            <button className="flex items-center space-x-2 hover:text-teal-700" disabled={!selectedCourseId}>
              <BiExport />
              {!isCollapsed && <span>Data Exports</span>}
            </button>

            <button className="flex items-center space-x-2 hover:text-teal-700" disabled={!selectedCourseId}>
              <FaCog />
              {!isCollapsed && <span>Course Settings</span>}
            </button>
          </div>
        </div>

        <Divider className="mt-4 mb-4" color="gray" size="md" />   {/* Divider คั่นระหว่างเมนูกับส่วน Instructor */}
          
        {/* ส่วนล่าง: Instructor section */}
        <div className={`${isCollapsed ? 'hidden' : 'block'} text-md mb-2 font-semibold text-gray-900 mt-4`}>
          INSTRUCTOR
        </div>
        <div className={`flex flex-col ${isCollapsed ? 'items-center' : ''} mb-4`}>
        {instructorList && instructorList.map((instructor) => (
          <button
            key={instructor.instructor_id}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2'} text-gray-700 hover:text-teal-700 mb-4`}
          >
            <FaUser />
            {!isCollapsed && <span>{instructor.instructor_name}</span>}
          </button>
        ))}
        </div>
      </div>

      <Divider className="mb-4" color="gray" size="md" />  {/* Divider คั่นระหว่างส่วน Instructor กับส่วน Account */}

      {/* ส่วน Account */}
      <div className="flex-shrink-0">
        <AccountMenu isCollapsed={isCollapsed} /> {/* จัดให้อยู่ด้านล่าง */}
      </div>
    </div>
  );
}
