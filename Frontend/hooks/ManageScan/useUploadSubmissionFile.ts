import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSubmissionFilesStore } from '@/store/ManageScan/useSubmissionFiles';
import { useFetchSubmissionFiles } from './useFetchSubmissionFiles';
import { API_BASE, api, qf } from '@/src/lib/api';

interface UploadFileParams {
    assignment_id: string;
    course_id: string;
    files: File[];
}

const uploadSubmissionFile = async ({ assignment_id, course_id, files }: UploadFileParams) => {
    console.log('Uploading submission files:', files, 'for assignment:', assignment_id, 'and course:', course_id);
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const { data } = await axios.post(`${API_BASE}/instructor/submission/file`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        params: {
            assignment_id: assignment_id,
            course_id: course_id,
        },
    });

    return data;
};

export const useUploadSubmissionFile = (assignment_id: string) => {
    const queryClient = useQueryClient();
    const { setSubmissionsList } = useSubmissionFilesStore();
    const { refetch: refetchSubmissionsList } = useFetchSubmissionFiles(assignment_id);

    return useMutation({
        mutationFn: uploadSubmissionFile,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['submissions_list'] });
            refetchSubmissionsList().then((response) => {
                if (response.data) {
                    setSubmissionsList(response.data);
                }
            });
        },
        onError: (error) => {
        },
    });
};