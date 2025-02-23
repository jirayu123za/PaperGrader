import { useQuery } from "@tanstack/react-query";
import { useStudentsListStore } from "../../store/ManageScan/useStudentsListStore";
import axios from "axios";

interface SubmissionsList {
    submission_id: string;
    section_name: string | null;
    full_name: string | null;
    student_code: string | null;
    has_assigned: boolean;
    submitted_at: string;
}

export const useFetchSubmissionsList = (course_id: string, assignment_id: string) => {
    const setSubmissionsList = useStudentsListStore((state) => state.setSubmissionsList);

    return useQuery<SubmissionsList[], Error>({
        queryKey: ['submissions', course_id, assignment_id],
        queryFn: async () => {
            const response = await axios.get('/api/api/instructor/submission/manage', {
                params: { course_id: course_id, assignment_id: assignment_id },
            });

            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }

            const data = response.data.submissions;
            setSubmissionsList(data || []);
            return data || [];
        },
        enabled: !!course_id && !!assignment_id,
    });
};