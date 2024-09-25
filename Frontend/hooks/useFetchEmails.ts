import { useQuery } from '@tanstack/react-query';

// Custom Hook สำหรับดึงข้อมูล email โดยใช้ React Query
export const useFetchEmails = () => {
  return useQuery({
    queryKey: ['emails'], // ใช้ queryKey แทน string ตรงๆ
    queryFn: async () => {
      const response = await fetch('https://66eadcf555ad32cda47abf43.mockapi.io/email');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }
  });
};
