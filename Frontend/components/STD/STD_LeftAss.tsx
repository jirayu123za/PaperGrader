import { useState } from 'react';
import Link from 'next/link';
import { FaBars, FaHome, FaClipboardList, FaUserCircle, FaQuestionCircle, FaEdit, FaSignOutAlt } from 'react-icons/fa';
import AccountMenu from '../STD/STD_Account';

interface LeftMainProps {
  studentId: string;
  courseName: string; // เพิ่ม prop สำหรับชื่อคอร์ส
  instructors: string[]; // เพิ่ม prop สำหรับรายชื่อ Instructor
}

export default function STD_LeftMain({ studentId, courseName, instructors }: LeftMainProps) {
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

      {/* Main Content */}
      <div className={`flex-grow ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        <div className={`flex flex-col space-y-4 ${isCollapsed ? 'items-center' : ''}`}>
          {/* Course Name */}
          <h2 className="font-bold text-lg">
            {courseName} {/* รับค่า courseName จาก props */}
          </h2>
          <p className="text-sm text-gray-600">Fullstack Software Development</p>

          {/* Main Menu */}
          <Link href={`/student/${studentId}/dashboard`} passHref>
            <button className="flex items-center space-x-2 hover:text-teal-700">
              <FaHome />
              {!isCollapsed && <span>Dashboard</span>}
            </button>
          </Link>

          <Link href={`/student/${studentId}/regrade`} passHref>
            <button className="flex items-center space-x-2 hover:text-teal-700">
              <FaClipboardList />
              {!isCollapsed && <span>Regrade Requests</span>}
            </button>
          </Link>

          {/* Instructors Section */}
          <h3 className="font-bold text-md mt-4">Instructors</h3>
          <ul>
            {instructors.map((instructor, index) => (
              <li key={index} className="flex items-center space-x-2">
                <FaUserCircle />
                {!isCollapsed && <span>{instructor}</span>} {/* แสดงรายชื่อ Instructor */}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* User Account Section */}
      <AccountMenu />
    </div>
  );
}
