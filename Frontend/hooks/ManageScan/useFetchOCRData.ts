import axios from "axios";
import { useOCRDataStore } from "@/store/ManageScan/useOCRDataStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE } from '@/src/lib/api';
import { useEffect } from "react";

interface OCRProcessData {
    submission_id: string;
    personal_data_id: string;
    best_match_name: string;
    best_match_id: string;
}

export const useFetchOCRProcessing = (course_id: string, assignment_id: string) => {
    const setOCRProcessingData = useOCRDataStore((state) => state.setOCRProcessingData);
    const queryClient = useQueryClient();

    const query = useQuery<OCRProcessData[], Error>({
        queryKey: ['ocr_data', course_id, assignment_id],
        queryFn: async () => {
            const response = await axios.get(`${API_BASE}/instructor/ocr/process`, {
                params: { course_id, assignment_id },
            });

            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }

            const data = response.data.ocr_data;
            setOCRProcessingData(data || []);
            return data || [];
        },
        enabled: false,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (query.isSuccess) {
            queryClient.invalidateQueries({
                queryKey: ['submissions', course_id, assignment_id],
            });
        }
    }, [query.isSuccess, queryClient, course_id, assignment_id]);

    return query;
}