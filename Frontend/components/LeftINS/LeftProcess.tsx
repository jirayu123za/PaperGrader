import React, { useState } from 'react';
import AccountMenu from '../Account';
import Link from 'next/link';
import { FaBars, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { GiClockwiseRotation } from 'react-icons/gi';
import { IoStatsChart } from 'react-icons/io5';
import { IoMdSettings } from 'react-icons/io';
import { Button, Container, Divider, Flex, Stack, Title, Transition, Text, Group, Radio } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useRouter } from 'next/router';
import { useFetchAssignmentLeft } from '../../hooks/SideBar/useFetchAssignmentLeft';
import { useAssignmentLeftProcessStore } from '../../store/useLeftProcessStore';

export default function LeftProcess() {
  const [isCollapsed, { toggle }] = useDisclosure(false);
  const [activeOption, setActiveOption] = useState<string | null>(null); // Track the active option
  const router = useRouter();
  const faIcon = <FaBars size={18} className={`transition-transform duration-300 ${isCollapsed ? '' : 'transform rotate-180'}`} />;
  const faArrowLeft = <FaArrowLeft size={18} />;
  const giClockwiseRotation = <GiClockwiseRotation size={18} />;
  const ioStatsChart = <IoStatsChart size={18} />;
  const ioMdSettings = <IoMdSettings size={18} />;
  const { course_id } = router.query;
  const { assignment_id } = router.query;
  const { isLoading, isSuccess } = useFetchAssignmentLeft(course_id as string, assignment_id as string);
  const { assignmentLeftProcess } = useAssignmentLeftProcessStore();

  const options = [
    { key: 'editOutline', label: 'Edit Outline', href: `/courses/${course_id}/process/${assignment_id}/CreateOutline` },
    { key: 'createRubric', label: 'Create rubric', href: `/courses/${course_id}/process/${assignment_id}/CreateRubric` },
    { key: 'manageScans', label: 'Manage Scans', href: `/courses/${course_id}/process/${assignment_id}/ManageScans` },
    { key: 'manageSubmissions', label: 'Manage Submissions', href: `/courses/${course_id}/process/${assignment_id}/Submissions` },
    { key: 'gradeSubmissions', label: 'Grade Submissions', href: `/courses/${course_id}/process/${assignment_id}/Grading` },
    { key: 'ReviewGrade', label: 'Review Grade', href: '#' },
  ];

  const handleOptionClick = (key: string) => {
    setActiveOption(key); // Update the active option when clicked
  };

  const handleBackToCourse = () => {
    if (course_id) {
      router.push(`/courses/${course_id}/Assignment`);
    }
  };

  return (
    <Container
      className={`relative h-screen flex flex-col border-r ${isCollapsed ? 'w-16 p-4' : 'w-64 p-6'
        }`}
      style={{
        backgroundColor: '#6665AC',
        color: '#F9F9F9',
      }}
    >
      {/* Top: Logo and Button Collapse */}
      <Stack>
        <Flex className="items-center justify-between mb-2">
          <div
            className={`rounded transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 h-0' : 'opacity-100'
              } flex justify-center items-center`}
            style={{
              height: isCollapsed ? '0px' : '40px',
              backgroundColor: '#E9E9E9',
              color: '#484CA3',
            }}
          >
            Logo
          </div>
          <Button
            onClick={toggle}
            variant="transparent"
            styles={{
              root: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F9F9F9',
              },
            }}
          >
            {faIcon}
          </Button>
        </Flex>

        {/* Button back to course */}
        <Button
          variant="transparent"
          leftSection={faArrowLeft}
          styles={{
            root: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              color: '#F9F9F9',
            },
          }}
          onClick={handleBackToCourse}
        >
          <Transition
            mounted={!isCollapsed}
            transition="fade"
            duration={300}
            timingFunction="ease"
          >
            {(styles) => (
              <Title size="md" style={{ ...styles, color: '#F9F9F9' }}>
                Back to this course
              </Title>
            )}
          </Transition>
        </Button>

        {/* Assignment's name */}
        <Transition
          mounted={!isCollapsed}
          transition="fade"
          duration={300}
          timingFunction="ease"
        >
          {(styles) => (
            <Title
              size="h4"
              className="pl-2 mb-4"
              style={{ ...styles, color: '#F9F9F9' }}
            >
              {assignmentLeftProcess.assignment_name}
            </Title>
          )}
        </Transition>
      </Stack>

      {/* Options menu */}
      <Stack gap={4}>
        {options.map((option) => (
          <Link key={option.key} href={option.href} passHref>
            <Button
              variant="subtle"
              fullWidth
              onClick={() => handleOptionClick(option.key)}
              styles={{
                root: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  backgroundColor: activeOption === option.key ? '#E9E9E9' : 'transparent', // Highlight background when active
                  color: activeOption === option.key ? '#484CA3' : '#F9F9F9', // Change text color when active
                  borderRadius: '8px',
                  transition: 'background-color 0.3s, color 0.3s',
                },
              }}
            >
              <Radio
                value={option.key}
                checked={activeOption === option.key}
                onChange={() => handleOptionClick(option.key)}
                styles={{
                  label: {
                    color: activeOption === option.key ? '#1C7ED6' : '#000',
                  },
                  radio: {
                    borderColor: activeOption === option.key ? '#1C7ED6' : '#ccc',
                    backgroundColor: activeOption === option.key ? '#1C7ED6' : 'transparent',
                  },
                }}
              />
              <Transition
                mounted={!isCollapsed}
                transition="fade"
                duration={300}
                timingFunction="ease"
              >
                {(styles) => (
                  <Text size="sm" fw={500} style={{ ...styles }}>
                    {option.label}
                  </Text>
                )}
              </Transition>
            </Button>
          </Link>
        ))}
      </Stack>

      {/* Divider and Footer */}
      <div className="mt-auto">
        <Divider size="sm" className="mb-4" />
        <Button
          variant="subtle"
          leftSection={giClockwiseRotation}
          fullWidth
          styles={{
            root: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              color: '#F9F9F9',
            },
          }}
        >
          <Transition
            mounted={!isCollapsed}
            transition="fade"
            duration={300}
            timingFunction="ease"
          >
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
              color: '#F9F9F9',
            },
          }}
        >
          <Transition
            mounted={!isCollapsed}
            transition="fade"
            duration={300}
            timingFunction="ease"
          >
            {(styles) => (
              <Text size="sm" fw={500} style={{ ...styles, color: '#F9F9F9' }}>
                Statistics
              </Text>
            )}
          </Transition>
        </Button>
        <Button
          variant="subtle"
          leftSection={ioMdSettings}
          fullWidth
          styles={{
            root: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              color: '#F9F9F9',
            },
          }}
        >
          <Transition
            mounted={!isCollapsed}
            transition="fade"
            duration={300}
            timingFunction="ease"
          >
            {(styles) => (
              <Text size="sm" fw={500} style={{ ...styles, color: '#F9F9F9' }}>
                Settings
              </Text>
            )}
          </Transition>
        </Button>
      </div>

      <Group mt="auto">
        <AccountMenu isCollapsed={isCollapsed} />
      </Group>
    </Container>
  );
}
