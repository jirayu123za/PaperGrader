import { useQuery } from '@tanstack/react-query';
import { useTotalSubmissionsStore, TTotalSubmission } from '@/store/useGradeBottomStore';

type ApiResponse = {
  total_submissions: TTotalSubmission[];
};

export function useFetchTotalSubmissionIDs(assignment_id?: string) {
  const setTotal = useTotalSubmissionsStore((s) => s.setTotal);

  return useQuery({
    queryKey: ['totalSubmissionIDs', assignment_id],
    enabled: !!assignment_id,
    staleTime: 60_000,
    queryFn: async (): Promise<TTotalSubmission[]> => {
      const url = `/api/api/instructor/submission/totalIDs/?assignment_id=${assignment_id}`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Failed to load total submission IDs: ${res.status} ${text}`);
      }
      const data: ApiResponse = await res.json();
      const items = data?.total_submissions ?? [];
      setTotal(items);
      return items;
    },
  });
}
