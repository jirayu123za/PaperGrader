import create from 'zustand';

interface InstructorList {
    personalData_id: string;
    instructor_name: string;
    CourseId: string;
}

interface InstructorListStore {
    instructorList: InstructorList[];
    setInstructorList: (instructorList: InstructorList[]) => void;
    addInstructor: (instructor: InstructorList) => void;
}

export const useInstructorListStore = create<InstructorListStore>((set) => ({
    instructorList: [],
    setInstructorList: (instructorList) => set({ instructorList }),
    addInstructor: (instructor) =>
      set((state) => ({
        instructorList: [...state.instructorList, instructor],
      })),
  }));
