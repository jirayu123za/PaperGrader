"use client";

import react from 'react';
import { FaBars, FaHome, FaBook, FaCog ,FaUser} from 'react-icons/fa';
import AccountMenu from '../Account';
import { useDisclosure } from '@mantine/hooks';
import { Button, Divider, Flex, Image, Stack } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { Title, Text, Skeleton } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useFetchStudentList } from '@/hooks/useFetchStudentList';
import { useStudentListStore } from '@/store/useStudentListStore';

export default function STD_LeftMain() {
  const [isCollapsed, { toggle }] = useDisclosure(false);







  const icons = {
    home: <FaHome />,
    book: <FaBook />,
    cog: <FaCog />,
    user: <FaUser />,
  }
const router = useRouter();
  const params = useParams();
  const course_id = params?.course_id as string;

  const { isLoading: isStudentLoading } = useFetchStudentList(course_id);
  const studentList = useStudentListStore((state) => state.studentList);

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
              onClick={() => router.push(`/student/overview`)}
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
        className='grow'
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
            router.push(`/student/overview`);
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
            router.push(`/student/overview/course`);
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
        <Divider
  style={{
    backgroundColor: '#E9E9E9',
    display: isCollapsed ? 'none' : 'block'
  }}
  size="xs"
/>

{!isCollapsed && (
  <>
    <Title order={4} pt={16} style={{ color: "#F9F9F9" }}>
      STUDENT
    </Title>

    <div className="flex flex-col">
      {isStudentLoading
        ? Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} visible height={8} width="100%" mt={4} />
          ))
        : studentList &&
          studentList.map((student) => (
            <Button
              variant="transparent"
              leftSection={icons.user}
              display="flex"
              key={student.student_id}
              style={{ color: "#F9F9F9", justifyContent: 'flex-start' }}
            >
              <span>{student.student_name}</span>
            </Button>
          ))}
    </div>
  </>
)}
      </Stack>
    
      {/* Account Section */}
      <Stack pb={0.75}>
        <AccountMenu isCollapsed={isCollapsed} />
      </Stack>
  </div>
  );
}
