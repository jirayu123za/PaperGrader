import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useAssignmentLeftProcessStore } from '../../store/useLeftProcessStore';
import { API_BASE, api, qf } from '@/src/lib/api';

interface AssignmentLeftProcess {
    assignment_id: string;
    assignment_name: string;
}

export const useFetchAssignmentLeft = (course_id: string, assignment_id: string) => {
    const setAssignmentLeftProcess = useAssignmentLeftProcessStore((state) => state.setAssignmentLeftProcess);

    return useQuery<AssignmentLeftProcess, Error>({
        queryKey: ['process_left_sidebar', course_id, assignment_id],
        queryFn: async () => {
            const response = await axios.get(`${API_BASE}/instructor/leftSidebar/process`, {
                params: { course_id: course_id, assignment_id: assignment_id },
            });

            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }

            const data = response.data.process_left_sidebar;
            setAssignmentLeftProcess(data);
            return data;
        },
        enabled: !!course_id && !!assignment_id,
    });
};