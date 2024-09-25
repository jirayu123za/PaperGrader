import { useQuery } from '@tanstack/react-query';

export const useFetchUniversity = () => {
    return useQuery({
        queryKey: ['university_name'],
        queryFn: async () => {
            const response = await fetch('api/api/universities');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }
        });
};
