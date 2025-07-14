import { useQuery, useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import axios from 'axios';

export interface Assignment {
  assignment_id: string;
  assignment_name: string;
}

export type FileType = 'excel' | 'pdf';

/**
 * Hook #1: fetch list of assignments for export
 * Uses query params, follows useFetchRubric pattern
 */
export function useFetchAssignments(course_id: string | null) {
  return useQuery<Assignment[], Error>({
    queryKey: ['exportAssignmentsList', course_id],
    queryFn: async () => {
      if (!course_id) throw new Error('Missing course_id');
      const response = await axios.get<{
        assignments: Assignment[];
        message: string;
      }>(
        '/api/api/instructor/assignments/export',
        { params: { course_id } }
      );
      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }
      // สำคัญ: คืน array assignments เท่านั้น
      return response.data.assignments;
    },
    enabled: Boolean(course_id),
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook #2: mutate export assignments, returns Promise<Blob>
 */
export function useExportAssignments(course_id: string | null) {
  const { mutateAsync, isPending: isExporting, error: exportError } = useMutation<
    Blob,
    unknown,
    { assignmentIds: string[]; fileType: FileType }
  >({
    mutationFn: async ({ assignmentIds, fileType }) => {
      if (!course_id) throw new Error('Missing course_id');
      const res = await axios.post(
        '/api/api/instructor/assignments/export',
        { assignmentIds, fileType },
        { responseType: 'blob' }
      );
      return res.data;
    },
  });

  const exportAssignments = useCallback(
    (assignmentIds: string[], fileType: FileType) => mutateAsync({ assignmentIds, fileType }),
    [mutateAsync]
  );

  return { exportAssignments, isExporting, exportError };
}
