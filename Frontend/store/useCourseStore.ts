import create, { StateCreator } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';

// สร้าง interface ของ course ให้รองรับข้อมูลที่ดึงมา
interface Course {
  course_id: string;
  course_description: string;
  course_name: string;
  course_code: string;
  semester: string;
  academic_year: string;
  entry_code: boolean;
}

interface CourseStore {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  selectedCourseId: string | null;
  setSelectedCourseId: (course_id: string | null) => void;
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
      courses: [],
      setCourses: (courses) => set({ courses }),
      selectedCourseId: null,
      setSelectedCourseId: (course_id) => set({ selectedCourseId: course_id }),
    }),
    {
      name: 'course-storage',
    }
  )
);
