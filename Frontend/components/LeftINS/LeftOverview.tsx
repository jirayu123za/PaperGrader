import { FaBars } from 'react-icons/fa';
import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import AccountMenu from '../Account';

export default function LeftOverview() {
  const [isCollapsed, { toggle }] = useDisclosure(false);

  return (
    <div
      className={`relative flex flex-col justify-between border-r border-gray-300 bg-gray-100 ${
        isCollapsed ? 'w-16' : 'w-64'
      } h-screen`}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && <div className="text-2xl font-semibold">Logo</div>}
        <Button
          className="p-0 bg-transparent hover:bg-gray-200"
          onClick={toggle}
          variant="default"
          size="sm"
        >
          <FaBars
            size={24}
            className={`transition-transform duration-300 ${
              isCollapsed ? '' : 'transform rotate-180'
            }`}
          />
        </Button>
      </div>

      {/* Main Content */}
      <div className={`flex-grow p-4 ${isCollapsed ? 'items-center' : ''}`}>
        {!isCollapsed && (
          <div>
            <h2 className="text-lg font-semibold">Your Courses</h2>
            <p className="text-sm text-gray-600">
              Welcome to PaperGrader! Click on one of your courses to the right, or on the Account menu below.
            </p>
          </div>
        )}
      </div>

      {/* Account Section */}
      <div className="p-4">
        <AccountMenu isCollapsed={isCollapsed} />
      </div>
    </div>
  );
}
