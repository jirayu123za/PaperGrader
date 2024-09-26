// useCreateCourseStore.ts
import create from 'zustand';

// Interface สำหรับการสร้างคอร์ส
interface CreateCourseParams {
  courseNumber: string;
  courseName: string;
  courseDescription?: string;
  term: string;
  year: string;
  entryCode: boolean;
}

// Interface สำหรับ store ของการสร้างคอร์ส
interface CreateCourseStore extends CreateCourseParams {
  setCourseNumber: (courseNumber: string) => void;
  setCourseName: (courseName: string) => void;
  setCourseDescription: (courseDescription: string) => void;
  setTerm: (term: string) => void;
  setYear: (year: string) => void;
  setEntryCode: (entryCode: boolean) => void;
  resetForm: () => void; // เพิ่มฟังก์ชันสำหรับ reset ฟอร์ม
}

export const useCreateCourseStore = create<CreateCourseStore>((set) => ({
  courseNumber: '',
  courseName: '',
  courseDescription: '',
  term: '',
  year: '',
  entryCode: false,
  setCourseNumber: (courseNumber) => set({ courseNumber }),
  setCourseName: (courseName) => set({ courseName }),
  setCourseDescription: (courseDescription) => set({ courseDescription }),
  setTerm: (term) => set({ term }),
  setYear: (year) => set({ year }),
  setEntryCode: (entryCode) => set({ entryCode }),
  resetForm: () => set({
    courseNumber: '',
    courseName: '',
    courseDescription: '',
    term: '',
    year: '',
    entryCode: false,
  }), // ฟังก์ชันสำหรับ reset ฟอร์ม
}));
