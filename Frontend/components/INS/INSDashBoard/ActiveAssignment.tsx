"use client";

import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter , useParams } from 'next/navigation';
import { Progress, Table, Paper, Button, Pagination, Flex } from '@mantine/core';
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";
import { useActiveAssignmentStore } from '../../../store/useActiveAssignmentStore';
import { useFetchActiveAssignments } from '../../../hooks/useFetchActiveAssignment';
import { usePagination } from '@mantine/hooks';

interface ActiveAssignmentsProps {
  openModal: () => void;
}

const ActiveAssignments: React.FC<ActiveAssignmentsProps> = ({ openModal }) => {
  const router = useRouter();
  const params = useParams();
  const course_id = params?.course_id as string;
  const { isLoading, error } = useFetchActiveAssignments(course_id as string);
  const { activeAssignments } = useActiveAssignmentStore();
  const iconAssignmentTurnedIn = <MdOutlineAssignmentTurnedIn size={24} />;
  dayjs.extend(utc);

  const pageSize = 10;
  const totalPages = Math.ceil(activeAssignments.length / pageSize);

  const pagination = usePagination({
    total: totalPages,
    initialPage: 1,
    siblings: 1,
    boundaries: 1,
  });

  const paginatedData = activeAssignments.slice(
    (pagination.active - 1) * pageSize,
    pagination.active * pageSize
  );

  const calculateTimeRemaining = (releaseDate: string | null, dueDate: string | null): number => {
    const now = dayjs();
    const release = dayjs(releaseDate);
    const due = dayjs(dueDate);
    const totalDuration = due.diff(release);
    const remainingDuration = due.diff(now);

    if (!releaseDate || !dueDate || releaseDate === 'N/A' || dueDate === 'N/A') return 0;
    if (now.isBefore(release)) return 100;
    if (now.isAfter(due)) return 0;

    return (remainingDuration / totalDuration) * 100;
  };

  const getProgressColor = (releaseDate: string | null, dueDate: string | null): string => {
    const remainingPercentage = calculateTimeRemaining(releaseDate, dueDate);
    if (remainingPercentage >70) return 'green';
    if (remainingPercentage > 40) return 'orange';
    return 'red';
  };

  if (error) {
    return <div>Error loading assignments: {error.message}</div>;
  }

  return (
    <Paper shadow="sm" radius="md" withBorder p="xl">
      <Flex
        direction={{ base: 'column', sm: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', sm: 'center' }}
        gap="sm"
        mb="md"
      >
        <h2 className="text-2xl font-semibold">Active Assignments</h2>
        <Button
          variant="filled"
          size="md"
          radius="sm"
          className="shadow-md"
          leftSection={iconAssignmentTurnedIn}
          onClick={openModal}
        >
          Create Assignment
        </Button>
      </Flex>

      {activeAssignments.length > 0 ? (
        <Table striped highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th ta="center">Released</Table.Th>
              <Table.Th ta="center">Time remain</Table.Th>
              <Table.Th ta="center">Due</Table.Th>
              <Table.Th ta="center">Late</Table.Th>
              <Table.Th ta="center">% Submission</Table.Th>
              <Table.Th ta="center">% Graded</Table.Th>
              <Table.Th ta="center">Published</Table.Th>
              <Table.Th ta="center">Regrades</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading
              ? Array.from({ length: 10 }).map((_, index) => (
                <Table.Tr key={`skeleton-row-${index}`}>
                  {/* Skeleton loaders */}
                </Table.Tr>
              ))
              : paginatedData.map((assignment) => (
                <Table.Tr key={assignment.assignment_id}>
                  <Table.Td
                    className="cursor-pointer hover:underline"
                    onClick={() =>
                      router.push(`/courses/${course_id}/process/${assignment.assignment_id}/CreateOutline`)
                    }
                  >
                    {assignment.assignment_name}
                  </Table.Td>
                  <Table.Td ta="center">
                    {assignment.assignment_release_date
                      ? dayjs(assignment.assignment_release_date).utc().format('MMM D, YYYY h:mm A')
                      : 'N/A'}
                  </Table.Td>
                  <Table.Td ta="center">
                    <Progress
                      value={calculateTimeRemaining(
                        assignment.assignment_release_date,
                        assignment.assignment_due_date
                      )}
                      color={getProgressColor(
                        assignment.assignment_release_date,
                        assignment.assignment_due_date
                      )}
                      size="md"
                      radius="lg"
                    />
                  </Table.Td>
                  <Table.Td ta="center">
                    {assignment.assignment_due_date
                      ? dayjs(assignment.assignment_due_date).utc().format('MMM D, YYYY h:mm A')
                      : 'N/A'}
                  </Table.Td>
                  <Table.Td ta="center">
                    {assignment.assignment_cut_off_date
                      ? dayjs(assignment.assignment_cut_off_date).utc().format('MMM D, YYYY h:mm A')
                      : 'N/A'}
                  </Table.Td>
                  <Table.Td ta="center">0</Table.Td>
                  <Table.Td ta="center">0%</Table.Td>
                  <Table.Td ta="center">{assignment.published ? 'Yes' : 'No'}</Table.Td>
                  <Table.Td ta="center">{assignment.regrades ? 'Yes' : 'No'}</Table.Td>
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      ) : (
        <div className="text-gray-500">
          You currently have no active assignments. Create an assignment to get started.
        </div>
      )}

      {activeAssignments.length > 0 && (
        <div className="flex justify-center mt-4">
          <Pagination
            total={totalPages}
            siblings={1}
            boundaries={1}
            value={pagination.active}
            onChange={pagination.setPage}
          />
        </div>
      )}
    </Paper>
  );
};

export default ActiveAssignments;
