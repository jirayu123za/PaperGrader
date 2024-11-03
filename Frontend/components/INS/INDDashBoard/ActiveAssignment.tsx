import React from 'react';
import { useRouter } from 'next/router';
import { Progress, Table, Divider } from '@mantine/core'; // นำเข้า Divider จาก Mantine
import dayjs from 'dayjs';
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
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Active Assignments</h2>
        <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-300" onClick={openModal}>
          Create Assignment
        </button>
      </div>
      {filteredAssignments.length > 0 ? (
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th className="text-center text-lg">Active Assignments</th>
              <th className="text-center text-lg">Released</th>
              <th className="text-center text-lg">Time Progress</th>
              <th className="text-center text-lg">Due</th>
              <th className="text-center text-lg">% Submissions</th>
              <th className="text-center text-lg">% Graded</th>
              <th className="text-center text-lg">Published</th>
              <th className="text-center text-lg">Regrades</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssignments.map((assignment, index) => (
              <React.Fragment key={assignment.assignment_id}>
                <tr>
                  <td
                    className="py-6 px-4 cursor-pointer hover:underline text-center text-lg"
                    onClick={() => router.push(`/courses/${selectedCourseId}/process/${assignment.assignment_id}/CreateOutline`)}
                  >
                    {assignment.assignment_name}
                  </td>
                  <td className="py-6 px-4 text-center text-lg">
                    {parseDate(assignment.assignment_release_date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-6 px-4 text-center text-lg">
                    <div className="relative">
                      <Progress
                        value={calculateTimeProgress(assignment.assignment_release_date, assignment.assignment_due_date)}
                        color="blue"
                        size="sm"
                        radius="lg"
                      />
                    </div>
                  </td>
                  <td className="py-6 px-4 text-center text-lg">
                    {parseDate(assignment.assignment_due_date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-6 px-4 text-center text-lg">0</td>
                  <td className="py-6 px-4 text-center text-lg">0%</td>
                  <td className="py-6 px-4 text-center text-lg">ON</td>
                  <td className="py-6 px-4 text-center text-lg">ON</td>
                </tr>
                {/* เพิ่ม Divider ระหว่างแถว */}
                {index < filteredAssignments.length - 1 && (
                  <tr>
                    <td colSpan={8}>
                      <Divider my="xs" />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      ) : (
        <div className="text-gray-500">
          You currently have no active assignments. Create an assignment to get started.
        </div>
      )}
    </div>
  );
};

export default ActiveAssignments;
