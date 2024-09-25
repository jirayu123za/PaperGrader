import { useQuery } from '@tanstack/react-query';
import { useCourseStore } from '../store/useCourseStore'; // Import Zustand store

// เปลี่ยนชื่อฟังก์ชันเป็น useFetchCourses เพื่อบ่งบอกว่าดึงข้อมูล courses ทั้งหมด
export const useFetchCourses = () => {
  const setCourses = useCourseStore((state) => state.setCourses); // กำหนดฟังก์ชัน setCourses จาก Zustand store

  return useQuery({
    queryKey: ['courses'], // ใช้ queryKey เป็น 'courses' เพื่อระบุการ query ข้อมูล courses ทั้งหมด
    queryFn: async () => {
      const response = await fetch('https://66f1054741537919154f2c12.mockapi.io/api/Course'); // ดึงข้อมูล courses ทั้งหมด
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setCourses(data); // เก็บข้อมูล courses ทั้งหมดใน Zustand store
      return data;
    }
  });
};
