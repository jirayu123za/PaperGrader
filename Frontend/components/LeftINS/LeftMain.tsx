import React from 'react';
import {FaBars,FaUser,FaCog,FaFileAlt,FaUsers,FaHome,} from 'react-icons/fa';
import { IoStatsChart } from 'react-icons/io5';
import { BiExport } from 'react-icons/bi';
import { Button, Divider, Skeleton } from '@mantine/core';
import { useInsCourseStore } from '../../store/useCourseStore';
import { useFetchInstructorList } from '../../hooks/useFetchInstructorList';
import { useInstructorListStore } from '../../store/useInstructorListStore';
import { useRouter } from 'next/router';
import { useFetchCourse } from '../../hooks/useFetchCourse';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import AccountMenu from '../Account';

export default function LeftMain() {
  const router = useRouter();
  const { course_id } = router.query;
  const [isCollapsed, { toggle }] = useDisclosure(false);
  const { course } = useInsCourseStore();
  const { } = useFetchCourse(course_id as string);
  const { isLoading, error } = useFetchInstructorList(course_id as string);
  const instructorList = useInstructorListStore((state) => state.instructorList);

  return (
    <div
      className={`relative h-screen flex flex-col justify-between border-r ${
        isCollapsed ? 'w-16 p-4' : 'w-64 p-6'
      }`}
      style={{
        backgroundColor: '#6665AC', // Main background
        color: '#F9F9F9', // Primary text
      }}
    >
      <div className="flex-grow">
        {/* Header and Course Name */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/INSCourseOverview" passHref>
            <div
              className={`${
                isCollapsed ? 'hidden' : 'block'
              } text-2xl font-semibold cursor-pointer`}
              style={{
                color: '#F9F9F9',
              }}
            >
              Logo
            </div>
          </Link>
          <Button
            onClick={toggle}
            unstyled
            style={{
              backgroundColor: 'transparent',
              color: '#F9F9F9',
            }}
          >
            <FaBars
              size={24}
              className={`transition-transform duration-300 ${
                isCollapsed ? '' : 'transform rotate-180'
              }`}
            />
          </Button>
        </div>

        <div className="mb-4">
          {course ? (
            <>
              <div
                className={`${
                  isCollapsed ? 'hidden' : 'block'
                } text-xl font-bold`}
                style={{ color: '#F9F9F9' }}
              >
                {course.course_name}
              </div>
              <div
                className={`${
                  isCollapsed ? 'hidden' : 'block'
                } text-sm`}
                style={{ color: '#E9E9E9' }}
              >
                Introduction to {course.course_name}
              </div>
            </>
          ) : (
            <>
              <div
                className={`${
                  isCollapsed ? 'hidden' : 'block'
                } text-xl font-bold`}
                style={{ color: '#F9F9F9' }}
              >
                No Course Selected
              </div>
              <div
                className={`${
                  isCollapsed ? 'hidden' : 'block'
                } text-sm`}
                style={{ color: '#E9E9E9' }}
              >
                Please select a course
              </div>
            </>
          )}
        </div>

        <Divider
          className="mb-4"
          style={{ backgroundColor: '#E9E9E9' }}
          size="sm"
        />

        {/* Main Menu */}
        <div className={`flex-grow ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
  <div className={`flex flex-col space-y-4 ${isCollapsed ? 'items-center' : ''}`}>
    <Link href={course ? `/courses/${course.course_id}` : '#'} passHref>
      <button
        className="flex items-center space-x-2 hover:bg-blue-500 focus:bg-blue-600 focus:ring-2 focus:ring-blue-300 active:bg-blue-700 transition duration-300 rounded-md p-2"
        disabled={!course}
        style={{
          color: '#F9F9F9',
          backgroundColor: 'transparent', // Default transparent
        }}
      >
        <FaHome />
        {!isCollapsed && <span>Dashboard</span>}
      </button>
    </Link>

    <Link
      href={course?.course_id ? `/courses/${course.course_id}/Assignment` : '#'}
      passHref
    >
      <button
        className="flex items-center space-x-2 hover:bg-blue-500 focus:bg-blue-600 focus:ring-2 focus:ring-blue-300 active:bg-blue-700 transition duration-300 rounded-md p-2"
        disabled={!course}
        style={{
          color: '#F9F9F9',
          backgroundColor: 'transparent',
        }}
      >
        <FaFileAlt />
        {!isCollapsed && <span>Assignments</span>}
      </button>
    </Link>

    <Link
      href={course?.course_id ? `/courses/${course.course_id}/ManageRoster` : '#'}
      passHref
    >
      <button
        className="flex items-center space-x-2 hover:bg-blue-500 focus:bg-blue-600 focus:ring-2 focus:ring-blue-300 active:bg-blue-700 transition duration-300 rounded-md p-2"
        disabled={!course}
        style={{
          color: '#F9F9F9',
          backgroundColor: 'transparent',
        }}
      >
        <FaUsers />
        {!isCollapsed && <span>Roster</span>}
      </button>
    </Link>

    <button
      className="flex items-center space-x-2 hover:bg-blue-500 focus:bg-blue-600 focus:ring-2 focus:ring-blue-300 active:bg-blue-700 transition duration-300 rounded-md p-2"
      disabled={!course}
      style={{
        color: '#F9F9F9',
        backgroundColor: 'transparent',
      }}
    >
      <IoStatsChart />
      {!isCollapsed && <span>Statistics</span>}
    </button>

    <button
      className="flex items-center space-x-2 hover:bg-blue-500 focus:bg-blue-600 focus:ring-2 focus:ring-blue-300 active:bg-blue-700 transition duration-300 rounded-md p-2"
      disabled={!course}
      style={{
        color: '#F9F9F9',
        backgroundColor: 'transparent',
      }}
    >
      <BiExport />
      {!isCollapsed && <span>Data Exports</span>}
    </button>

    <button
      className="flex items-center space-x-2 hover:bg-blue-500 focus:bg-blue-600 focus:ring-2 focus:ring-blue-300 active:bg-blue-700 transition duration-300 rounded-md p-2"
      disabled={!course}
      style={{
        color: '#F9F9F9',
        backgroundColor: 'transparent',
      }}
    >
      <FaCog />
      {!isCollapsed && <span>Course Settings</span>}
    </button>
  </div>
</div>

        <Divider
          className="mt-4 mb-4"
          style={{ backgroundColor: '#E9E9E9' }}
          size="sm"
        />

        {/* Instructor Section */}
        <div
          className={`${isCollapsed ? 'hidden' : 'block'} text-md mb-2 font-semibold`}
          style={{ color: '#F9F9F9' }}
        >
          INSTRUCTOR
        </div>
        <div className={`flex flex-col ${isCollapsed ? 'items-center' : ''} mb-4`}>
          {isLoading
            ? Array.from({ length: 10 }).map((_, index) => (
                <Skeleton key={index} visible height={3} width="100%" />
              ))
            : instructorList &&
              instructorList.map((instructor) => (
                <button
                  key={instructor.personalData_id}
                  className={`flex items-center ${
                    isCollapsed ? 'justify-center' : 'space-x-2'
                  }`}
                  style={{ color: '#F9F9F9' }}
                >
                  <FaUser />
                  {!isCollapsed && <span>{instructor.instructor_name}</span>}
                </button>
              ))}
        </div>
      </div>

      {/* Account Section */}
      <AccountMenu isCollapsed={isCollapsed} />
    </div>
  );
}
