import { useQuery } from "@tanstack/react-query";
import { useActiveAssignmentStore } from "../store/useActiveAssignmentStore";
import axios from "axios";

interface ActiveAssignments {
    assignment_id: string;
    assignment_name: string;
    assignment_release_date: string;
    assignment_due_date: string;
    assignment_description: string;
}

export const useFetchActiveAssignments = (course_id: string) => {
    const setActiveAssignments = useActiveAssignmentStore((state) => state.setActiveAssignments);

    return useQuery<ActiveAssignments[], Error>({
        queryKey: ['assignments', course_id],
        queryFn: async () => {
            const response = await axios.get(`/api/api/instructor/assignments/active`, {
                params: { course_id: course_id },
            });

            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }

            const data = response.data.active_assignments;
            setActiveAssignments(data);
            return data;
        },
    });
};
