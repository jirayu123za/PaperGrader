import React, { useEffect } from 'react';
import { useAssignmentStore } from '../store/useAssignmentStore';
import { useFetchAssignments } from '../hooks/useFetchAssignments';

interface INTAssignmentProps {
  courseId: string;
}

const INTAssignment: React.FC<INTAssignmentProps> = ({ courseId }) => {
  const { data, isLoading, error } = useFetchAssignments(courseId);
  const assignments = useAssignmentStore((state) => state.assignments);
  const parseDate = (dateString: string): Date => {
    const [day, month, year] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  useEffect(() => {
    console.log(assignments);
  }, [assignments]);

  if (isLoading) return <div>Loading assignments...</div>;
  if (error) return <div>Error loading assignments: {error.message}</div>;
  if (!assignments || assignments.length === 0) {
    return <div className="p-6 bg-white shadow rounded-lg">No assignments available.</div>;
  }

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">{assignments.length} Assignments</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr className="border-b">
            <th className="py-2 px-4 text-left">NAME</th>
            <th className="py-2 px-4 text-left">POINTS</th>
            <th className="py-2 px-4 text-left">RELEASED</th>
            <th className="py-2 px-4 text-left">DUE</th>
            <th className="py-2 px-4 text-left">CUTOFF</th>
            <th className="py-2 px-4 text-left">SUBMISSIONS</th>
            <th className="py-2 px-4 text-left">% GRADED</th>
            <th className="py-2 px-4 text-left">PUBLISHED</th>
            <th className="py-2 px-4 text-left">REGRADES</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => (
            <tr key={assignment.assignment_id} className="border-b">
            <td className="py-2 px-4">{assignment.assignment_name}</td>
            <td className="py-2 px-4">0.0</td>
            <td className="py-2 px-4">
              {parseDate(assignment.assignment_release_date).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </td>
            <td className="py-2 px-4">
              {parseDate(assignment.assignment_due_date).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </td>
            <td className="py-2 px-4">
              {parseDate(assignment.assignment_cut_off_date).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </td>
            <td className="py-2 px-4">0</td>
            <td className="py-2 px-4">0%</td>
            <td className="py-2 px-4">ON</td>
            <td className="py-2 px-4">ON</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  );
};

export default INTAssignment;
