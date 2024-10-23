import { useMutation, UseMutationResult } from '@tanstack/react-query';
import axios from 'axios';
import { useINS_SubmissionStore } from '../store/useINS_SubmissionStore';

interface SubmissionResponse {
  files: string[];
  urls: string[];
  message: string;
}

interface SubmissionVariables {
  courseId: string;
  assignmentId: string;
}

// Function สำหรับดึงข้อมูล submissions
const fetchSubmissions = async ({ courseId, assignmentId }: SubmissionVariables): Promise<SubmissionResponse> => {
  const response = await axios.get('/api/api/instructor/submissions', {
    params: {
      course_id: courseId,
      assignment_id: assignmentId,
    },
  });

  if (response.status !== 200) {
    throw new Error('Network response was not ok');
  }

  return response.data as SubmissionResponse;
};

// ใช้ useMutation สำหรับส่งข้อมูล
export const useFetchINS_Submission = (): UseMutationResult<
  SubmissionResponse,  // TData
  Error,               // TError
  SubmissionVariables  // TVariables
> => {
  const setSubmissions = useINS_SubmissionStore((state) => state.setSubmissions);
  const clearSubmissions = useINS_SubmissionStore((state) => state.clearSubmissions);

  return useMutation({
    mutationFn: fetchSubmissions,
    onSuccess: (data: SubmissionResponse) => {
      console.log('Submissions fetched successfully:', data);
      setSubmissions(data.files, data.urls); // ตั้งค่า files และ urls ใน Zustand store
    },
    onError: (error: Error) => {
      console.error('Error fetching submissions:', error.message);
      clearSubmissions(); // ล้างข้อมูลใน Zustand store เมื่อเกิดข้อผิดพลาด
    },
  });
};
