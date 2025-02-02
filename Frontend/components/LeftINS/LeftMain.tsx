import React from 'react';
import {FaBars,FaUser,FaCog,FaFileAlt,FaUsers,FaHome,FaRegArrowAltCircleRight} from 'react-icons/fa';
import { IoStatsChart } from 'react-icons/io5';
import { PiExportDuotone } from "react-icons/pi";
import { Button, Divider, Flex, Skeleton, Image, Stack, Title, Text, Anchor } from '@mantine/core';
import { useInsCourseStore } from '../../store/useCourseStore';
import { useFetchInstructorList } from '../../hooks/useFetchInstructorList';
import { useInstructorListStore } from '../../store/useInstructorListStore';
import { useRouter } from 'next/router';
import { useFetchCourse } from '../../hooks/useFetchCourse';
import { useDisclosure } from '@mantine/hooks';
import AccountMenu from '../Account';

export default function LeftMain() {
  const router = useRouter();
  const { course_id } = router.query;
  const [isCollapsed, { toggle: toggleCollapse }] = useDisclosure(false);
  const [expandedName, { toggle: toggleExpandName }] = useDisclosure(false);
  const [expandedDesc, { toggle: toggleExpandCourseDesc }] = useDisclosure(false);
  const { course } = useInsCourseStore();
  const { } = useFetchCourse(course_id as string);
  const { isLoading, error } = useFetchInstructorList(course_id as string);
  const instructorList = useInstructorListStore((state) => state.instructorList);
  const icons = {
    home: <FaHome />,
    fileAlt: <FaFileAlt />,
    users: <FaUsers />,
    user: <FaUser />,
    stats: <IoStatsChart />,
    export: <PiExportDuotone />,
    cog: <FaCog />,
  };

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
              color: isCollapsed ? '#000000': '#000000',
            }}
            className={`transition-transform duration-300 ${
              isCollapsed ? '' : 'transform rotate-180'
            }`}
          />
        </Button>
      </Flex>
      <Divider />

      <Flex
        direction="column" align="start" p={16}
        style={{
          backgroundColor: '#6665AC',
        }}>
        {course ? (
          !isCollapsed && (
            <>
              <Title
                textWrap="balance"
                order={2} 
                style={{ color: "#F9F9F9",  cursor: "pointer"}}
                lineClamp={expandedName ? undefined : 1}
                onClick={toggleExpandName}
              >
                {course.course_name}
              </Title>
              <Text
                size="sm"
                style={{ color: "#E9E9E9", cursor: "pointer" }}
                lineClamp={expandedDesc ? undefined : 2}
                onClick={toggleExpandCourseDesc}
              >
                Introduction to {course.course_name}
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
              style={{ color: '#E9E9E9'}}
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
        className='flex-grow'
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

        <Button
          disabled={!course}
          leftSection={icons.home}
          variant='subtle'
          style={() => ({
            color: '#F9F9F9',
            display: "flex",
            justifyContent: isCollapsed ? "center" : "flex-start",
          })}
          onClick={() => {
            if (course) {
              router.push(`/courses/${course.course_id}`);
            }
          }}
        >
          {!isCollapsed && <span>Dashboard</span>}
        </Button>

        <Button
          disabled={!course}
          leftSection={icons.fileAlt}
          variant='subtle'
          style={{
            color: '#F9F9F9',
            display: "flex",
            justifyContent: isCollapsed ? "center" : "flex-start",
          }}
          onClick={() => {
            if (course) {
              router.push(`/courses/${course.course_id}/Assignment`);
            }
          }}
        >
          {!isCollapsed && <span>Assignments</span>}
        </Button>

        <Button
          disabled={!course}
          leftSection={icons.users}
          variant='subtle'
          style={{
            color: '#F9F9F9',
            display: "flex",
            justifyContent: isCollapsed ? "center" : "flex-start",
          }}
          onClick={() => {
            if (course) {
              router.push(`/courses/${course.course_id}/ManageRoster`);
            }
          }}
        >
          {!isCollapsed && <span>Roster</span>}
        </Button>

        <Button
          disabled={!course}
          leftSection={icons.stats}
          variant='subtle'
          style={{
            color: '#F9F9F9',
            display: "flex",
            justifyContent: isCollapsed ? "center" : "flex-start",
          }}
          onClick={() => {
            if (course) {
              // router.push(`/courses/${course.course_id}/Statistics`);
              console.log('Statistics');
            }
          }}
        >
          {!isCollapsed && <span>Statistics</span>}
        </Button>

        <Button
          disabled={!course}
          leftSection={icons.export}
          variant='subtle'
          style={{
            color: '#F9F9F9',
            display: "flex",
            justifyContent: isCollapsed ? "center" : "flex-start",
          }}
          onClick={() => {
            if (course) {
              // router.push(`/courses/${course.course_id}/DataExports`);
              console.log('Data Exports');
            }
          }}
        >
          {!isCollapsed && <span>Data Exports</span>}
        </Button>

        <Button
          disabled={!course}
          leftSection={icons.cog}
          variant='subtle'
          style={{
            color: '#F9F9F9',
            display: "flex",
            justifyContent: isCollapsed ? "center" : "flex-start",
          }}
          onClick={() => {
            if (course) {
              // router.push(`/courses/${course.course_id}/CourseSettings`);
              console.log('Course Settings');
            }
          }}
        >
          {!isCollapsed && <span>Course Settings</span>}
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
