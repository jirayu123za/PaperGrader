import react from 'react';
import { FaBars, FaHome, FaBook, FaCog } from 'react-icons/fa';
import AccountMenu from '../Account';
import { useDisclosure } from '@mantine/hooks';
import { Button, Divider, Flex, Image, Stack } from '@mantine/core';
import router from 'next/router';

export default function STD_LeftMain() {
  const [isCollapsed, { toggle }] = useDisclosure(false);
  const icons = {
    home: <FaHome />,
    book: <FaBook />,
    cog: <FaCog />,
  }

  return (
    <div className={`relative flex flex-col justify-between border-r transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} h-screen`}>
      <Flex justify="space-between" align="center" p={12}
        style={{
        backgroundColor: '#f1f3f8',
        }}
      >
        {/* Header and Course Name */}
          {!isCollapsed && (
            <Image
              src="/Image/logo-ppgd.png"
              alt="logo" w={200} h={60} p={2} 
              style={{ cursor: 'pointer' }}
              onClick={() => router.push('/STDCourseOverview')}
            />
          )}          
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
      </Flex>

      <Divider />

      {/* Main Menu */}
      <Stack
        p={16} gap="xs"
        className='flex-grow'
        style={() => ({
          backgroundColor: '#6665AC',
        })}
      >

        <Button
          // disabled={!course}
          leftSection={icons.home}
          variant='subtle'
          style={() => ({
            color: '#F9F9F9',
            display: "flex",
            justifyContent: isCollapsed ? "center" : "flex-start",
          })}
          onClick={() => {
            router.push(`/STDCourseOverview`);
          }}
        >
          {!isCollapsed && <span>Dashboard</span>}
        </Button>

        <Button
          // disabled={!course}
          leftSection={icons.book}
          variant='subtle'
          style={() => ({
            color: '#F9F9F9',
            display: "flex",
            justifyContent: isCollapsed ? "center" : "flex-start",
          })}
          onClick={() => {
            router.push(`/STDCourseOverview/CourseOverview`);
          }}
        >
          {!isCollapsed && <span>Course</span>}
        </Button>

        <Button
          // disabled={!course}
          leftSection={icons.cog}
          variant='subtle'
          style={() => ({
            color: '#F9F9F9',
            display: "flex",
            justifyContent: isCollapsed ? "center" : "flex-start",
          })}
          onClick={() => {
            // router.push(`/student/${studentId}/settings`);
            console.log('Settings');
          }}
        >
          {!isCollapsed && <span>Settings</span>}
        </Button>
      </Stack>
    
      {/* Account Section */}
      <Stack pb={0.75}>
        <AccountMenu isCollapsed={isCollapsed} />
      </Stack>
  </div>
  );
}
