import { useState } from 'react';
import Link from 'next/link';
import { FaBars, FaHome, FaClipboardList, FaUserCircle, FaQuestionCircle, FaEdit, FaSignOutAlt } from 'react-icons/fa';
import { Menu, Button } from '@mantine/core'; // ใช้ Mantine Menu สำหรับการสร้างเมนู

interface LeftMainProps {
  studentId: string;
  courseName: string;
  instructors: {
    instructor_id: string;
    instructor_name: string;
  }[];
}

export default function STD_LeftMain({ studentId, courseName, instructors }: LeftMainProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [accountOpened, setAccountOpened] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

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
              {instructors.map((instructor) => (
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
      <div className="absolute bottom-0 left-0 w-full">
        <Menu
          opened={accountOpened}
          onOpen={() => setAccountOpened(true)}
          onClose={() => setAccountOpened(false)}
          position="top" // ปรับให้เมนูขึ้นด้านบน
          withArrow
        >
          <Menu.Target>
            <Button
              variant="subtle"
              onClick={() => setAccountOpened(!accountOpened)}
              className="w-full flex justify-between items-center p-2 border rounded"
              style={{
                color: 'black', // เปลี่ยนเป็นสีดำ
                width: '100%', // เต็มความกว้างของ LeftMain
              }}
            >
              <FaUserCircle size={18} />
              {!isCollapsed && <span className="ml-2">Account</span>}
              <span>{accountOpened ? '▴' : '▾'}</span>
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item>
              <FaQuestionCircle size={16} style={{ marginRight: '8px' }} /> Help
            </Menu.Item>
            <Menu.Item>
              <FaEdit size={16} style={{ marginRight: '8px' }} /> Edit Account
            </Menu.Item>
            <Menu.Item>
              <FaSignOutAlt size={16} style={{ marginRight: '8px', color: 'red' }} />
              <span style={{ color: 'red' }}>Log Out</span>
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </div>
  );
}
