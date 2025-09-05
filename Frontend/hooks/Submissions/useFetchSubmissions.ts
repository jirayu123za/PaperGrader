import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useSubmissionsStore } from "@/store/Submissions/useSubmissionsStore";

interface SubmissionsResponse {
    submission_id: string;
    user_name: {
        first_name: string | null;
        last_name: string | null;
        email: string | null;
    };
    section_name: string | null;
    graded_by: string | null;
    score: number | null;
    grade_status: boolean;
}

interface Submissions {
    submissions: SubmissionsResponse[];
}

interface QuestionData {
    question_title: string;
    question_point: number;
}

export const useFetchSubmissionsFromQuestion = (course_id: string, assignment_id: string, question_id: string, sub_question_id: string) => {
    const setSubmissions = useSubmissionsStore((state) => state.setSubmissions);
    const setQuestionData = useSubmissionsStore((state) => state.setQuestionData);

    return useQuery<Submissions>({
        queryKey: ['submissions_list', course_id, assignment_id],
        queryFn: async () => {
            const response = await axios.get(`/api/api/instructor/submissions/question`, {
                params: {
                    course_id,
                    assignment_id,
                    question_id,
                    sub_question_id
                }
            });

            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }

            const submissionsData: SubmissionsResponse[] = response.data.submissions_list ?? [];
            setSubmissions({ submissions: submissionsData });
            const QuestionData: QuestionData = response.data.question_data ?? null;
            setQuestionData({ ...QuestionData });
            return { submissions: submissionsData, questionData: QuestionData };
        },
        enabled: !!course_id && !!assignment_id,
        refetchOnWindowFocus: false,
    });
};