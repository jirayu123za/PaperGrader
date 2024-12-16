import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'next/router';
import { Progress, Table, Paper, Grid, Button, Pagination, Skeleton } from '@mantine/core';
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";
import { useActiveAssignmentStore } from '../../../store/useActiveAssignmentStore';
import { useFetchActiveAssignments } from '../../../hooks/useFetchActiveAssignment';
import { usePagination } from '@mantine/hooks';

interface ActiveAssignmentsProps {
  openModal: () => void;
}

const ActiveAssignments: React.FC<ActiveAssignmentsProps> = ({ openModal }) => {
  const router = useRouter();
  const { course_id } = router.query;
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

  const calculateTimeProgress = (releaseDate: string, dueDate: string) => {
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

  if (error) {
    return <div>Error loading assignments: {error.message}</div>;
  }

  return (
    <Paper shadow="sm" radius="md" withBorder p="xl">
      <Grid mb="md" justify="space-between" align="center">
        <Grid.Col span={3}>
          <h2 className="text-2xl font-semibold">Active Assignments</h2>
        </Grid.Col>
        <Grid.Col span={3} pt={8} pl={45}>
          <Button 
            variant="filled"
            size='md'
            radius="sm"
            className='shadow-md'
            leftSection={iconAssignmentTurnedIn}
            onClick={openModal}
          >
            Create Assignment
          </Button>          
        </Grid.Col>
      </Grid>

      {activeAssignments.length > 0 ? (
        <Table striped highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>NAME</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>RELEASED</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Time Progress</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>DUE</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>LATE</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>% SUBMISSION</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>% GRADE</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>PUBLISHED</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>REGRADES</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading
              ? Array.from({ length: 10 }).map((_, index) => (
                <Table.Tr key={`skeleton-row-${index}`}>
                  <Table.Td>
                    <Skeleton visible height={25} />
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    <Skeleton visible height={25} />
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    <Skeleton visible height={25} />
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    <Skeleton visible height={25} />
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    <Skeleton visible height={25} />
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center'}}>
                    <Skeleton visible height={25}/>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    <Skeleton visible height={25}/>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    <Skeleton visible height={25}/>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    <Skeleton visible height={25}/>
                  </Table.Td>
                </Table.Tr>
              ))
              : paginatedData.map((assignment) => (
                <Table.Tr key={assignment.assignment_id}>
                  <Table.Td
                    className="cursor-pointer hover:underline"
                    onClick={() => router.push(`/courses/${course_id}/process/${assignment.assignment_id}/CreateOutline`)}
                  >
                    {assignment.assignment_name}
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    {assignment.assignment_release_date
                      ? dayjs(assignment.assignment_release_date).utc().format('MMM D, YYYY h:mm A')
                      : 'N/A'
                    }
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    <div className="relative">
                      <Progress
                        value={calculateTimeProgress(assignment.assignment_release_date?? 'N/A', assignment.assignment_due_date ?? 'N/A')}
                        color="green"
                        size="md"
                        radius="lg"
                      />
                    </div>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    {assignment.assignment_due_date
                      ? dayjs(assignment.assignment_due_date).utc().format('MMM D, YYYY h:mm A')
                      : 'N/A'                    
                    }
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    {assignment.assignment_cut_off_date
                      ? dayjs(assignment.assignment_cut_off_date).utc().format('MMM D, YYYY h:mm A')
                      : 'N/A'                     
                    }
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>0</Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>0%</Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>{assignment.published ? 'Yes' : 'No'}</Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>{assignment.regrades ? 'Yes' : 'No'}</Table.Td>
                </Table.Tr>
              ))
            }
          </Table.Tbody>
        </Table>
      ) : (
        <div className="text-gray-500">
          You currently have no active assignments. Create an assignment to get started.
        </div>
      )}

      {activeAssignments.length > 0 &&
        <div className="flex justify-center mt-4">
          <Pagination
            total={totalPages}
            siblings={1}
            boundaries={1}
            value={pagination.active}
            onChange={pagination.setPage}
          />
        </div>
      }
    </Paper>
  );
};

export default ActiveAssignments;
