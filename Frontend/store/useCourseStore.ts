import create, { StateCreator } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import axios from 'axios';

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
  selectedCourseId: string | null;
  setSelectedCourseId: (courseId: string | null) => void;
}

// กำหนดประเภทของ PersistOptions
type MyPersist = (
  config: StateCreator<CourseStore>,
  options: PersistOptions<CourseStore>
) => StateCreator<CourseStore>;

// ใช้ with `persist` middleware
export const useCourseStore = create<CourseStore>(
  (persist as MyPersist)(
    (set) => ({
      courses: [], // state เก็บข้อมูลคอร์สทั้งหมด
      setCourses: (courses) => set({ courses }), // ฟังก์ชันสำหรับตั้งค่าคอร์ส
      selectedCourseId: null, // state เก็บ id ของคอร์สที่ถูกเลือก
      setSelectedCourseId: (courseId) => set({ selectedCourseId: courseId }), // ฟังก์ชันสำหรับตั้งค่า id ของคอร์สที่ถูกเลือก
    }),
    {
      name: 'course-storage', // ชื่อของ key ใน localStorage
    }
  )
);
