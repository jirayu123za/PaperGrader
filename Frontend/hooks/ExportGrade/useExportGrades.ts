import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE } from '@/src/lib/api';
import { useExportGradeStore } from '@/store/ExportGrade/useExportGradeStore';

export type FileStatus = "pending" | "completed" | "failed";

export interface ExportGradeItem {
    export_grade_id: string;
    course_id: string;
    assignment_id: string;
    file_name: string;
    file_status: FileStatus;
    file_url: string;
    processed_at?: string | null;
    created_at: string;
    requested_by: string;
}

interface ExportGradesParams {
    course_id: string | null;
}

interface RequestBody {
    assignment_id: string;
}

type ExportGradesInput = {
    params: ExportGradesParams;
    body: RequestBody;
};

const postQueueExport = async function ({ params, body }: ExportGradesInput) {
    const response = await axios.post(`${API_BASE}/instructor/assignment/export`,
        {
            ...body
        }, { params: { ...params } });
    if (response.status !== 200) {
        throw new Error(response.data?.error || response.data?.message || "Export queue failed");
    }
    return response.data;
}

export const useExportGrades = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: postQueueExport,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['export-grades', variables.params.course_id] });
        },
        onError: (error: any) => {
        }
    });
};

type FetchLatestExportInput = {
    params: { course_id: string | null; };
};

type LatestExportResponse = {
    exportList: ExportGradeItem[];
    message: string;
};

export async function getLatestExport({ params }: FetchLatestExportInput): Promise<LatestExportResponse> {
    const res = await axios.get(`${API_BASE}/instructor/assignment/export/latest`,
        {
            params: { ...params }
        }
    );
    if (res.status !== 200) {
        throw new Error(
            res.data?.error || res.data?.message || "Fetch export status failed"
        );
    }
    return res.data as LatestExportResponse;
}

export const useFetchLatestExport = (course_id: string | null) => {
    const setExportList = useExportGradeStore((s) => s.setExportList);

    return useQuery<ExportGradeItem[], Error>({
        queryKey: ["export-grades", course_id],
        enabled: !!course_id,
        queryFn: async () => {
            const { exportList } = await getLatestExport({
                params: {
                    course_id: course_id!,
                },
            });
            setExportList(exportList ?? []);
            return exportList ?? [];
        },
        refetchOnWindowFocus: false,
        refetchInterval(query) {
            const data = query.state.data as ExportGradeItem[] | undefined;
            if (!data) return false;
            const hasPending = data.some((item) => item.file_status === "pending");
            return hasPending ? 60_000 : false;
        },
    });
};