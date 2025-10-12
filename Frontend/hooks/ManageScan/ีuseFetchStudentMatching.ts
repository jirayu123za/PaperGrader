import { useQuery } from "@tanstack/react-query";
import { useStudentMatchingStore } from "@/store/ManageScan/useStudentMatchingStore";
import axios from "axios";
import { API_BASE, api, qf } from '@/src/lib/api';

interface StudentMatchingData {
    submission_id: string;
    has_assigned: boolean;
    personal_data_id: string | null;
    full_name: string;
    student_code: string;
    section_name: string;
    matched_by: string | null;
    submitted_at: string;
    url_file_name: string;
    url_file_id: string;
}

export const useFetchStudentMatching = (course_id: string, assignment_id: string) => {
    const setStudentMatchingData = useStudentMatchingStore((state) => state.setStudentMatchingData);

    return useQuery<StudentMatchingData[], Error>({
        queryKey: ['submissions', course_id, assignment_id],
        queryFn: async () => {
            const response = await axios.get(`${API_BASE}/instructor/ocr/submissions`, {
                params: { course_id: course_id, assignment_id: assignment_id },
            });

            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }

            const data = response.data.submissions;
            setStudentMatchingData(data || []);
            return data || [];
        },
        enabled: !!course_id && !!assignment_id,
        refetchOnWindowFocus: false,
    });
}