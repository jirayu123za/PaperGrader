import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaBars, FaUser, FaCog, FaRedoAlt, FaChartBar, FaFileAlt, FaUsers, FaClock, FaHome } from 'react-icons/fa'; 
import { IoStatsChart } from "react-icons/io5";
import { useCourseStore } from '../store/useCourseStore'; 




interface LeftMainProps {
  courseId: string; // เพิ่ม props courseId เข้ามาใน interface
} 


export default function LeftMain() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { selectedCourseId, courses } = useCourseStore();
  const router = useRouter();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const selectedCourse = courses.find((course) => course.course_id === selectedCourseId);

  return (
    <div className={`h-screen flex flex-col justify-between border-r border-gray-300 ${isCollapsed ? 'w-16 p-4' : 'w-64 p-6'} bg-gray-100`}>
      {/* Header section */}
      <div className="flex items-center justify-between mb-4">
        <div className={`${isCollapsed ? 'hidden' : 'block'} text-2xl font-semibold`}>PaperGrader</div>
        <button onClick={toggleCollapse} className="text-sm">
          <FaBars
            size={24}
            className={`transition-transform duration-300 ${isCollapsed ? '' : 'transform rotate-180'}`} 
          />
        </button>
      </div>

      {/* Course name and section */}
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

      {/* Main Menu */}
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
          <button className="flex items-center space-x-2 hover:text-teal-700" disabled={!selectedCourseId}>
            <FaUsers />
            {!isCollapsed && <span>Roster</span>}
          </button>
          <button className="flex items-center space-x-2 hover:text-teal-700" disabled={!selectedCourseId}>
            <IoStatsChart />
            {!isCollapsed && <span>Statistic</span>}
          </button>
          <button className="flex items-center space-x-2 hover:text-teal-700" disabled={!selectedCourseId}>
            <FaCog />
            {!isCollapsed && <span>Course Settings</span>}
          </button>
        </div>
      </div>

      {/* Instructor section */}
      <div className={`${isCollapsed ? 'hidden' : 'block'} text-sm font-semibold text-gray-900 mt-4`}>
        Instructor
      </div>
      <button className="flex items-center space-x-2 mb-4 text-gray-700 hover:text-teal-700">
        <FaUser />
        {!isCollapsed && <span>Sarah Wareham</span>}
      </button>
      <button className="flex items-center space-x-2 mb-4 text-gray-700 hover:text-teal-700">
        <FaUser />
        {!isCollapsed && <span>Dome Pagorn</span>}
      </button>
    </div>
  );
}
