import { useState } from 'react';
import Link from 'next/link';
import { FaBars } from 'react-icons/fa'; 
import AccountMenu from '../Account'; 

export default function STD_LeftMain() {
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
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold">Your Courses</h2>
              <p className="text-sm text-gray-600">
                Welcome to PaperGrader! Click on one of your courses to the right, or on the Account menu below.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User Account Section */}
      <AccountMenu isCollapsed={isCollapsed} /> 
    </div>
  );
}
