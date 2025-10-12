import { useOCRDataStore } from "@/store/ManageScan/useOCRDataStore";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE, api, qf } from '@/src/lib/api';

interface OCRProcessData {
    submission_id: string;
    personal_data_id: string;
    best_match_name: string;
    best_match_id: string;
}

export const useFetchOCRProcessing = (course_id: string, assignment_id: string, options?: UseQueryOptions) => {
    const setOCRProcessingData = useOCRDataStore((state) => state.setOCRProcessingData);

    return useQuery<OCRProcessData[], Error>({
        queryKey: ['ocr_data', course_id, assignment_id],
        queryFn: async () => {
            const response = await axios.get(`${API_BASE}/instructor/ocr/process`, {
                params: { course_id: course_id, assignment_id: assignment_id },
            });

            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }

            const data = response.data.ocr_data;
            setOCRProcessingData(data || []);
            return data || [];
        },
        enabled: !!course_id && !!assignment_id && options?.enabled !== false,
        refetchOnWindowFocus: false,
    });
}