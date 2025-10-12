import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSectionsListStore } from '../store/useSectionStore';
import { API_BASE, api, qf } from '@/src/lib/api';

interface SectionsList {
  section_id: string;
  section_name: string;
}

export const useFetchSections = (course_id: string) => {
  const setSectionsList = useSectionsListStore((state) => state.setSectionsList);

  return useQuery<SectionsList[]>({
    queryKey: ['sections', course_id],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/sections/name`, {
        params: { course_id: course_id },
      });

      setSectionsList(response.data.sections);
      return response.data.sections || [];
    },
    enabled: !!course_id,
  });
};
