import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useManageOCRStore } from "@/store/ManageScan/useManageOCRStore";
import axios from "axios";

interface OCRData {
    submission_id: string;
    is_match: boolean;
    has_assigned: boolean;
    personal_data_id: string | null;
    best_match_name: string;
    best_match_id: string;
    similarity: number;
    submitted_at: string;
    url_name_file: string;
    url_id_file: string;
}

export const useFetchManageOCR = (course_id: string, assignment_id: string, options?: UseQueryOptions) => {
    const setOCRData = useManageOCRStore((state) => state.setOCRData);

    return useQuery<OCRData[], Error>({
        queryKey: ['ocr_data', course_id, assignment_id],
        queryFn: async () => {
            const response = await axios.get('/api/api/instructor/ocr/submissionBoxes', {
                params: { course_id: course_id, assignment_id: assignment_id },
            });

            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }

            const data = response.data.ocr_data;
            setOCRData(data || []);
            return data || [];
        },
        enabled: !!course_id && !!assignment_id && options?.enabled !== false,
    });
}