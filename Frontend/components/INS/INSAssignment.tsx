import React, { useEffect } from 'react';
import { useAssignmentStore } from '../../store/useAssignmentStore';
import { useFetchAssignments } from '../../hooks/useFetchAssignments';
import { useRouter } from 'next/router';

interface INTAssignmentProps {
  courseId: string;
}

const INTAssignment: React.FC<INTAssignmentProps> = ({ courseId }) => {
  const { isLoading, error } = useFetchAssignments(courseId, false); // isStudent = false
  const assignments = useAssignmentStore((state) => state.assignments);
  const router = useRouter();

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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
            <th className="py-2 px-4 text-left">RELEASED</th>
            <th className="py-2 px-4 text-left">DUE</th>
            <th className="py-2 px-4 text-center">PUBLISHED</th>
            <th className="py-2 px-4 text-center">REGRADES</th>
            <th className="py-2 px-4 text-center">SUBMISS BY</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => (
            <tr key={assignment.assignment_id} className="border-b">
              <td
                className="py-2 px-4 cursor-pointer hover:underline"
                onClick={() => router.push(`/courses/${courseId}/process/${assignment.assignment_id}/CreateOutline`)}
              >
                {assignment.assignment_name}
              </td>
              <td className="py-2 px-4">{formatDate(assignment.assignment_release_date)}</td>
              <td className="py-2 px-4">{formatDate(assignment.assignment_due_date)}</td>
              <td className="py-2 px-4 text-center">{assignment.published ? 'Yes' : 'No'}</td>
              <td className="py-2 px-4 text-center">{assignment.regrades ? 'Yes' : 'No'}</td>
              <td className="py-2 px-4 text-center">{assignment.submiss_by}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default INTAssignment;
