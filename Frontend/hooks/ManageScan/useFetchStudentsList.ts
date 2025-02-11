import { useQuery } from "@tanstack/react-query";
import { useStudentsListStore } from "../../store/ManageScan/useStudentsListStore";
import axios from "axios";

interface StudentsList {
    personal_data_id: string;
    full_name: string;
    email: string;
    student_code: string;
    has_submission: boolean;
}

export const useFetchStudentsList = (course_id: string, assignment_id: string) => {
    const setStudentsList = useStudentsListStore((state) => state.setStudentsList);

    return useQuery<StudentsList[], Error>({
        queryKey: ['students', course_id, assignment_id],
        queryFn: async () => {
            const response = await axios.get('/api/api/instructor/submission/studentList', {
                params: { course_id: course_id, assignment_id: assignment_id },
            });

            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }

            const data = response.data.students;
            setStudentsList(data || []);
            return data || [];
        },
        enabled: !!course_id && !!assignment_id,
    });
};