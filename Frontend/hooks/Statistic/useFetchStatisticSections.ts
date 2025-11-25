import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { API_BASE } from '@/src/lib/api';
import { useStatisticSectionsStore, type StatisticSection } from '@/store/statistic/useStatisticSectionsStore';

export const useFetchStatisticSections = (course_id: string, assignment_id: string | null) => {
  const { assignmentID: assignmentIDFromStore, setSections } = useStatisticSectionsStore((s) => ({ assignmentID: s.assignmentID, setSections: s.setSections }));
  const assignmentID = assignment_id ?? assignmentIDFromStore;

  return useQuery<StatisticSection[]>({
    queryKey: ['statistics-sections', course_id, assignmentID],
    queryFn: async (): Promise<StatisticSection[]> => {
      const url = `${API_BASE}/instructor/statistics/sections?course_id=${course_id}`;
      const response = await axios.post(url, { assignment_id: assignmentID })

      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }

      const data = (response.data?.sections ?? []) as StatisticSection[];
      setSections(data);
      return data || [];
    },
    enabled: !!course_id && !!assignmentID,
    refetchOnWindowFocus: false,
  });
}
