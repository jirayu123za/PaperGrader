"use client";

import React from 'react';
import { Tabs, ScrollArea, Card, Progress, Text, Checkbox, Skeleton, Flex } from '@mantine/core';
import Link from 'next/link';
import dayjs from 'dayjs';
import STDSubmit from '../STD/STD_submit';
import { useFetchStdAssignments } from '../../hooks/useFetchSTD_Assignment';
import { useAssignmentStore } from '../../store/useSTD_AssignmentStore';
import { useSubmitAndDownloadModalStore } from '../../store/modal/useSubmitAndDownloadModal';
import LeftMain from '@/components/STD/SideBar/LeftMain';

interface ActiveAssignments {
  course_id: string;
  assignment_id: string;
  course_code: string;
  course_name?: string;
  assignment_name: string;
  assignment_description: string;
  cut_off_date: string;
  due_date: string;
  release_Date: string;
  section_name: string;
}

const mockAssignmentList: ActiveAssignments[] = [];

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
    <Flex>
      <LeftMain />

      <Flex direction="column" className="flex-1 px-6 py-6">
        <Tabs defaultValue="active">
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
      </Flex>
      
      <STDSubmit />
    </Flex>
  );
};

export default STD_Dashboard;
