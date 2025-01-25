import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useINS_SubmissionStore } from '../store/useINS_SubmissionStore';

interface Submission {
  submission_id: string;
  submitted_at: string;
  personal_data_id: string;
  student_code: string;
  full_name: string;
  email: string;
  section_name: string;
}

interface SubmissionResponse {
  message: string;
  submissions: Submission[];
}

export const useFetchSubmissions = (course_id: string, assignment_id: string) => {
  const setSubmissions = useINS_SubmissionStore((state) => state.setSubmissions);
  const clearSubmissions = useINS_SubmissionStore((state) => state.clearSubmissions);

  return useQuery<SubmissionResponse>({
    queryKey: ['submissions', course_id, assignment_id],
    queryFn: async () => {
      const response = await axios.get('/api/api/instructor/submissionsList', {
        params: {
          course_id: course_id,
          assignment_id: assignment_id,
        },
      });

      if (response.status !== 200) {
        throw new Error('Failed to fetch submissions');
      }

      if (response.data.submissions?.length > 0) {
        setSubmissions(response.data.submissions);
      } else {
        clearSubmissions();
      }

      return response.data;
    },
    enabled: !!course_id && !!assignment_id,
  });
};
