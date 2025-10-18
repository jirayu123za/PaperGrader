// src/hooks/Statistic/useFetchStatistics.ts
import { useQuery } from '@tanstack/react-query';
import { API_BASE } from '@/src/lib/api';
import { useStatisticsStore, type StatisticsApiResponse } from '@/store/statistic/useStatisticsStore';
import { useStatisticSectionsStore } from '@/store/statistic/useStatisticSectionsStore';



export function useFetchStatistics() {
  const courseId = useStatisticsStore((s) => s.courseId);
  const assignmentId = useStatisticsStore((s) => s.assignmentId);
  const sectionIds = useStatisticSectionsStore((s) => s.selectedSectionIds);
  const setData = useStatisticsStore((s) => s.setData);

  const enabled = Boolean(courseId && assignmentId && sectionIds.length > 0);

  return useQuery({
    queryKey: ['statistics', courseId, assignmentId, sectionIds.join(',')],
    enabled,
    queryFn: async (): Promise<StatisticsApiResponse> => {
      const url = `${API_BASE}/instructor/statistics?course_id=${courseId}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ assignment_id: assignmentId, section_ids: sectionIds }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Fetch statistics failed (${res.status}) ${text}`);
      }
      return (await res.json()) as StatisticsApiResponse;
    },
    select: (data) => { setData(data); return data; },
    retry: 0,
    staleTime: 60_000,
  });
}
