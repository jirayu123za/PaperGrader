import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useINS_SubmissionStore } from '../store/useINS_SubmissionStore';

interface SubmissionResponse {
  files: string[];
  urls: string[];
  message: string;
}

export const useFetchSubmissions = (course_id: string, assignment_id: string) => {
  const setSubmissions = useINS_SubmissionStore((state) => state.setSubmissions);
  const clearSubmissions = useINS_SubmissionStore((state) => state.clearSubmissions);

  return useQuery<SubmissionResponse[]>({
    queryKey: ['submissions', course_id, assignment_id],
    queryFn: async () => {
      const response = await axios.get('/api/api/instructor/submissions', {
        params: {
          course_id: course_id,
          assignment_id: assignment_id,
        },
      });
      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }
      if (response.data.files && response.data.files.length > 0 && response.data.urls && response.data.urls.length > 0) {
        setSubmissions(response.data.files, response.data.urls);
      } else {
        console.log('No submissions available.');
        clearSubmissions();
      }
      return response.data || [];
    },
    enabled: !!course_id && !!assignment_id,
  });
};
