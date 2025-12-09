import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { API_BASE } from '@/src/lib/api';
import { useUniversityStore } from '@/store/useUniversityStore';

interface University {
    university_id: string;
    university_name: string;
}

export const useFetchUniversity = () => {
    const setUniversities = useUniversityStore((state) => state.setUniversities);

    return useQuery<University[], Error>({
        queryKey: ['universities'],
        queryFn: async () => {
            const response = await axios.get(`${API_BASE}/universities`);
            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }
            const data: University[] = response.data;
            setUniversities(data || []);
            return data || [];
        },
        enabled: true,
    });
};
