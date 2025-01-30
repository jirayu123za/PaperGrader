import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSectionDetailsStore } from '../../store/useRosterStore';

interface SectionDetails {
  section_id: string;
  section_name: string;
  total_students: number;
}

export const useFetchSections = (course_id: string) => {
  const setSectionDetails = useSectionDetailsStore((state) => state.setSectionDetails);

  return useQuery<SectionDetails[]>({
    queryKey: ['sections', course_id],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/api/instructor/roster/section`, {
          params: { course_id },
        });

        const sections = response.data.sections || [];
        setSectionDetails(sections);
        return sections;
      } catch (error) {
        console.error(error);
        return [];
      }
    },
    enabled: !!course_id,
  });
};
