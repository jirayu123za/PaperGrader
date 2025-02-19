import { useQuery } from '@tanstack/react-query';
import { useSubmissionFilesStore } from '../../store/ManageScan/useSubmissionFiles';
import axios from 'axios';

interface SubmissionFiles {
    submission_id: string;
    submission_file_name: string;
    submitted_at: string;
}

export const useFetchSubmissionFiles = (assignment_id: string) => {
    const setSubmissionFiles = useSubmissionFilesStore((state) => state.setSubmissions);

    return useQuery<SubmissionFiles[], Error>({
        queryKey: ['submissions', assignment_id],
        queryFn: async () => {
            const response = await axios.get('/api/api/instructor/submission/files', {
                params: {
                    assignment_id: assignment_id,
                },
            });

            if (response.status !== 200) {
                throw new Error('Failed to fetch submission files');
            }

            const data = response.data.submissions;
            setSubmissionFiles(data || []);
            return data || [];
        },
        enabled: !!assignment_id,
    });
};