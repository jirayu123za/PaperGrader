import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { API_BASE } from '@/src/lib/api';
import { useStatisticsStore, statisticsData } from '@/store/statistic/useStatisticsStore';
import { useStatisticSectionsStore } from '@/store/statistic/useStatisticSectionsStore';

export const useFetchStatistics = (course_id: string, assignment_id: string | null) => {
  const sectionIDs = useStatisticSectionsStore((s) => s.selectedSectionIDs);
  const { assignmentID: assignmentIDFromStore, setStatisticsData } = useStatisticsStore((s) => ({
    assignmentID: s.assignmentID,
    setStatisticsData: s.setStatisticsData,
  }));
  const assignmentID = assignment_id ?? assignmentIDFromStore;

  return useQuery<statisticsData>({
    queryKey: ['statistics', course_id, assignmentID, sectionIDs.join(',')],
    queryFn: async (): Promise<statisticsData> => {
      const url = `${API_BASE}/instructor/statistics?course_id=${course_id}`;
      const res = await axios.post(url, {
        assignment_id: assignmentID,
        section_ids: sectionIDs,
      });

      if (res.status !== 200) {
        throw new Error('Network response was not ok');
      }
      const data = res.data;
      setStatisticsData(data);
      return data;
    },
    enabled: !!course_id && !!assignmentID && sectionIDs.length > 0,
    refetchOnWindowFocus: false,
  });
}
