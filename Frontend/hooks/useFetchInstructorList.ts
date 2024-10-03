import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useInstructorListStore } from '../store/useInstructorListStore';


interface InstructorList {
    instructor_id: string;
    instructor_name: string;
    CourseId: string;
}

export const useFetchInstructorList = (courseId: string) => {
    const setInstructorList = useInstructorListStore((state) => state.setInstructorList);

    return useQuery<InstructorList[], Error>({
        queryKey: ['instructors', courseId],
        queryFn: async () => {
            //const response = await fetch(`https://66f1054741537919154f2c12.mockapi.io/api/Course/${courseId}/assignment`);
            const response = await axios.get(`/api/api/instructorsList`, {
                params: { course_id: courseId },
            });

            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }

            const data = response.data.instructors;
            setInstructorList(data);
            return data;
        },
    });
};
