import react from 'react';
import { FaBars, FaHome, FaBook, FaCog } from 'react-icons/fa';
import AccountMenu from '../Account';
import Link from 'next/link';
import { useDisclosure } from '@mantine/hooks';
import { Button, Divider } from '@mantine/core';

export default function STD_LeftMain() {
  const [isCollapsed, { toggle }] = useDisclosure(false);

  return (
    <div className={`relative h-screen flex flex-col justify-between border-r border-gray-300 ${isCollapsed ? 'w-16 p-4' : 'w-64 p-6'} bg-gray-100`}>
      <div className="flex-grow">
        {/* ส่วนบน: Header และชื่อคอร์ส */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/STDCourseOverview" passHref>
            <div className={`${isCollapsed ? 'hidden' : 'block'} text-2xl font-semibold cursor-pointer`}>Logo</div>
          </Link>
          <Button
            onClick={toggle}
            unstyled 
            className="bg-transparent p-2 shadow-none hover:bg-gray-100"
          >
            <FaBars
              size={24}
              className={`text-black transition-transform duration-300 ${isCollapsed ? '' : 'transform rotate-180'}`}
            />
          </Button>
        </div>
        
        <Divider className="mb-4" size="sm" />

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
          <Link href={`/STDCourseOverview/CourseOverview`} passHref>
            <button className="flex items-center space-x-2 hover:text-teal-700">
              <FaBook />
              {!isCollapsed && <span>Course</span>}
            </button>
          </Link>

          {/* <Link href={`/student/${studentId}/settings`} passHref> */}
            <button className="flex items-center space-x-2 hover:text-teal-700">
              <FaCog />
              {!isCollapsed && <span>Settings</span>}
            </button>
          {/* </Link> */}
        </div>
      </div>
    </div>
    
    {/* User Account Section */}
    <AccountMenu isCollapsed={isCollapsed} />
  </div>
  );
}
