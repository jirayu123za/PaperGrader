import { FaBars } from 'react-icons/fa';
import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import AccountMenu from '../Account';

export default function LeftOverview() {
  const [isCollapsed, { toggle }] = useDisclosure(false);

  return (
    <div
      className={`relative flex flex-col justify-between border-r ${
        isCollapsed ? 'w-16' : 'w-64'
      } h-screen`}
      style={{
        backgroundColor: '#6665AC', // Main background color
        color: '#F9F9F9', // Primary text color
      }}
    >
      {/* Header Section */}
      <div
        className="flex items-center justify-between p-4"
        style={{
          backgroundColor: '#6665AC', // Header background color
        }}
      >
        {!isCollapsed && (
          <div
            className="text-2xl font-semibold"
            style={{
              color: '#F9F9F9', // Header text color
            }}
          >
            Logo
          </div>
        )}
        <Button
          onClick={toggle}
          variant="subtle"
          radius="md"
          styles={(theme) => ({
            root: {
              backgroundColor: '#6665AC', // Button background color
              border: 'none', // Remove border
              padding: '0',
              height: 'auto',
              ':hover': {
                backgroundColor: theme.colors.blue[6], // Hover effect
              },
              ':focus': {
                backgroundColor: theme.colors.blue[7], // Focus effect
              },
              ':active': {
                backgroundColor: theme.colors.blue[8], // Active effect
              },
            },
          })}
        >
          <FaBars
            size={24}
            style={{
              color: isCollapsed ? '#FFFFFF' : '#F9F9F9', // Adjust icon color
            }}
            className={`transition-transform duration-300 ${
              isCollapsed ? '' : 'transform rotate-180'
            }`}
          />
        </Button>
      </div>

      {/* Main Content */}
      <div
        className={`flex-grow p-4 ${isCollapsed ? 'items-center' : ''}`}
        style={{
          backgroundColor: '#6665AC', // Main content background color
        }}
      >
        {!isCollapsed && (
          <div>
            <h2
              className="text-lg font-semibold"
              style={{
                color: '#F9F9F9', // Primary text color
              }}
            >
              Your Courses
            </h2>
            <p
              className="text-sm"
              style={{
                color: '#E9E9E9', // Secondary text color
              }}
            >
              Welcome to PaperGrader! Click on one of your courses to the right, or on the Account menu below.
            </p>
          </div>
        )}
      </div>

      {/* Account Section */}
      <div
        className="p-4"
        style={{
          backgroundColor: '#6665AC', // Account section background color
        }}
      >
        <AccountMenu isCollapsed={isCollapsed} />
      </div>
    </div>
  );
}
