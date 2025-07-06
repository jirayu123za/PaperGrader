import { useQuery, useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import axios from 'axios';

export interface Assignment {
  assignment_id: string;
  assignment_name: string;
}

export type FileType = 'csv' | 'pdf';

export interface UseFetchExportModalResult {
  assignments: Assignment[];
  isLoadingAssignments: boolean;
  fetchError: unknown;
  exportAssignments: (assignmentIds: string[], fileType: FileType) => void;
  isExporting: boolean;
  exportError: unknown;
}

export function useFetchExportModal(course_id: string | null): UseFetchExportModalResult {
  const { data = [], isLoading: isLoadingAssignments, error: fetchError } =
    useQuery<Assignment[], unknown>({
      queryKey: ['courseAssignments', course_id],
      queryFn: async () => {
        if (!course_id) return [];
        const res = await axios.get<Assignment[]>(
          `/api/courses/${course_id}/assignments`
        );
        return res.data;
      },
      enabled: Boolean(course_id),
      retry: 1,
    });

  const { mutate, isPending: isExporting, error: exportError } =
    useMutation<Blob, unknown, { assignmentIds: string[]; fileType: FileType }>({
      mutationFn: async ({ assignmentIds, fileType }) => {
        if (!course_id) throw new Error('Missing course_id');
        const res = await axios.post(
          `/api/courses/${course_id}/assignments/export`,
          { assignmentIds, fileType },
          { responseType: 'blob' }
        );
        return res.data;
      },
    });

  const exportAssignments = useCallback(
    (assignmentIds: string[], fileType: FileType) => {
      mutate({ assignmentIds, fileType });
    },
    [mutate]
  );

  return {
    assignments: data,
    isLoadingAssignments,
    fetchError,
    exportAssignments,
    isExporting,
    exportError,
  };
}
