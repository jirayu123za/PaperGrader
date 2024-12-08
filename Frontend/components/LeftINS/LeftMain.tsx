import { useState } from 'react';
import { FaBars, FaUser, FaCog, FaFileAlt, FaUsers, FaHome } from 'react-icons/fa';
import { IoStatsChart } from 'react-icons/io5';
import { BiExport } from 'react-icons/bi';
import { Button, Divider, Skeleton } from '@mantine/core';
import { useInsCourseStore } from '../../store/useCourseStore';
import { useFetchInstructorList } from '../../hooks/useFetchInstructorList';
import { useInstructorListStore } from '../../store/useInstructorListStore';
import { useRouter } from 'next/router';
import { useFetchCourse } from '../../hooks/useFetchCourse';
import Link from 'next/link';
import AccountMenu from '../Account';

export default function LeftMain() {
  const router = useRouter();
  const { course_id } = router.query;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { course } = useInsCourseStore();
  const { } = useFetchCourse(course_id as string);
  const { isLoading, error } = useFetchInstructorList(course_id as string);
  const instructorList = useInstructorListStore((state) => state.instructorList);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`relative h-screen flex flex-col justify-between border-r border-gray-300 ${isCollapsed ? 'w-16 p-4' : 'w-64 p-6'} bg-gray-100`}>
      <div className="flex-grow">
        {/* ส่วนบน: Header และชื่อคอร์ส */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/INSCourseOverview" passHref>
            <div className={`${isCollapsed ? 'hidden' : 'block'} text-2xl font-semibold cursor-pointer`}>Logo</div>
          </Link>
          <Button
            onClick={toggleCollapse}
            unstyled 
            className="bg-transparent p-2 shadow-none hover:bg-gray-100"
          >
            <FaBars
              size={24}
              className={`text-black transition-transform duration-300 ${isCollapsed ? '' : 'transform rotate-180'}`}
            />
          </Button>
        </div>

        <div className="mb-4">
          {course ? (
            <>
              <div className={`${isCollapsed ? 'hidden' : 'block'} text-xl font-bold text-gray-900`}>{course.course_name}</div>
              <div className={`${isCollapsed ? 'hidden' : 'block'} text-sm text-gray-500`}>Introduction to {course.course_name}</div>
            </>
          ) : (
            <>
              <div className={`${isCollapsed ? 'hidden' : 'block'} text-xl font-bold text-gray-900`}>No Course Selected</div>
              <div className={`${isCollapsed ? 'hidden' : 'block'} text-sm text-gray-500`}>Please select a course</div>
            </>
          )}
        </div>

        <Divider className="mb-4" color="gray" size="md" />

        {/* ส่วนกลาง: Main Menu */}
        <div className={`flex-grow ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          <div className={`flex flex-col space-y-4 ${isCollapsed ? 'items-center' : ''}`}>
            <Link href={course ? `/courses/${course.course_id}` : '#'} passHref>
              <button className="flex items-center space-x-2 hover:text-teal-700" disabled={!course}>
                <FaHome />
                {!isCollapsed && <span>Dashboard</span>}
              </button>
            </Link>

            <Link href={course?.course_id ? `/courses/${course.course_id}/Assignment` : '#'} passHref>
              <button className="flex items-center space-x-2 hover:text-teal-700" disabled={!course}>
                <FaFileAlt />
                {!isCollapsed && <span>Assignments</span>}
              </button>
            </Link>

            <Link href={course?.course_id ? `/courses/${course.course_id}/ManageRoster` : '#'} passHref>
              <button className="flex items-center space-x-2 hover:text-teal-700" disabled={!course}>
                <FaUsers />
                {!isCollapsed && <span>Roster</span>}
              </button>
            </Link>

            <button className="flex items-center space-x-2 hover:text-teal-700" disabled={!course}>
              <IoStatsChart />
              {!isCollapsed && <span>Statistic</span>}
            </button>

            {/* ปุ่ม Data Exports */}
            <button className="flex items-center space-x-2 hover:text-teal-700" disabled={!course}>
              <BiExport />
              {!isCollapsed && <span>Data Exports</span>}
            </button>

            <button className="flex items-center space-x-2 hover:text-teal-700" disabled={!course}>
              <FaCog />
              {!isCollapsed && <span>Course Settings</span>}
            </button>
          </div>
        </div>

        <Divider className="mt-4 mb-4" color="gray" size="md" />

        {/* ส่วนล่าง: Instructor section */}
        <div className={`${isCollapsed ? 'hidden' : 'block'} text-md mb-2 font-semibold text-gray-900 mt-4`}>
          INSTRUCTOR
        </div>
        <div className={`flex flex-col ${isCollapsed ? 'items-center' : ''} mb-4`}>
          { isLoading
            ? Array.from({ length: 10 }).map((_, index) => (
              <Skeleton key={index} visible height={3} width="100%"/>
            ))
          : instructorList && instructorList.map((instructor) => (
            <button
              key={instructor.personalData_id}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2'} text-gray-700 hover:text-teal-700 mb-4`}
            >
              <FaUser />
              {!isCollapsed && <span>{instructor.instructor_name}</span>}
            </button>
          ))}
        </div>
      </div>

      <Divider className="mb-4" color="gray" size="md" />

      {/* ส่วน Account */}
      <div className="flex-shrink-0">
        <AccountMenu isCollapsed={isCollapsed} />
      </div>
    </div>
  );
}
