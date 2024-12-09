import React from 'react';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { Progress, Table, Divider, Paper, Grid, Button, Pagination } from '@mantine/core';
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";
import { useActiveAssignmentStore } from '../../../store/useActiveAssignmentStore';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore);

const parseDate = (dateString: string): Date => {
  const [day, month, year] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

interface ActiveAssignmentsProps {
  selectedCourseId: string;
  openModal: () => void;
  isLoading: boolean;
  error: Error | null;
}

const ActiveAssignments: React.FC<ActiveAssignmentsProps> = ({ selectedCourseId, openModal, isLoading, error }) => {
  const router = useRouter();
  const { activeAssignments } = useActiveAssignmentStore();
  const iconAssignmentTurnedIn = <MdOutlineAssignmentTurnedIn size={24} />;

  // const pageSize = 10;
  // const totalPages = Math.ceil(filteredUsers.length / pageSize);
  
  // const pagination = usePagination({
  //   total: totalPages,
  //   initialPage: 1,
  //   siblings: 1,
  //   boundaries: 1,
  // });
  
  // const paginatedData = filteredUsers.slice(
  //   (pagination.active - 1) * pageSize,
  //   pagination.active * pageSize
  // );

  const calculateTimeProgress = (releaseDate: string, dueDate: string) => {
    const now = dayjs();
    const start = dayjs(parseDate(releaseDate));
    const end = dayjs(parseDate(dueDate));
    const totalDuration = end.diff(start, 'day');
    const elapsedTime = now.diff(start, 'day');
    const progress = (elapsedTime / totalDuration) * 100;
    return progress > 100 ? 100 : progress < 0 ? 0 : progress;
  };

  const filteredAssignments = (activeAssignments || [])
    .filter(assignment => {
      const now = dayjs();
      const dueDate = dayjs(parseDate(assignment.assignment_due_date));
      return now.isSameOrBefore(dueDate);
    })
    .slice(0, 4);

  if (isLoading) {
    return <div>Loading assignments...</div>;
  }

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
      {filteredAssignments.length > 0 ? (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th className="text-center text-lg">Active Assignments</Table.Th>
              <Table.Th className="text-center text-lg">Released</Table.Th>
              <Table.Th className="text-center text-lg">Time Progress</Table.Th>
              <Table.Th className="text-center text-lg">Due</Table.Th>
              <Table.Th className="text-center text-lg">% Submissions</Table.Th>
              <Table.Th className="text-center text-lg">% Graded</Table.Th>
              <Table.Th className="text-center text-lg">Published</Table.Th>
              <Table.Th className="text-center text-lg">Regrades</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredAssignments.map((assignment, index) => (
              <React.Fragment key={assignment.assignment_id}>
                <Table.Tr>
                  <Table.Td
                    className="py-6 px-4 cursor-pointer hover:underline text-center text-lg"
                    onClick={() => router.push(`/courses/${selectedCourseId}/process/${assignment.assignment_id}/CreateOutline`)}
                  >
                    {assignment.assignment_name}
                  </Table.Td>
                  <Table.Td className="py-6 px-4 text-center text-lg">
                    {parseDate(assignment.assignment_release_date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Table.Td>
                  <Table.Td className="py-6 px-4 text-center text-lg">
                    <div className="relative">
                      <Progress
                        value={calculateTimeProgress(assignment.assignment_release_date, assignment.assignment_due_date)}
                        color="blue"
                        size="sm"
                        radius="lg"
                      />
                    </div>
                  </Table.Td>
                  <Table.Td className="py-6 px-4 text-center text-lg">
                    {parseDate(assignment.assignment_due_date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Table.Td>
                  <Table.Td className="py-6 px-4 text-center text-lg">0</Table.Td>
                  <Table.Td className="py-6 px-4 text-center text-lg">0%</Table.Td>
                  <Table.Td className="py-6 px-4 text-center text-lg">ON</Table.Td>
                  <Table.Td className="py-6 px-4 text-center text-lg">ON</Table.Td>
                </Table.Tr>
                {/* เพิ่ม Divider ระหว่างแถว */}
                {index < filteredAssignments.length - 1 && (
                  <Table.Tr>
                    <Table.Td colSpan={8}>
                      <Divider my="xs" />
                    </Table.Td>
                  </Table.Tr>
                )}
              </React.Fragment>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <div className="text-gray-500">
          You currently have no active assignments. Create an assignment to get started.
        </div>
      )}
      {/* <div className="flex justify-center mt-4">
        <Pagination
          total={totalPages}
          siblings={1}
          boundaries={1}
          value={pagination.active}
          onChange={pagination.setPage}
        />
      </div> */}
    </Paper>
  );
};

export default ActiveAssignments;
