import { useQuery } from '@tanstack/react-query';
import { API_BASE, api, qf } from '@/src/lib/api';
export const useFetchUniversity = () => {
    return useQuery({
        queryKey: ['university_name'],
        queryFn: async () => {
            const response = await fetch(`${API_BASE}/universities`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }
        });
};
