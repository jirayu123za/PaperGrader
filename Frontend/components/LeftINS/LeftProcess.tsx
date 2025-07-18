"use client";

import React, { useEffect } from 'react';
import AccountMenu from '../Account';
import { FaArrowLeft, FaRegArrowAltCircleRight } from 'react-icons/fa';
import { GiClockwiseRotation } from 'react-icons/gi';
import { IoStatsChart } from 'react-icons/io5';
import { IoMdSettings, IoIosListBox } from 'react-icons/io';
import { RiFolderUploadFill } from "react-icons/ri";
import { MdRateReview, MdEditSquare } from "react-icons/md";
import { Button, Container, Divider, Flex, Stack, Title, Transition, Text, Image } from '@mantine/core';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useFetchAssignmentLeft } from '../../hooks/SideBar/useFetchAssignmentLeft';
import { useAssignmentLeftProcessStore, useLeftProcessStore } from '../../store/useLeftProcessStore';
import { useLeftProcessSidebarStore } from '@/store/process-outline/leftProcessSidebarStore';

export default function LeftProcess() {
  const pathname = usePathname();
  const router = useRouter();
  const faArrowLeft = <FaArrowLeft size={18} />;
  const giClockwiseRotation = <GiClockwiseRotation size={18} />;
  const ioStatsChart = <IoStatsChart size={18} />;
  const ioMdSettings = <IoMdSettings size={18} />;
  const iconEditOutline = <MdEditSquare size={18} />;
  const iconManageSubmissions= <RiFolderUploadFill size={18} />;
  const iconGradeSubmissions = <IoIosListBox size={18} />;
  const iconReviewGrade = <MdRateReview size={18} />;
  const params = useParams();
  const course_id = params.course_id as string;
  const assignment_id = params.assignment_id as string;
  const isCollapsed: boolean = useLeftProcessSidebarStore((state: { isCollapsed: boolean }) => state.isCollapsed);
  const toggle: () => void = useLeftProcessSidebarStore((state: { toggle: () => void }) => state.toggle);
  const { isLoading, isSuccess } = useFetchAssignmentLeft(course_id as string, assignment_id as string);
  const { assignmentLeftProcess } = useAssignmentLeftProcessStore();
  const { activeOption, setActiveOption } = useLeftProcessStore();
  
  useEffect(() => {
    const activeKey = options.find((opt) => pathname.startsWith(opt.href))?.key || '';
    setActiveOption(activeKey);
  }, [pathname])
  
  const options = [
    { key: 'editOutline', label: 'Edit Outline and Rubric', href: `/instructor/course/${course_id}/process/${assignment_id}/create-outline` },
    { key: 'manageSubmissions', label: 'Manage Submissions', href: `/instructor/course/${course_id}/process/${assignment_id}/manage-submissions` },
    { key: 'gradeSubmissions', label: 'Grade Submissions', href: `/instructor/course/${course_id}/process/${assignment_id}/grade-submissions` },
    { key: 'ReviewGrade', label: 'Review Grade', href: `/instructor/course/${course_id}/process/${assignment_id}/statistics` },
  ];

  const icons: Record<string, JSX.Element> = {
    editOutline: iconEditOutline,
    manageSubmissions: iconManageSubmissions,
    gradeSubmissions: iconGradeSubmissions,
    ReviewGrade: iconReviewGrade,
  };

  const handleOptionClick = (key: string) => {
    setActiveOption(key);
  };

  return (
    <Container className={`relative flex flex-col justify-between border-r transition-all duration-300 ease-in-out ${isCollapsed ? 'w-[64px] min-w-[64px]' : 'w-[256px] min-w-[256px]'} flex-shrink-0 h-screen p-0`}> 
      {/* Top: Logo and Collapse Button */}
      <Flex justify="space-between" align="center" p={12}
        style={{
          backgroundColor: '#6665AC',
        }}
      >
        {!isCollapsed && (
          <Image
            src="/Image/logo-ppgd2.png"
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
              color: isCollapsed ? '#f1f3f8' : '#f1f3f8',
            }}
            className={`transition-transform duration-300 ${isCollapsed ? '' : 'transform rotate-180'}`}
          />
        </Button>
      </Flex>


      <Stack
        p={16} gap="xs"
        className='grow'
        style={() => ({
          backgroundColor: '#6665AC',
        })}
      >
        {/* button Back to Course */}
        <Button
          variant="transparent"
          leftSection={faArrowLeft}
          styles={{
            root: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              color: '#F9F9F9',
              paddingLeft: isCollapsed ? 0 : 16,
              paddingRight: isCollapsed ? 0 : 16,
            },
            section: {
              marginRight: isCollapsed ? 0 : 8,
            }
          }}
          onClick={() => {
            if (course_id) {
              router.push(`/instructor/course/${course_id}/assignment`);
            }
          }}
        >
          {!isCollapsed && (
            <Title
              size="md"
              style={{
                color: '#F9F9F9',
              }}
            >
              Back to this course
            </Title>
          )}
        </Button>

        {/* Assignment Name */}
        <Title
          size="h4"
          className="pl-2 mb-4"
          lineClamp={1}
          style={{
            paddingLeft: 16,
            opacity: isCollapsed ? 0 : 1,
            visibility: isCollapsed ? 'hidden' : 'visible',
            transition: 'opacity 0.3s ease, visibility 0.3s ease',
            color: '#F9F9F9',
          }}
        >
          {assignmentLeftProcess.assignment_name}
        </Title>

        <Divider
          style={{
            backgroundColor: '#E9E9E9',
            display: isCollapsed ? 'block' : 'block'
          }}
          size="xs" mt={16} mb={16}
        />

        {/* button options */}
        {options.map((option) => (
          <Button
            key={option.key}
            leftSection={icons[option.key]}
            variant="subtle"
            fullWidth
            onClick={() => {
              setActiveOption(option.key);
              router.push(option.href);
            }}
            styles={{
              root: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? "center" : "flex-start",
                color: activeOption === option.key ? '#424242' : '#FFFFFF',
                backgroundColor: activeOption === option.key ? '#f8f9fa' : 'transparent',
                borderRadius: '8px',
                transition: 'background-color 0.3s, color 0.3s',
                paddingLeft: isCollapsed ? 0 : 16,
                paddingRight: isCollapsed ? 0 : 16,
              },
              section: {
                marginRight: isCollapsed ? 0 : 8,
              },
            }}
          >
            <Transition mounted={!isCollapsed} transition="fade" duration={300} timingFunction="ease">
              {(styles) => <Text size="sm" fw={500} style={{ ...styles }}>{option.label}</Text>}
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
              color: '#F9F9F9',
              paddingLeft: isCollapsed ? 0 : 16,
              paddingRight: isCollapsed ? 0 : 16,
            },
            section: {
              marginRight: isCollapsed ? 0 : 8, 
            }
          }}
        >
          {!isCollapsed && (
            <Transition mounted transition="fade" duration={300} timingFunction="ease">
              {(styles) => (
                <Text size="sm" fw={500} style={{ ...styles }}>
                  Regrade Requests
                </Text>
              )}
            </Transition>
          )}
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
              paddingLeft: isCollapsed ? 0 : 16,
              paddingRight: isCollapsed ? 0 : 16,
            },
            section: {
              marginRight: isCollapsed ? 0 : 8,
            }
          }}
        >
          {!isCollapsed && (
            <Transition mounted transition="fade" duration={300} timingFunction="ease">
              {(styles) => (
                <Text size="sm" fw={500} style={{ ...styles }}>
                  Statistics
                </Text>
              )}
            </Transition>
          )}
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
              paddingLeft: isCollapsed ? 0 : 16,
              paddingRight: isCollapsed ? 0 : 16,
            },
            section: {
              marginRight: isCollapsed ? 0 : 8,
            }
          }}
        >
          {!isCollapsed && (
            <Transition mounted transition="fade" duration={300} timingFunction="ease">
              {(styles) => (
                <Text size="sm" fw={500} style={{ ...styles }}>
                  Settings
                </Text>
              )}
            </Transition>
          )}
        </Button>
      </Stack>

      {/* Account Section */}
      <Stack pb={0.75}>
        <AccountMenu isCollapsed={isCollapsed} />
      </Stack>
    </Container>
  );
}
