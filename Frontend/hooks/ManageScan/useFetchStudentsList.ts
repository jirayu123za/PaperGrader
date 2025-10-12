import { useQuery } from "@tanstack/react-query";
import { useStudentsListStore } from "../../store/ManageScan/useStudentsListStore";
import axios from "axios";
import { API_BASE, api, qf } from '@/src/lib/api';

interface Student {
    personal_data_id: string;
    full_name: string;
    email: string;
    student_code: string;
}

interface StudentSubmissionSplitResponse {
    with_submission: Student[];
    without_submission: Student[];
}

export const useFetchStudentsList = (course_id: string, assignment_id: string) => {
    const setWithSubmission = useStudentsListStore((state) => state.setWithSubmission);
    const setWithoutSubmission = useStudentsListStore((state) => state.setWithoutSubmission);

    return useQuery<StudentSubmissionSplitResponse, Error>({
        queryKey: ['students', course_id, assignment_id],
        queryFn: async () => {
            const response = await axios.get(`${API_BASE}/instructor/submission/studentList`, {
                params: { course_id: course_id, assignment_id: assignment_id },
            });

            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }

            const data = response.data as StudentSubmissionSplitResponse;
            setWithSubmission(data.with_submission || []);
            setWithoutSubmission(data.without_submission || []);
            return data;
        },
        enabled: !!course_id && !!assignment_id,
    });
};