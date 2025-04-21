"use client";

import React from 'react';
import { useFetchAssignments } from '../../hooks/useFetchAssignments';
import { useAssignmentStore } from '../../store/useAssignmentStore';
import { useStdCourseDashboardStore } from '../../store/useCourseStore';
import { useRouter } from 'next/router';
import { Badge, Divider, Table, Title } from '@mantine/core';
import { useFetchStdCourse } from '../../hooks/useFetchCourse';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

const STD_CourseDashboard: React.FC = () => {
  const router = useRouter();
  dayjs.extend(utc);
  const { course_id } = router.query;
  const { isLoading, error } = useFetchAssignments(course_id as string);
  const { assignments: assignmentList } = useAssignmentStore();
  const { isLoading: isCourseLoading, error: errorCourse } = useFetchStdCourse(course_id as string);
  const { course: courseData } = useStdCourseDashboardStore();

  if (isLoading) return <div>Loading assignments...</div>;
  if (error) return <div>Error loading assignments: {error.message}</div>;

  return (
    <div className="course-dashboard">
      <div className="header mb-6">
        <Title order={2}>
          {courseData?.course_name} | {courseData?.semester} / {courseData?.academic_year}
        </Title>
        <p className="text-gray-500">Course Code: {courseData?.course_code}</p>
        <Divider my="md" />
      </div>

      {(!assignmentList || assignmentList.length === 0) ? (
        <div className="text-center text-gray-500">
          This course has no assignments assigned yet.
        </div>
      ) : (
        <Table highlightOnHover verticalSpacing="md">
          <Table.Thead>
            <Table.Tr className="border-b">
              <Table.Th>NAME</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>RELEASED</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>DUE</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>LAST DUE</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>STATUS</Table.Th>
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
                    <Table.Td style={{ textAlign: 'center' }}>
                      {assignment.release_date 
                        ? dayjs(assignment.release_date).utc().format('MMM D, YYYY h:mm A'): 'N/A'}
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      {assignment.due_date
                        ? dayjs(assignment.due_date).utc().format('MMM D, YYYY h:mm A'): 'N/A'}
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      {assignment.cut_off_date
                        ? dayjs(assignment.cut_off_date).utc().format('MMM D, YYYY h:mm A'): 'N/A'}
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Badge color={status === 'Submitted' ? 'green' : 'blue'} variant="filled">
                        {status === 'Submitted' ? 'Submitted' : 'No Submission'}
                      </Badge>
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
