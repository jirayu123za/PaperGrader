import React from 'react';
import { useINS_SubmissionStore } from '../../../store/useINS_SubmissionStore';
import { Alert, Button } from '@mantine/core';
import { useRouter } from 'next/router';
import { useFetchSubmissions } from '../../../hooks/useFetchINS_Submission';

interface INSSubmissionsProps {
  onViewPDF: (fileUrl: string) => void;
}

const INSSubmissions: React.FC<INSSubmissionsProps> = ({ onViewPDF }) => {
  const router = useRouter();
  const { assignment_id, course_id } = router.query;
  const { submissions, urls } = useINS_SubmissionStore();
  const { isLoading, error } = useFetchSubmissions(course_id as string, assignment_id as string);

  if (isLoading) {
    return <div>Loading submissions...</div>;
  }

  if (error) {
    return <Alert color="red">Failed to load submissions.</Alert>;
  }

  return (
    <div>
      <h3>Submissions for Assignment</h3>
      {submissions.length > 0 ? (
        <ul>
          {submissions.map((file, index) => (
            <li key={file}>
              <Button variant="light" onClick={() => onViewPDF(urls[index])}>
                {file} - View PDF
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <Alert color="yellow">No students have submitted assignments yet.</Alert>
      )}
    </div>
  );
};

export default INSSubmissions;
