import { useQuery } from '@tanstack/react-query';
import { useRosterStore } from '../../store/useRosterStore';
import axios from 'axios';

interface UsersList {
    personal_data_id: string;
    full_name: string;
    email: string;
    role_type: string;
    student_code: string;
    section_name: string;
    submissions_count: number;
}

export const useFetchUsersRoster = (course_id: string) => {
    const setUsersList = useRosterStore((state) => state.setUsersList);

    return useQuery<UsersList[], Error>({
        queryKey: ['roster', course_id],
        queryFn: async () => {
            const response = await axios.get(`/api/api/instructors/roster`, {
                params: { course_id: course_id },
            });

            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }

            const data = response.data.roster;
            setUsersList(data);
            return data;
        },
        enabled: !!course_id,
    });
};

export const useFetchSectionUsersRoster = (course_id: string, section_id: string) => {
    const setSectionUsersList = useRosterStore((state) => state.setSectionUsersList);

    return useQuery<UsersList[], Error>({
        queryKey: ['sectionRoster', course_id, section_id],
        queryFn: async () => {
            const response = await axios.get(`/api/api/instructor/roster/section/user`, {
                params: {
                    course_id: course_id,
                    section_id: section_id,
                },
            });

            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }

            const data = response.data.roster;

            setSectionUsersList(data);
            return data;
        },
        enabled: !!course_id && !!section_id,
    });
};

