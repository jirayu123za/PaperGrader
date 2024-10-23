import { useQuery, UseQueryResult } from '@tanstack/react-query';
import axios from 'axios';
import { useINS_SubmissionStore } from '../store/useINS_SubmissionStore';

interface FetchSubmissionParams {
  courseId: string;
  assignmentId: string;
}

interface SubmissionResponse {
  files: string[];
  urls: string[];
  message: string;
}

const fetchSubmissions = async ({ courseId, assignmentId }: FetchSubmissionParams): Promise<SubmissionResponse> => {
  const response = await axios.get('/api/api/instructor/submissions', {
    params: {
      course_id: courseId,
      assignment_id: assignmentId,
    },
  });
  return response.data;
};

export const useFetchINS_Submission = (courseId: string, assignmentId: string): UseQueryResult<SubmissionResponse, Error> => {
  const { setSubmissions, clearSubmissions } = useINS_SubmissionStore();

  return useQuery<SubmissionResponse, Error>(
    ['instructorSubmissions', courseId, assignmentId],
    () => fetchSubmissions({ courseId, assignmentId }),
    {
      onSuccess: (data) => {
        console.log('Submissions fetched successfully:', data);
        setSubmissions(data.files, data.urls);  // เก็บข้อมูลไฟล์และ URL ใน Zustand Store
      },
      onError: (error: Error) => {
        console.error('Error fetching submissions:', error.message);
        clearSubmissions();  // ล้างข้อมูลใน Store เมื่อเกิด error
      },
    }
  );
};
