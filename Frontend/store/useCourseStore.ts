import create from 'zustand';
import { persist } from 'zustand/middleware';

// สร้าง interface ของ course ให้รองรับข้อมูลที่ดึงมา
interface Course {
  course_Id: string;
  course_name: string;
  course_code: string;
  semester: number;
}

interface CourseStore {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  selectedCourseId: string | null; // เก็บค่า course_Id ที่ถูกเลือก
  setSelectedCourseId: (courseId: string) => void; // ฟังก์ชันสำหรับตั้งค่า course_Id ที่ถูกเลือก
}

// ใช้ persist middleware ในการเก็บ state ลงใน localStorage
export const useCourseStore = create<CourseStore>(
  persist(
    (set) => ({
      courses: [],
      setCourses: (courses) => set({ courses }),
      selectedCourseId: null, // กำหนดค่าเริ่มต้นเป็น null
      setSelectedCourseId: (courseId) => set({ selectedCourseId: courseId }),
    }),
    {
      name: 'course-storage', // ชื่อของ key ใน localStorage
    }
  )
);
