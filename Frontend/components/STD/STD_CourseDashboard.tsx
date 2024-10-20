import React from 'react';
import { useAssignments } from '../../hooks/useFetchSTD_Assignment';
import { useAssignmentStore } from '../../store/useSTD_AssignmentStore';
import { Table, Badge } from '@mantine/core';
import dayjs from 'dayjs';

interface CourseDashboardProps {
  courseId: string;
}

const STD_CourseDashboard: React.FC<CourseDashboardProps> = ({ courseId }) => {
  const { data: assignments, isLoading, error } = useAssignments(courseId);
  const { assignments: assignmentList } = useAssignmentStore();

  if (isLoading) return <div>Loading assignments...</div>;
  if (error) return <div>Error loading assignments: {error.message}</div>;

  return (
    <Table striped highlightOnHover>
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
          <th>Released</th>
          <th>Due (+07)</th>
        </tr>
      </thead>
      <tbody>
        {assignmentList.map((assignment) => (
          <tr key={assignment.assignment_id}>
            <td>
              <a href={`/assignment/${assignment.assignment_id}`} className="text-blue-500">
                {assignment.assignment_name}
              </a>
            </td>
            <td>
              <Badge color="green" variant="filled">
                Submitted
              </Badge>
            </td>
            <td>
              {dayjs(assignment.release_Date).format('MMM D [at] h:mm A')}
            </td>
            <td>
              <div>
                {dayjs(assignment.due_date).format('MMM D [at] h:mm A')}
                <br />
                <span className="text-gray-500">Late Due Date: {dayjs(assignment.due_date).add(5, 'minute').format('MMM D [at] h:mm A')}</span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default STD_CourseDashboard;
