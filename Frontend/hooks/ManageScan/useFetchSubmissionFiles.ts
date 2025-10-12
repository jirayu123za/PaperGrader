import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useSubmissionFilesStore } from '../../store/ManageScan/useSubmissionFiles';
import { API_BASE, api, qf } from '@/src/lib/api';

interface SubmissionsList {
    submission_id: string;
    file_name: string;
    submitted_at: string;
    total_submissions: number;
    submitted_by: string;
}

export const useFetchSubmissionFiles = (assignment_id: string) => {
    const setSubmissionFiles = useSubmissionFilesStore((state) => state.setSubmissionsList);

    return useQuery<SubmissionsList[], Error>({
        queryKey: ['submissions_list', assignment_id],
        queryFn: async () => {
            const response = await axios.get(`${API_BASE}/instructor/submission/files`, {
                params: {
                    assignment_id: assignment_id,
                },
            });

            if (response.status !== 200) {
                throw new Error('Failed to fetch submission files');
            }

            const data = response.data.submissions_list;
            setSubmissionFiles(data || []);
            return data || [];
        },
        enabled: !!assignment_id,
        refetchOnWindowFocus: false,
    });
};