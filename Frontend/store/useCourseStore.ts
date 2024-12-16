import { create } from 'zustand';

interface Course {
  course_id: string;
  course_description: string;
  course_name: string;
  course_code: string;
  semester: string;
  academic_year: string;
  entry_code: boolean;
  total_assignments: string;
}

interface CourseStore {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  selectedCourseId: string | null;
  setSelectedCourseId: (course_id: string | null) => void;
}

export const useCourseStore = create<CourseStore>((set) => ({
  courses: [],
  setCourses: (courses) => set({ courses }),
  selectedCourseId: null,
  setSelectedCourseId: (course_id) => set({ selectedCourseId: course_id }),
}));

interface StdCourseDashboardStore {
  course: Course | null;
  setCourse: (course: Course) => void;
}

export const useStdCourseDashboardStore = create<StdCourseDashboardStore>((set) => ({
  course: null,
  setCourse: (course) => set({ course }),
}));

interface InsCourseStore {
  course: Course | null;
  setCourses: (courses: Course) => void;
}

export const useInsCourseStore = create<InsCourseStore>((set) => ({
  course: null,
  setCourses: (course) => set({ course }),
}));
