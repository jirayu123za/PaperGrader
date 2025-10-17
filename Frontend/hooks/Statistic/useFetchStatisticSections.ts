import { useQuery } from '@tanstack/react-query';
import { API_BASE } from '@/src/lib/api';
import {useStatisticSectionsStore,type StatisticSection,} from '@/store/statistic/useStatisticSectionsStore';

type ApiResponse = {
  message: string;
  sections: StatisticSection[];
};

export function useFetchStatisticSections() {
  const courseId = useStatisticSectionsStore((s) => s.courseId);
  const assignmentId = useStatisticSectionsStore((s) => s.assignmentId);
  const setSections = useStatisticSectionsStore((s) => s.setSections);

  return useQuery({
    queryKey: ['statistics-sections', courseId, assignmentId],
    enabled: Boolean(courseId && assignmentId),
    queryFn: async (): Promise<ApiResponse> => {
      if (!courseId || !assignmentId) throw new Error('Missing courseId or assignmentId');

      const url = `${API_BASE}/instructor/statistics/sections?course_id=${courseId}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ assignment_id: assignmentId }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Fetch sections failed (${res.status}) ${text}`);
      }

      const data = (await res.json()) as ApiResponse;
      return data;
    },
    select: (data) => {
      setSections(data.sections ?? []);
      return data;
    },
    retry: 0,
    staleTime: 60_000,
  });
}
