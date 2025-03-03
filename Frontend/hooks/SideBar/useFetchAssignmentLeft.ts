import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useAssignmentLeftProcessStore } from '../../store/useLeftProcessStore';

interface AssignmentLeftProcess {
    assignment_id: string;
    assignment_name: string;
    submiss_by: string;
}

export const useFetchAssignmentLeft = (course_id: string, assignment_id: string) => {
    const setAssignmentLeftProcess = useAssignmentLeftProcessStore((state) => state.setAssignmentLeftProcess);

    return useQuery<AssignmentLeftProcess, Error>({
        queryKey: ['assignment_details', course_id, assignment_id],
        queryFn: async () => {
            const response = await axios.get('/api/api/instructor/assignment/process', {
                params: { course_id: course_id, assignment_id: assignment_id },
            });

            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }

            const data = response.data.assignment_details;
            setAssignmentLeftProcess(data);
            return data;
        },
        enabled: !!course_id && !!assignment_id,
    });
};