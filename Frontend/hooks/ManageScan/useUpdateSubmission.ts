import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface updateSubmissionParams {
    submission_id: string;
    assignment_id: string;
    personal_data_id: string;
}

const updateSubmission = async ({ submission_id, assignment_id, personal_data_id }: updateSubmissionParams) => {
    const { data } = await axios.patch(`/api/api/instructor/submission/manage`, null, {
        params: {
            submission_id,
            assignment_id,
            personal_data_id,
        },
        headers: {
            "Content-Type": "application/json",
        },
    });
    return data;
};

export const useUpdateSubmission = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateSubmission,
        onSuccess: (data) => {
            console.log('Update successful:', data);
            alert(`Submission updated successfully!`);
            queryClient.invalidateQueries({ queryKey: ['submissions'] });
            queryClient.invalidateQueries({ queryKey: ['students'] });
        },
        onError: (error) => {
            console.error('Update failed:', error);
            alert('Failed to update the submission. Please try again.');
        },
    });
};