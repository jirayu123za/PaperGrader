import react from 'react';
import AccountMenu from '../../components/Account';
import Link from 'next/link';
import { FaBars, FaUser, FaHome, FaClipboardList } from 'react-icons/fa';
import { useFetchInstructorList } from '../../hooks/useFetchInstructorList';
import { useStdCourseDashboardStore } from '../../store/useCourseStore';
import { useRouter } from 'next/router';
import { useInstructorListStore } from '../../store/useInstructorListStore';
import { useFetchStdCourse } from '../../hooks/useFetchCourse';
import { useDisclosure } from '@mantine/hooks';
import { Button, Divider, Skeleton } from '@mantine/core';

export default function STD_LeftMain() {
  const router = useRouter();  
  const { course_id } = router.query;

  const { isLoading, error } = useFetchInstructorList(course_id as string);
  const { instructorList } = useInstructorListStore();

  const { isLoading: isCourseLoading, error: errorCourse } = useFetchStdCourse(course_id as string);
  const { course } = useStdCourseDashboardStore();

  const [isCollapsed, { toggle }] = useDisclosure(false);


  return (
    <div className={`relative h-screen flex flex-col justify-between border-r border-gray-300 ${isCollapsed ? 'w-16 p-4' : 'w-64 p-6'} bg-gray-100`}>
     <div className="flex-grow">
      {/* Header section */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/STDCourseOverview/CourseOverview" passHref>
          <div className={`${isCollapsed ? 'hidden' : 'block'} text-2xl font-semibold cursor-pointer`}>Logo</div>
        </Link>
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
      </div>

      {/* Course Information */}
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

      <Divider className="mb-4" size="sm" />

      {/* Main Content */}
      <div className={`flex-grow ${isCollapsed ? 'flex flex-col items-center justify-center' : ''}`}>
        {/* Dashboard และ Regrade Requests */}
        <div className={`flex flex-col space-y-4 ${isCollapsed ? 'items-center' : ''}`}>
          <Link href={`/STDCourseOverview/${course_id}/CourseDashboard`} passHref>
            <button className="flex items-center space-x-2 hover:text-teal-700">
              <FaHome />
              {!isCollapsed && <span>Dashboard</span>}
            </button>
          </Link>

          {/* <Link href={`/student/${studentId}/regrade`} passHref> */}
            <button className="flex items-center space-x-2 hover:text-teal-700">
              <FaClipboardList/>
              {!isCollapsed && <span>Regrade Requests</span>}
            </button>
          {/* </Link> */}
        </div>

        <Divider className="mt-4 mb-4" size="sm" />

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
    </div>
      {/* User Account Section */}
      <AccountMenu isCollapsed={isCollapsed} />
    </div>
  );
}
