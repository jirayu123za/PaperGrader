import { useQuery } from '@tanstack/react-query';
import { API_BASE } from '@/src/lib/api';
import { useStatisticsStore, type StatisticsApiResponse } from '@/store/statistic/useStatisticsStore';
import { useStatisticSectionsStore } from '@/store/statistic/useStatisticSectionsStore';

/**
 * ยิง POST /instructor/statistics?course_id=...
 * Body: { assignment_id, section_ids: string[] }
 * เงื่อนไขพร้อมยิง: มี courseId, assignmentId และ sectionIds >= 1
 */
export function useFetchStatistics() {
  const courseId = useStatisticsStore((s) => s.courseId);
  const assignmentId = useStatisticsStore((s) => s.assignmentId);

  // sectionIds ใช้จาก store sections (เป็น source of truth อยู่แล้วในหน้า Header)
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
        body: JSON.stringify({
          assignment_id: assignmentId,
          section_ids: sectionIds,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Fetch statistics failed (${res.status}) ${text}`);
      }

      const data = (await res.json()) as StatisticsApiResponse;
      return data;
    },
    select: (data) => {
      // เก็บผลลัพธ์ลง global store เผื่อหน้าอื่นใช้ต่อ
      setData(data);
      return data;
    },
    retry: 0,
    staleTime: 60_000,
  });
}
