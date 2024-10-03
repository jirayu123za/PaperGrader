import create from 'zustand';

interface InstructorList {
    instructor_id: string;
    instructor_name: string;
    CourseId: string;
}

interface InstructorListStore {
    instructorList: InstructorList[];
    setInstructorList: (instructorList: InstructorList[]) => void;
}

export const useInstructorListStore = create<InstructorListStore>((set) => ({
    instructorList: [],
    setInstructorList: (instructorList) => set({ instructorList }),
}));
