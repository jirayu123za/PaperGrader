import React from 'react';
import { Tabs, ScrollArea, Card, Progress, Text, Checkbox, Skeleton } from '@mantine/core';
import Link from 'next/link';
import dayjs from 'dayjs';
import STDSubmit from '../STD/STD_submit';
import { useFetchStdAssignments } from '../../hooks/useFetchSTD_Assignment';
import { useAssignmentStore } from '../../store/useSTD_AssignmentStore';
import { useSubmitAndDownloadModalStore } from '../../store/modal/useSubmitAndDownloadModal';

const mockAssignmentList = [
  {
    assignment_id: '1',
    course_id: 'CSE101',
    course_code: 'CSE101',
    course_name: 'Introduction to Computer Science',
    section_name: 'A',
    assignment_name: 'Assignment 1',
    release_Date: dayjs().subtract(2, 'days').toISOString(),
    due_date: dayjs().add(3, 'days').toISOString(),
  },
  {
    assignment_id: '2',
    course_id: 'CSE101',
    course_code: 'CSE101',
    course_name: 'Introduction to Computer Science',
    section_name: 'B',
    assignment_name: 'Assignment 2',
    release_Date: dayjs().subtract(5, 'days').toISOString(),
    due_date: dayjs().add(1, 'days').toISOString(),
  },
  {
    assignment_id: '3',
    course_id: 'CSE102',
    course_code: 'CSE102',
    course_name: 'Data Structures',
    section_name: 'A',
    assignment_name: 'Assignment 3',
    release_Date: dayjs().subtract(10, 'days').toISOString(),
    due_date: dayjs().subtract(2, 'days').toISOString(),
  },
  {
    assignment_id: '4',
    course_id: 'CSE103',
    course_code: 'CSE103',
    course_name: 'Algorithms',
    section_name: 'A',
    assignment_name: 'Assignment 4',
    release_Date: dayjs().subtract(3, 'days').toISOString(),
    due_date: dayjs().add(5, 'days').toISOString(),
  },
  {
    assignment_id: '5',
    course_id: 'CSE104',
    course_code: 'CSE104',
    course_name: 'Database Systems',
    section_name: 'B',
    assignment_name: 'Assignment 5',
    release_Date: dayjs().subtract(7, 'days').toISOString(),
    due_date: dayjs().subtract(1, 'days').toISOString(),
  },
];

const STD_Dashboard = () => {
  const { isLoading, error } = useFetchStdAssignments();
  const { assignments: assignmentList } = useAssignmentStore();
  const { openModal } = useSubmitAndDownloadModalStore();

  const combinedAssignmentList = [...(assignmentList || []), ...mockAssignmentList];

  if (error) return <div>Error loading assignments: {error.message}</div>;

  const calculateTimeRemaining = (releaseDate: string, dueDate: string) => {
    const now = dayjs();
    const release = dayjs(releaseDate);
    const due = dayjs(dueDate);

    if (now.isBefore(release)) return 100;
    if (now.isAfter(due)) return 0;

    const totalDuration = due.diff(release);
    const remainingDuration = due.diff(now);

    return (remainingDuration / totalDuration) * 100;
  };

  const activeAssignments = combinedAssignmentList.filter((assignment) =>
    dayjs(assignment.due_date).isAfter(dayjs())
  );

  const overdueAssignments = combinedAssignmentList.filter((assignment) =>
    dayjs(assignment.due_date).isBefore(dayjs())
  );

  const renderAssignments = (assignments: any[], type: string) => (
    <div className="space-y-4">
      {isLoading
        ? Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} shadow="sm" padding="lg" radius="md" withBorder>
              <Skeleton height={20} width="70%" />
            </Card>
          ))
        : assignments.map((assignment) => (
            <Card key={assignment.assignment_id} shadow="sm" padding="lg" radius="md" withBorder>
              <div className="flex justify-between items-center">
                <div className="w-1/4">
                  <Text
                    fw={500}
                    className="cursor-pointer hover:underline"
                    onClick={() => openModal(assignment.assignment_id, assignment.course_id)}
                  >
                    {assignment.assignment_name}
                  </Text>
                  <Link href={`/STDCourseOverview/${assignment.course_id}/CourseDashboard`} passHref>
                    <Text size="sm" color="dimmed" className="cursor-pointer hover:underline">
                      {assignment.course_code} - {assignment.course_name}
                    </Text>
                  </Link>
                </div>
                <div className="w-1/4">
                  <Text size="sm" className="text-center">
                    {type === 'active'
                      ? `Time Remaining: ${dayjs(assignment.due_date).diff(dayjs(), 'day')} Days`
                      : 'Overdue'}
                  </Text>
                  <Progress
                    value={type === 'active'
                      ? calculateTimeRemaining(
                          assignment.release_Date ?? 'N/A',
                          assignment.due_date ?? 'N/A'
                        )
                      : 0}
                    color={type === 'active' ? 'green' : 'red'}
                    size="md"
                    radius="lg"
                  />
                </div>
              </div>
            </Card>
          ))}
    </div>
  );

  return (
    <div className="h-full">
      <Tabs defaultValue="active" className="h-full">
        <Tabs.List>
          <Tabs.Tab value="active">Active Assignments</Tabs.Tab>
          <Tabs.Tab value="overdue">Overdue Assignments</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="active" pt="md">
          <ScrollArea style={{ height: 'calc(100vh - 128px)' }}>
            {renderAssignments(activeAssignments, 'active')}
          </ScrollArea>
        </Tabs.Panel>

        <Tabs.Panel value="overdue" pt="md">
          <ScrollArea style={{ height: 'calc(100vh - 128px)' }}>
            {renderAssignments(overdueAssignments, 'overdue')}
          </ScrollArea>
        </Tabs.Panel>
      </Tabs>

      <STDSubmit />
    </div>
  );
};

export default STD_Dashboard;
