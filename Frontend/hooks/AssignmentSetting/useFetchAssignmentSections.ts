import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useAssignmentSectionsStore } from '../../store/useSectionStore';
import { API_BASE, api, qf } from '@/src/lib/api';

interface SectionsList {
    section_id: string;
    section_name: string;
}

export const useFetchAssignmentSections = (assignment_id: string) => {
    const setAssignmentSections = useAssignmentSectionsStore((state) => state.setAssignmentSections);

    return useQuery<SectionsList[]>({
        queryKey: ['sections', assignment_id],
        queryFn: async () => {
            const response = await axios.get(`${API_BASE}/sections/assignment`, {
                params: { assignment_id: assignment_id },
            });

            setAssignmentSections(response.data.sections);
            return response.data.sections || [];
        },
        enabled: !!assignment_id,
        refetchOnWindowFocus: false,
    });
};
