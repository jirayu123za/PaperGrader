"use client";

import React from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Tabs, ScrollArea, Card, Progress, Text, Skeleton, Flex } from '@mantine/core';
import { useFetchStdAssignments } from '@/hooks/Student/useFetchSTD_Assignment';
import { useAssignmentStore } from '@/store/Student/useSTD_AssignmentStore';
import { useSubmitAndDownloadModalStore } from '@/store/modal/useSubmitAndDownloadModal';
import LeftMain from '@/components/STD/SideBar/LeftMain';
import STDSubmit from '@/components/STD/STD_submit';
import Assignment from '@/app/instructor/course/[course_id]/assignment/page';
import { log } from 'console';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok"); 


function calculateProgress(release: string | null, due: string | null): number {
  const now = dayjs().tz('Asia/Bangkok');
    const releaseTime = dayjs(release).tz('Asia/Bangkok');
    const dueTime = dayjs(due).tz('Asia/Bangkok');
    const total = dueTime.diff(releaseTime);
    const remaining = dueTime.diff(now);
    console.log(`Calculating progress: release=${release}, due=${due}, now=${now.format()}`);
    
    if (!release || !due) return 0;
    if (now.isBefore(releaseTime)) return 100;
    if (now.isAfter(dueTime)) return 0;
    return Math.max(0, Math.min(100, (remaining / total) * 100));
}

const getProgressColor = (releaseDate: string | null, dueDate: string | null): string => {
  const remainingPercentage = calculateProgress(releaseDate, dueDate);
  if (remainingPercentage > 70) return 'green';
  if (remainingPercentage > 40) return 'orange';
  return 'red';
};


function getRemainingTimeText(due: string | null): string {
   const now = dayjs().tz('Asia/Bangkok');
    const dueTime = dayjs(due).tz('Asia/Bangkok');
    const duration = dueTime.diff(now, 'minute');
    const days = Math.floor(duration / (60 * 24));
    const hours = Math.floor((duration % (60 * 24)) / 60);
    const minutes = duration % 60;
    if (!due) return 'N/A';
    if (now.isAfter(dueTime)) return 'Past Due';
    return [days && `${days}d`, hours && `${hours}h`, minutes && `${minutes}m`].filter(Boolean).join(' ') || 'Less than a minute';
}


const STD_Dashboard = () => {
  const { isLoading, error } = useFetchStdAssignments();
  const { assignments: assignmentList } = useAssignmentStore();
  const { openModal } = useSubmitAndDownloadModalStore();

  const combinedAssignmentList = [...(assignmentList || [])];

  if (error) return <div>Error loading assignments: {error.message}</div>;
  

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
        : assignments.map((assignment) => {

          const progress = calculateProgress(assignment.release_date,assignment.due_date);
           console.log('Progress for assignment', assignment.assignment_name, ':', progress);
          return(
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
                  <Link href={`/student/overview/${assignment.course_id}/dashboard`} passHref>
                    <Text size="sm" c="dimmed" className="cursor-pointer hover:underline">
                      {assignment.course_code} - {assignment.course_name}
                    </Text>
                  </Link>
                </div>
                <div className="w-1/4">
                  <Text size="sm" className="text-center">
                    {getRemainingTimeText(assignment.due_date)}
                  </Text>
                  <Progress
                  
                    color={getProgressColor(assignment.release_date,assignment.due_date)} 
                    value={progress}
                    size="md"
                    radius="lg"
                  />
                </div>
              </div>
            </Card>
          );
        } 
      )
    }
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
