// hooks/useFetchExportModal.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import axios from 'axios';

export interface Assignment {
  assignment_id: string;
  assignment_name: string;
}
export type FileType = 'csv' | 'pdf';

/** Hook #1: fetch list of assignments */
export function useFetchAssignments(course_id: string | null) {
  return useQuery<Assignment[], unknown>({
    queryKey: ['courseAssignments', course_id],
    queryFn: async () => {
      if (!course_id) return [];
      const res = await axios.get<Assignment[]>(
        `/api/courses/${course_id}/assignments`
      );
      return res.data;
    },
    enabled: Boolean(course_id),
  });
}

/** Hook #2: export assignments, returns a Promise<Blob> */
export function useExportAssignments(course_id: string | null) {
  const {
    mutateAsync,
    isPending: isExporting,
    error: exportError,
  } = useMutation<Blob, unknown, { assignmentIds: string[]; fileType: FileType }>({
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

  // rename mutateAsync for clarity
  const exportAssignments = useCallback(
    (assignmentIds: string[], fileType: FileType) =>
      mutateAsync({ assignmentIds, fileType }),
    [mutateAsync]
  );

  return { exportAssignments, isExporting, exportError };
}
