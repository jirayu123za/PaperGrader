import create from 'zustand';

// Interface สำหรับการสร้างคอร์ส
interface CreateCourseParams {
  course_name: string;
  course_description?: string;
  course_code: string;
  semester: string;
  academic_year: string;
  entry_code: boolean;
}

// Interface สำหรับ store ของการสร้างคอร์ส
interface CreateCourseStore extends CreateCourseParams {
  setCourseNumber: (course_code: string) => void;
  setCourseName: (course_name: string) => void;
  setCourseDescription: (course_description: string) => void;
  setSemester: (semester: string) => void;
  setAcademicYear: (academic_year: string) => void;
  setEntryCode: (entry_code: boolean) => void;
  resetForm: () => void;
}

export const useCreateCourseStore = create<CreateCourseStore>((set) => ({
  course_code: '',
  course_name: '',
  course_description: '',
  semester: '',
  academic_year: '',
  entry_code: false,
  setCourseNumber: (course_code) => set({ course_code }),
  setCourseName: (course_name) => set({ course_name }),
  setCourseDescription: (course_description) => set({ course_description }),
  setSemester: (semester) => set({ semester }),
  setAcademicYear: (academic_year) => set({ academic_year }),
  setEntryCode: (entry_code) => set({ entry_code }),
  resetForm: () => set({
    course_code: '',
    course_name: '',
    course_description: '',
    semester: '',
    academic_year: '',
    entry_code: false,
  }),
}));
