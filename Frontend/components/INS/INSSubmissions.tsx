import React, { useEffect } from 'react';
import { useFetchINS_Submission } from '../../hooks/useFetchINS_Submission';
import { useINS_SubmissionStore } from '../../store/useINS_SubmissionStore';
import { Alert, Button } from '@mantine/core';

interface INSSubmissionsProps {
  courseId: string;
  assignmentId: string;
  onViewPDF: (fileUrl: string) => void;  // ฟังก์ชันเพื่อเปิด PDFViewer
}

const INSSubmissions: React.FC<INSSubmissionsProps> = ({ courseId, assignmentId, onViewPDF }) => {
  const { submissions, urls } = useINS_SubmissionStore();
  const { mutate: fetchSubmissions, isLoading, isError } = useFetchINS_Submission();

  useEffect(() => {
    // Fetch submissions ทันทีเมื่อ Component ถูก mount
    fetchSubmissions({ courseId, assignmentId });
  }, [courseId, assignmentId, fetchSubmissions]);

  if (isLoading) {
    return <div>Loading submissions...</div>;
  }

  if (isError) {
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
        <Alert color="yellow">No submissions available.</Alert>
      )}
    </div>
  );
};

export default INSSubmissions;
