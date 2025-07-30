"use client";

import React, { useEffect } from 'react';
import { FaUser, FaCog, FaFileAlt, FaUsers, FaHome, FaRegArrowAltCircleRight } from 'react-icons/fa';
import { IoStatsChart } from 'react-icons/io5';
import { FaFileExport } from "react-icons/fa";
import { Button, Divider, Flex, Skeleton, Image, Stack, Title, Text } from '@mantine/core';
import { useInsCourseStore } from '../../store/useCourseStore';
import { useFetchInstructorList } from '../../hooks/useFetchInstructorList';
import { useInstructorListStore } from '../../store/useInstructorListStore';
import { useLeftMainStore } from '@/store/useLeftMainStore';
import { useRouter, useParams, usePathname } from 'next/navigation';

import { useDisclosure } from '@mantine/hooks';
import AccountMenu from '../Account';




export default function LeftMain() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const course_id = params?.course_id as string;
  const [isCollapsed, { toggle: toggleCollapse }] = useDisclosure(false);
  const { activeOption, setActiveOption } = useLeftMainStore();
  const { course } = useInsCourseStore();
  const { isLoading, error } = useFetchInstructorList(course_id as string);
  const instructorList = useInstructorListStore((state) => state.instructorList);
  const [expandedCode, { toggle: toggleExpandCode }] = useDisclosure(false);
  const [expandedName, { toggle: toggleExpandName }] = useDisclosure(false);
  
  const icons = {
    home: <FaHome />,
    fileAlt: <FaFileAlt />,
    users: <FaUsers />,
    user: <FaUser />,
    stats: <IoStatsChart />,
    export: <FaFileExport />,
    cog: <FaCog />,
  };

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: icons.home, href: `/instructor/course/${course?.course_id}/dashboard` },
    { key: 'assignment', label: 'Assignments', icon: icons.fileAlt, href: `/instructor/course/${course?.course_id}/assignment` },
    { key: 'manageroster', label: 'Roster', icon: icons.users, href: `/instructor/course/${course?.course_id}/manageroster` },
    { key: 'statistics', label: 'Statistics', icon: icons.stats, href: `/instructor/course/${course?.course_id}/statistics` },
    { key: 'dataexports', label: 'Data Exports', icon: icons.export, href: `/instructor/course/${course?.course_id}/dataexport` },
    { key: 'coursesettings', label: 'Course Settings', icon: icons.cog, href: '#' },
  ];

  useEffect(() => {
    if (pathname.includes('dashboard')) setActiveOption('dashboard');
    else if (pathname.includes('assignment')) setActiveOption('assignment');
    else if (pathname.includes('manageroster')) setActiveOption('manageroster');
    else if (pathname.includes('statistics')) setActiveOption('statistics');
    else if (pathname.includes('dataexports')) setActiveOption('dataexports');
    else if (pathname.includes('coursesettings')) setActiveOption('coursesettings');
  }, [pathname]);


  return (
    <div className={`relative flex flex-col justify-between border-r transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} h-screen`}>
      <Flex justify="space-between" align="center" p={12}
        style={{
          backgroundColor: '#6665AC',
        }}
      >
        {/* Header and Course Name */}
        {!isCollapsed && (
          <Image
            src="/Image/logo-ppgd2.png"
            alt="logo" w={200} h={60} p={2}
            style={{ cursor: 'pointer' }}
            onClick={() => router.push('/INSCourseOverview')}
          />
        )}
        <Button
          onClick={toggleCollapse}
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
            className={`transition-transform duration-300 ${isCollapsed ? '' : 'transform rotate-180'
              }`}
          />
        </Button>
      </Flex>


      <Flex direction="column" align="start" p={16}
        style={{
          backgroundColor: '#6665AC',
        }}>
        {course ? (
          !isCollapsed && (
            <>
              <Title
                textWrap="balance"
                order={2}
                size={20} 
                px="xs"
                style={{ color: "#F9F9F9", cursor: "pointer" }}
                lineClamp={expandedCode ? undefined : 1}
                onClick={toggleExpandCode}
              >
                {`${course.course_code} (${course.semester}/${Number(course.academic_year) + 543})`}
              </Title>
              <Text
                size="sm"
                px="xs"
                style={{ color: "#E9E9E9", cursor: "pointer" }}
                lineClamp={expandedName ? undefined : 1}
                onClick={toggleExpandName}
              >
                {course.course_name}
              </Text>
            </>
          )
        ) : (
          <>
            <Title
              order={2}
              style={{ color: '#F9F9F9' }}
              className={`${isCollapsed ? 'hidden' : 'block'}`}
            >
              No Course Selected
            </Title>
            <Text
              size="sm"
              style={{ color: '#E9E9E9' }}
              className={`${isCollapsed ? 'hidden' : 'block'}`}
            >
              Please select a course
            </Text>
          </>
        )}
      </Flex>

      {/* Main Menu */}
      <Stack
        p={16} gap="xs"
        className='grow'
        style={() => ({
          backgroundColor: '#6665AC',
        })}
      >
        <Divider
          style={{
            backgroundColor: '#E9E9E9',
            display: isCollapsed ? 'none' : 'block'
          }}
          size="xs"
          pl={16} pr={16}
        />

        {menuItems.map((item) => (
          <Button
            key={item.key}
            disabled={!course}
            leftSection={item.icon}
            variant="subtle"
            fullWidth
            styles={{
              root: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                color: activeOption === item.key ? '#424242' : '#FFFFFF',
                backgroundColor: activeOption === item.key ? '#f8f9fa' : 'transparent',
                borderRadius: '8px',
                transition: 'background-color 0.3s, color 0.3s',
                paddingLeft: isCollapsed ? 0 : 16,
                paddingRight: isCollapsed ? 0 : 16,
              },
              section: {
                marginRight: isCollapsed ? 0 : 8,
              },
            }}
            onClick={() => {
              setActiveOption(item.key);
              if (item.href && item.href !== '#') {
                router.push(item.href);
              }
            }}
          >

            {!isCollapsed && (
              <Text size="sm" fw={500}>
                {item.label}
              </Text>
            )}

          </Button>
        ))}

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
              INSTRUCTOR
            </Title>

            <div className="flex flex-col">
              {isLoading
                ? Array.from({ length: 10 }).map((_, index) => (
                  <Skeleton key={index} visible height={3} width="100%" />
                ))
                : instructorList &&
                instructorList.map((instructor) => (
                  <Button
                    variant="transparent"
                    leftSection={icons.user}
                    display="flex"
                    key={instructor.personalData_id}
                    style={{ color: "#F9F9F9" }}
                  >
                    <span>{instructor.instructor_name}</span>
                  </Button>
                ))}
            </div>
          </>
        )}
      </Stack>

      <Divider
        style={{
          backgroundColor: '#E9E9E9',
          display: isCollapsed ? 'none' : 'block'
        }}
        size="xs"
      />

      {/* Account Section */}
      <Stack pb={0.75}>
        <AccountMenu isCollapsed={isCollapsed} />
      </Stack>


    </div>
  );
}
