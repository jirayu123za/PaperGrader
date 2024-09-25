import { useQuery } from '@tanstack/react-query';

// Custom Hook สำหรับดึงข้อมูล school
export const useFetchSchools = () => {
    return useQuery({
        queryKey: ['schools'], // ใช้ queryKey แทน string ตรงๆ
        queryFn: async () => {
            const response = await fetch('https://66eadcf555ad32cda47abf43.mockapi.io/school');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }
        });
};
