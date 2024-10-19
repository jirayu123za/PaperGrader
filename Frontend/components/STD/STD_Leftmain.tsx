import { useState } from 'react';
import Link from 'next/link';
import { FaBars, FaHome, FaBook, FaCog } from 'react-icons/fa';
import AccountMenu from '../Account'; // นำเข้า AccountMenu component

interface LeftMainProps {
  studentId: string;
}

export default function STD_LeftMain({ studentId }: LeftMainProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`relative h-screen flex flex-col justify-between border-r border-gray-300 ${isCollapsed ? 'w-16 p-4' : 'w-64 p-6'} bg-gray-100`}>
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

      {/* Main Menu */}
      <div className={`flex-grow ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        <div className={`flex flex-col space-y-4 ${isCollapsed ? 'items-center' : ''}`}>
          {/* เมื่อคลิก Dashboard ไปที่ STDCourseOverview */}
          <Link href={`/STDCourseOverview`} passHref>
            <button className="flex items-center space-x-2 hover:text-teal-700">
              <FaHome />
              {!isCollapsed && <span>Dashboard</span>}
            </button>
          </Link>

          {/* เมื่อคลิก Course ไปที่ STDCourse */}
          <Link href={`/CourseOverview`} passHref>
            <button className="flex items-center space-x-2 hover:text-teal-700">
              <FaBook />
              {!isCollapsed && <span>Course</span>}
            </button>
          </Link>

          <Link href={`/student/${studentId}/settings`} passHref>
            <button className="flex items-center space-x-2 hover:text-teal-700">
              <FaCog />
              {!isCollapsed && <span>Settings</span>}
            </button>
          </Link>
        </div>
      </div>

      {/* User Account Section */}
      <AccountMenu isCollapsed={isCollapsed} /> {/* ส่ง isCollapsed เข้าไปใน AccountMenu */}
    </div>
  );
}
