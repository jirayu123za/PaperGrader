import React from 'react';
import { useFetchAssignments } from '../../hooks/useFetchAssignments'; // ใช้ useFetchAssignments ที่สร้างไว้
import { useAssignmentStore } from '../../store/useAssignmentStore';
import { useCourseStore } from '../../store/useCourseStore';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { Badge, Divider } from '@mantine/core';

interface CourseDashboardProps {
  courseId: string;
  isStudent: boolean;
}

const STD_CourseDashboard: React.FC<CourseDashboardProps> = ({ courseId, isStudent }) => {
  const { data: assignments, isLoading, error } = useFetchAssignments(courseId, isStudent);
  const { assignments: assignmentList } = useAssignmentStore();
  const { courses } = useCourseStore();
  const selectedCourse = courses.find((course) => course.course_id === courseId);
  const router = useRouter();

  if (isLoading) return <div>Loading assignments...</div>;
  if (error) return <div>Error loading assignments: {error.message}</div>;

  return (
    <div className="course-dashboard">
      <div className="header mb-6">
        <h1 className="text-3xl font-bold">
          {selectedCourse?.course_name} | {selectedCourse?.semester} / {selectedCourse?.academic_year}
        </h1>
        <p className="text-gray-500">Course Code: {selectedCourse?.course_code}</p>
        <Divider my="md" />
      </div>

      {/* <div className="overflow-x-auto"> */}
        <table className="min-w-full bg-white border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Released</th>
              <th className="py-2 px-4 text-left">Due</th>
            </tr>
          </thead>
          <tbody>
            {assignmentList.map((assignment) => {
              // const releaseDate = dayjs(assignment.assignment_release_date).format('MMM D, YYYY [at] h:mm A');
              // const dueDate = dayjs(assignment.assignment_due_date).format('MMM D, YYYY [at] h:mm A');
              // const lateDueDate = dayjs(assignment.assignment_due_date).add(5, 'minute').format('MMM D, YYYY [at] h:mm A');
              
              return (
                <React.Fragment key={assignment.assignment_id}>
                  <tr className="border-b">
                    <td 
                      className="py-2 px-4 cursor-pointer hover:underline"
                      onClick={() => router.push(`/assignment/${assignment.assignment_id}`)}
                    >
                      {assignment.assignment_name}
                    </td>

                    <td className="py-2 px-4">
                      <Badge color={assignment.status === 'Submitted' ? 'green' : 'blue'} variant="filled">
                        {assignment.status === 'Submitted' ? 'Submitted' : 'No Submission'}
                      </Badge>
                    </td>

                    <td className="py-2 px-4">{assignment.assignment_release_date}</td>

                    <td className="py-2 px-4">
                      <div>
                        {assignment.assignment_due_date}
                        <br />
                        <span className="text-gray-500">Late Due Date: {assignment.assignment_due_date}</span>
                      </div>
                    </td>
                  </tr>
                  <tr>

                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      // </div>
  );
};

export default STD_CourseDashboard;
