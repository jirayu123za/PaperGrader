import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useFetchSections = () => {
  return useQuery({
    queryKey: ['sections'],
    queryFn: async () => {
      const response = await axios.get('/api/sections');
      return response.data.sections; // ดึง sections จาก JSON
    },
    initialData: [
      { section_id: '1', section_name: 'Section A' },
      { section_id: '2', section_name: 'Section B' },
      { section_id: '3', section_name: 'Section C' },
    ],
    staleTime: 1000 * 60 * 5, 
  });
};
