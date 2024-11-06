// import { useQuery } from '@tanstack/react-query';
// import axios from 'axios';

// export const useFetchSections = () => {
//   return useQuery({
//     queryKey: ['sections'],
//     queryFn: async () => {
//       const response = await axios.get('/api/sections'); 
//       return response.data || []; 
//     },
//   });
// };


import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useFetchSections = () => {
  return useQuery({
    queryKey: ['sections'],
    queryFn: async () => {
      // Mock data สำหรับทดสอบ
      const mockData = [
        { id: '1', name: 'UX 101 Monday A', studentCount: 30 },
        { id: '2', name: 'UX 101 Monday B', studentCount: 22 },
        { id: '3', name: 'UX 101 Tuesday A', studentCount: 30 },
      ];

      // ใช้ข้อมูล mock แทนการเรียก API จริง
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockData), 1000); // ตั้งเวลา delay เพื่อจำลองการโหลดข้อมูล
      });
    },
  });
};
