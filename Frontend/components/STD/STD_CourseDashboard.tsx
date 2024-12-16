import React from 'react';
import { useFetchAssignments } from '../../hooks/useFetchAssignments';
import { useAssignmentStore } from '../../store/useAssignmentStore';
import { useStdCourseDashboardStore } from '../../store/useCourseStore';
import { useRouter } from 'next/router';
import { Badge, Divider, Table } from '@mantine/core';
import { useFetchStdCourse } from '../../hooks/useFetchCourse';
import dayjs from 'dayjs';

const STD_CourseDashboard: React.FC = () => {
  const router = useRouter();
  const { course_id } = router.query;
  const { data: assignments, isLoading, error } = useFetchAssignments(course_id as string);
  const { assignments: assignmentList } = useAssignmentStore();
  const { isLoading: isCourseLoading, error: errorCourse } = useFetchStdCourse(course_id as string);
  const { course: courseData } = useStdCourseDashboardStore();

  if (isLoading) return <div>Loading assignments...</div>;
  if (error) return <div>Error loading assignments: {error.message}</div>;

  return (
    <div className="course-dashboard">
      <div className="header mb-6">
        <h1 className="text-3xl font-bold">
          {courseData?.course_name} | {courseData?.semester} / {courseData?.academic_year}
        </h1>
        <p className="text-gray-500">Course Code: {courseData?.course_code}</p>
        <Divider my="md" />
      </div>

      {(!assignmentList || assignmentList.length === 0) ? (
        <div className="text-center text-gray-500">
          This course has no assignments assigned yet.
        </div>
      ) : (
        <Table className="min-w-full bg-white border-collapse">
          <Table.Thead>
            <Table.Tr className="border-b">
              <Table.Th className="py-2 px-4 text-left">Name</Table.Th>
              <Table.Th className="py-2 px-4 text-left">Status</Table.Th>
              <Table.Th className="py-2 px-4 text-left">Released</Table.Th>
              <Table.Th className="py-2 px-4 text-left">Due</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {assignmentList.map((assignment) => {
              const status = (assignment as any).status || 'No Status';

              return (
                <React.Fragment key={assignment.assignment_id}>
                  <Table.Tr className="border-b">
                    <Table.Td 
                      className="py-2 px-4 cursor-pointer hover:underline"
                      onClick={() => router.push(`/assignment/${assignment.assignment_id}`)}
                    >
                      {assignment.assignment_name}
                    </Table.Td>
                    <Table.Td className="py-2 px-4">
                      <Badge color={status === 'Submitted' ? 'green' : 'blue'} variant="filled">
                        {status === 'Submitted' ? 'Submitted' : 'No Submission'}
                      </Badge>
                    </Table.Td>
                    <Table.Td className="py-2 px-4">{assignment.assignment_release_date}</Table.Td>
                    <Table.Td className="py-2 px-4">
                      <div>
                        {assignment.assignment_due_date}
                        <br />
                        <span className="text-gray-500">
                          Late Due Date: {assignment.assignment_due_date}
                        </span>
                      </div>
                    </Table.Td>
                  </Table.Tr>
                </React.Fragment>
              );
            })}
          </Table.Tbody>
        </Table>
      )}
    </div>
  );
};

export default STD_CourseDashboard;
