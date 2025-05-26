import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFetchStudentMatching } from './ีuseFetchStudentMatching';
import { useStudentMatchingStore } from '@/store/ManageScan/useStudentMatchingStore';

interface updateSubmissionParams {
    submission_id: string;
    assignment_id: string;
    personal_data_id: string;
    matched_by?: string;
}

const updateSubmission = async ({ submission_id, assignment_id, personal_data_id, matched_by }: updateSubmissionParams) => {
    const { data } = await axios.patch(`/api/api/instructor/submission/manage`, null, {
        params: {
            submission_id,
            assignment_id,
            personal_data_id,
            matched_by,
        },
        headers: {
            "Content-Type": "application/json",
        },
    });
    return data;
};

export const useUpdateSubmission = (course_id: string, assignment_id: string) => {
    const queryClient = useQueryClient();
    const { setStudentMatchingData } = useStudentMatchingStore();
    const { refetch: refetchStudentMatchingData } = useFetchStudentMatching(course_id, assignment_id);

    return useMutation({
        mutationFn: updateSubmission,
        onSuccess: async (data) => {
            console.log('Update successful:', data);
            queryClient.invalidateQueries({ queryKey: ['students'] });

            const { data: updatedSubmissions } = await refetchStudentMatchingData();
            if (updatedSubmissions) {
                setStudentMatchingData(updatedSubmissions);
            }
        },
        onError: (error) => {
            console.error('Update failed:', error);
            alert('Failed to update the submission. Please try again.');
        },
    });
};