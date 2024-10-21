import { useState } from 'react';
import { FaBars, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { VscDebugRestart } from 'react-icons/vsc'; // ไอคอนสำหรับ Regrade Requests
import { IoStatsChart } from 'react-icons/io5'; // ไอคอนสำหรับ Statistics
import { IoMdSettings } from 'react-icons/io'; // ไอคอนสำหรับ Settings
import { Divider } from '@mantine/core'; // นำเข้า Divider จาก Mantine
import AccountMenu from '../Account'; // นำเข้า AccountMenu
import Link from 'next/link'; // นำเข้า Link จาก Next.js

interface LeftProcessProps {
  assignment_name: string; // รับ assignmentName จาก props
  course_id: string; // เพิ่มเพื่อใช้ในการสร้างลิงก์ที่เก็บค่า
  process_id: string; // เพิ่มเพื่อใช้ในการสร้างลิงก์ที่เก็บค่า
}

export default function LeftProcess({ assignment_name, course_id, process_id }: LeftProcessProps) {
  const [isCollapsed, setIsCollapsed] = useState(false); // สถานะสำหรับการหุบ/ขยายเมนู
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['Edit Outline']); // เก็บสถานะของตัวเลือกที่เลือก

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed); // เปลี่ยนสถานะการหุบ/ขยายเมนู
  };

  const toggleOption = (option: string) => {
    setSelectedOptions((prevOptions) =>
      prevOptions.includes(option)
        ? prevOptions.filter((opt) => opt !== option)
        : [...prevOptions, option]
    );
  };

  return (
    <div className={`relative h-screen flex flex-col justify-between border-r border-gray-300 ${isCollapsed ? 'w-16 p-4' : 'w-64 p-6'} bg-gray-100`}>
      {/* ส่วนของโลโก้และไอคอนเมนูด้านบน */}
      <div className="flex items-center justify-between mb-4">
        <div className={`${isCollapsed ? 'hidden' : 'block'} bg-gray-200 p-2 rounded`}>
          Logo
        </div>
        <button onClick={toggleCollapse} className="text-sm">
          <FaBars
            size={24}
            className={`transition-transform duration-300 ${isCollapsed ? '' : 'transform rotate-180'}`} // ใช้ transform เพื่อหมุนไอคอน
          />
        </button>
      </div>

      {/* เนื้อหาเมนู */}
      <div className={`flex-grow ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        {/* กลับไปที่คอร์ส */}
        <div className="mb-4">
          <button className="flex items-center text-sm text-gray-600">
            <FaArrowLeft className="mr-2" />
            {isCollapsed ? '' : 'Back to this course'}
          </button>
        </div>

        {/* แสดงชื่อ Assignment */}
        {!isCollapsed && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold">{assignment_name}</h2>
          </div>
        )}

        <Divider className="mb-4" color="gray" size="md" /> {/* ปรับขนาดและสีของ Divider */}

        {/* แสดงวงกลมเช็คถูกแม้เมนูจะถูกหุบ */}
        <div className={`flex flex-col space-y-2 ${isCollapsed ? 'items-center' : ''}`}>
          {['Edit Outline', 'Create rubric', 'Manage Scans', 'Manage Submissions', 'Grade Submissions'].map(option => (
            <Link
              key={option}
              href={
                option === 'Edit Outline'
                  ? `/courses/${course_id}/process/${process_id}/CreateOutline`
                  : option === 'Manage Submissions'
                  ? `/courses/${course_id}/process/${process_id}/Submissions`
                  : '#'
              }
              passHref
            >
              <button
                onClick={() => toggleOption(option)}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-4 py-2'} rounded`}
              >
                {selectedOptions.includes(option) ? (
                  <FaCheckCircle className="text-green-500 mr-2" />
                ) : (
                  <div className="w-4 h-4 border border-black rounded-full bg-white mr-2"></div> // วงกลมขอบดำ ข้างในสีขาว
                )}
                {isCollapsed ? '' : option}
              </button>
            </Link>
          ))}
        </div>
      </div>

      <Divider className="my-4" color="gray" size="md" /> {/* Divider คั่น */}

      {/* เมนูด้านล่าง */}
      <div className={`flex flex-col space-y-2 mb-4 ${isCollapsed ? 'items-center' : ''}`}>
        <button className="flex items-center px-2 py-1 text-gray-700">
          <VscDebugRestart className="mr-2" />
          {isCollapsed ? '' : 'Regrade Requests'}
        </button>
        <button className="flex items-center px-2 py-1 text-gray-700">
          <IoStatsChart className="mr-2" />
          {isCollapsed ? '' : 'Statistics'}
        </button>
        <button className="flex items-center px-2 py-1 text-gray-700">
          <IoMdSettings className="mr-2" />
          {isCollapsed ? '' : 'Settings'}
        </button>
      </div>

      {/* User Account Section */}
      <AccountMenu isCollapsed={isCollapsed} /> {/* ปรับให้ตรงกับโครงสร้างของ LeftOverview */}
    </div>
  );
}
