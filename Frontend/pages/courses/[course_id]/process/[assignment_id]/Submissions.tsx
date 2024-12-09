import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAssignmentStore } from '../../../../../store/useAssignmentStore';
import LeftProcess from '../../../../../components/LeftINS/LeftProcess';
import INSSubmissions from '../../../../../components/INS/INSSubmissions';

export default function Submissions() {
  const router = useRouter();
  const { assignment_id, course_id } = router.query;
  const { assignments } = useAssignmentStore();
  const [loading, setLoading] = useState<boolean>(true);

  const selectedAssignment = assignments.find((assignment) => assignment.assignment_id === assignment_id);
  const assignmentName = selectedAssignment ? selectedAssignment.assignment_name : 'No Assignment';

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div className="flex min-h-screen">
      <LeftProcess assignment_name={assignmentName} process_id={assignment_id as string} />

      <div className="flex-grow p-4">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <INSSubmissions
              onViewPDF={() => {}}
            />
          </>
        )}
      </div>
    </div>
  );
}
