import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useSubmissionsStore } from "@/store/Submissions/useSubmissionsStore";

interface SubmissionsResponse {
    submission_id: string;
    user_name: {
        first_name: string;
        last_name: string;
        email: string;
    };
    section_name: string;
    graded_by: string;
    score: number;
    grade_status: boolean;
}

interface Submissions {
    submissions: SubmissionsResponse[];
}


export const useFetchSubmissionsFromQuestion = (course_id: string, assignment_id: string) => {
    const setSubmissions = useSubmissionsStore((state) => state.setSubmissions);

    return useQuery<Submissions>({
        queryKey: ['submissions_list', course_id, assignment_id],
        queryFn: async () => {
            const response = await axios.get(`/api/api/instructor/submissions/question`, {
                params: {
                    course_id,
                    assignment_id
                }
            });

            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }

            const submissionsData: SubmissionsResponse[] = response.data.submissions_list ?? [];
            setSubmissions({ submissions: submissionsData });
            return { submissions: submissionsData };
        },
        enabled: !!course_id && !!assignment_id,
        refetchOnWindowFocus: false,
    });
};