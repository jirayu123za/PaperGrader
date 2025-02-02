import React, { useEffect, useState } from 'react';
import AccountMenu from '../Account';
import { FaBars, FaArrowLeft, FaRegArrowAltCircleRight } from 'react-icons/fa';
import { GiClockwiseRotation } from 'react-icons/gi';
import { IoStatsChart } from 'react-icons/io5';
import { IoMdSettings } from 'react-icons/io';
import { Button, Container, Divider, Flex, Stack, Title, Transition, Text, Image } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useRouter } from 'next/router';
import { useFetchAssignmentLeft } from '../../hooks/SideBar/useFetchAssignmentLeft';
import { useAssignmentLeftProcessStore } from '../../store/useLeftProcessStore';

export default function LeftProcess() {
  const [isCollapsed, { toggle }] = useDisclosure(false);
  const [activeOption, setActiveOption] = useState<string | null>(null);
  const router = useRouter();
  const faArrowLeft = <FaArrowLeft size={18} />;
  const giClockwiseRotation = <GiClockwiseRotation size={18} />;
  const ioStatsChart = <IoStatsChart size={18} />;
  const ioMdSettings = <IoMdSettings size={18} />;
  const { course_id, assignment_id } = router.query;
  const { isLoading, isSuccess } = useFetchAssignmentLeft(course_id as string, assignment_id as string);
  const { assignmentLeftProcess } = useAssignmentLeftProcessStore();

  // รายการตัวเลือกเมนู (นำ Create Rubric ออก)
  const options = [
    { key: 'editOutline', label: 'Edit Outline', href: `/courses/${course_id}/process/${assignment_id}/CreateOutline` },
    { key: 'manageScans', label: 'Manage Scans', href: `/courses/${course_id}/process/${assignment_id}/ManageScans` },
    { key: 'manageSubmissions', label: 'Manage Submissions', href: `/courses/${course_id}/process/${assignment_id}/Submissions` },
    { key: 'gradeSubmissions', label: 'Grade Submissions', href: `/courses/${course_id}/process/${assignment_id}/Grading` },
    { key: 'ReviewGrade', label: 'Review Grade', href: '#' },
  ];

  const handleOptionClick = (key: string) => {
    setActiveOption(key);
  };

  const [clientStyles, setClientStyles] = useState({});

  useEffect(() => {
    setClientStyles({ padding: "8px 20px" });
  }, []);

  return (
    <Container className={`relative flex flex-col justify-between border-r transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} h-screen`}>
      {/* Top: Logo and Collapse Button */}
      <Flex justify="space-between" align="center" p={12}
        style={{
          backgroundColor: '#f1f3f8',
        }}
      >
        {!isCollapsed && (
          <Image
            src="/Image/logo-ppgd.png"
            alt="logo" w={200} h={60} p={2} 
            style={{ cursor: 'pointer' }}
            onClick={() => router.push('/INSCourseOverview')}
          />
        )}

        <Button
          onClick={toggle}
          variant="transparent"
          radius="md"
          styles={() => ({
            root: {
              border: 'none',
              padding: isCollapsed ? "0 0 0 8px" : "0", 
              height: 'auto',
            },
          })}
        >
          <FaRegArrowAltCircleRight
            size={24}
            style={{
              color: isCollapsed ? '#000000': '#000000',
            }}
            className={`transition-transform duration-300 ${isCollapsed ? '' : 'transform rotate-180'}`}
          />
        </Button>
      </Flex>

      <Divider />

      <Stack
        p={16} gap="xs"
        className='flex-grow'
        style={() => ({
          backgroundColor: '#6665AC',
        })}
      >
        {/* ปุ่ม Back to Course */}
        <Button
          variant="transparent"
          leftSection={faArrowLeft}
          styles={{
            root: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              ...clientStyles,
              color: '#F9F9F9',
            },
          }}
          onClick={() => {
            if (course_id) {
              router.push(`/courses/${course_id}/Assignment`);
            }
          }}
        >
          <Transition mounted={!isCollapsed} transition="fade" duration={300} timingFunction="ease">
            {(styles) => (
              <Title size="md" style={{ ...styles, color: '#F9F9F9' }}>
                Back to this course
              </Title>
            )}
          </Transition>
        </Button>        

        {/* Assignment Name */}
        <Transition mounted={!isCollapsed} transition="fade" duration={300} timingFunction="ease">
          {(styles) => (
            <Title
              size="h4"
              className="pl-2 mb-4"
              lineClamp={1} 
              style={{ ...styles, color: '#F9F9F9' }}
            >
              {assignmentLeftProcess.assignment_name}
            </Title>
          )}
        </Transition>

        {/* เมนูตัวเลือก */}
        {options.map((option) => (
          <Button
            key={option.key}
            variant="subtle"
            fullWidth
            onClick={() => {
              handleOptionClick(option.key);
              router.push(option.href);
            }}
            styles={{
              root: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? "center" : "flex-start",
                ...clientStyles,
                color: activeOption === option.key ? '#424242' : '#FFFFFF',
                backgroundColor: activeOption === option.key ? '#f8f9fa' : 'transparent',
                borderRadius: '8px',
                transition: 'background-color 0.3s, color 0.3s',
              },
            }}
          >
            <Transition mounted={!isCollapsed} transition="fade" duration={300} timingFunction="ease">
              {(styles) => (
                <Text size="sm" fw={500} style={{ ...styles }}>
                  {option.label}
                </Text>
              )}
            </Transition>
          </Button>
        ))}

        <Divider
          style={{
            backgroundColor: '#E9E9E9',
            display: isCollapsed ? 'block' : 'block'
          }}
          size="xs" mt={16} mb={16}
        />

        {/* Footer */}
        <Button
          variant="subtle"
          leftSection={giClockwiseRotation}
          fullWidth
          styles={{
            root: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              ...clientStyles,
              color: '#F9F9F9',
            },
          }}
        >
          <Transition mounted={!isCollapsed} transition="fade" duration={300} timingFunction="ease">
            {(styles) => (
              <Text size="sm" fw={500} style={{ ...styles, color: '#F9F9F9' }}>
                Regrade Requests
              </Text>
            )}
          </Transition>
        </Button>

        <Button
          variant="subtle"
          leftSection={ioStatsChart}
          fullWidth
          styles={{
            root: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              ...clientStyles,
              color: '#F9F9F9',
            },
          }}
        >
          <Transition mounted={!isCollapsed} transition="fade" duration={300} timingFunction="ease">
            {(styles) => (
              <Text size="sm" fw={500} style={{ ...styles, color: '#F9F9F9' }}>
                Statistics
              </Text>
            )}
          </Transition>
        </Button>
      </Stack>    

      {/* Account Section */}
      <Stack pb={0.75}>
        <AccountMenu isCollapsed={isCollapsed} />
      </Stack>
    </Container>
  );
}
