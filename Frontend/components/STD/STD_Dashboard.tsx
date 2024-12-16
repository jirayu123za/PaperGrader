import React from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import STDSubmit from '../STD/STD_submit';
import { useFetchStdAssignments } from '../../hooks/useFetchSTD_Assignment';
import { useAssignmentStore } from '../../store/useSTD_AssignmentStore';
import { Card, Progress, Text, Checkbox, ScrollArea, Skeleton, Flex } from '@mantine/core';
import { useSubmitAndDownloadModalStore } from '../../store/modal/useSubmitAndDownloadModal';

const STD_Dashboard = () => {
  const { isLoading, error } = useFetchStdAssignments();
  const { assignments: assignmentList } = useAssignmentStore();
  const { openModal } = useSubmitAndDownloadModalStore();

  if (error) return <div>Error loading assignments: {error.message}</div>;

  const calculateProgress = (releaseDate: string, dueDate: string) => {
    if (releaseDate === 'N/A' || dueDate === 'N/A') return 0;

    const now = dayjs();
    const release = dayjs(releaseDate);
    const due = dayjs(dueDate);

    if (now.isBefore(releaseDate)) {
      return 0;
    }
    if (now.isAfter(dueDate)) {
      return 100;
    }

    const totalDuration = due.diff(release);
    const elapsedDuration = now.diff(release);
    return (elapsedDuration / totalDuration) * 100;
  };

  const sortedAssignments = assignmentList ? [...assignmentList].sort((a, b) => {
    const timeLeftA = dayjs(a.due_date).diff(dayjs(), 'day');
    const timeLeftB = dayjs(b.due_date).diff(dayjs(), 'day');
    return timeLeftA - timeLeftB;
  }) : [];

  if (!assignmentList || assignmentList.length === 0) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-lg font-semibold text-gray-500">
        You have not been added to a course. Or your instructor hasn't released an assignment yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ScrollArea h={700} type="never">
        <div className="space-y-4">
          {isLoading ? 
            Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} shadow="sm" padding="lg" radius="md" withBorder>
                <div className="flex justify-between items-center">
                  <div className="w-1/4">
                    <Skeleton height={20} width="70%" />
                    <Skeleton height={15} width="50%" mt={8} />
                  </div>
                  <div className="w-2/4 flex items-center">
                    <Skeleton height={20} width="10%" />
                    <Skeleton height={20} width="60%" ml={12} />
                  </div>
                  <div className="w-1/4">
                    <Skeleton height={15} width="50%" />
                    <Skeleton height={8} mt={8} />
                  </div>
                </div>
              </Card>
            )
          ) : (
            sortedAssignments.map((assignment) => {
              return (
                <Card key={assignment.assignment_id} shadow="sm" padding="lg" radius="md" withBorder>
                  <div className="flex justify-between items-center">  
                    <div className="w-1/4">
                      <Link href={`/STDCourseOverview/${assignment.course_id}/CourseDashboard`} passHref>
                        <Text style={{ fontWeight: 500 }} className="cursor-pointer hover:underline">
                          Course Code: {assignment.course_code}
                        </Text>
                      </Link>
  
                      <Flex gap={2} align="center">
                        <Text size="sm" color="dimmed">
                          {assignment.course_name}
                        </Text>
                        <Text size="sm" color="dimmed">
                          ({assignment.section_name})
                        </Text>
                      </Flex>
                    </div>
  
                    <div className="w-1/4 flex items-center gap-2">
                      <Checkbox />
                      <Text
                        size="sm"
                        color="dimmed"
                        className="cursor-pointer justify-center hover:underline"
                        onClick={() => openModal(assignment.assignment_id, assignment.course_id)}
                      >
                        {assignment.assignment_name}
                      </Text>
                    </div>
  
                    <div className="w-1/4">
                      <Text size="sm" color="dimmed" className="text-center">
                        {dayjs(assignment.due_date).diff(dayjs(), 'day') > 0 ? `Due in: ${dayjs(assignment.due_date).diff(dayjs(), 'day')} Days` : "Overdue"}
                      </Text>
                      <Progress
                        value={calculateProgress(assignment.release_Date?? 'N/A', assignment.due_date ?? 'N/A')}
                        color="green"
                        size="md"
                        radius="lg"
                      />
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>

      <STDSubmit/>
    </div>
  );
};

export default STD_Dashboard;
