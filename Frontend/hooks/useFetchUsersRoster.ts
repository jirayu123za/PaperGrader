import { useQuery } from '@tanstack/react-query';
import { useRosterStore } from '../store/useRosterStore';
import axios from 'axios';

interface UsersList {
    user_id: string;
    full_name: string;
    email: string;
    user_group_name: string;
    submissions_count: number;
}

export const useFetchUsersRoster = (course_id: string) => {
    const setUsersList = useRosterStore((state: { setUsersList: (users: UsersList[]) => void }) => state.setUsersList);

    return useQuery<UsersList[], Error>({
        queryKey: ['roster', course_id],
        queryFn: async () => {
            const response = await axios.get(`/api/api/instructors/roster`, {
                params: { course_id: course_id },
            });

            console.log('API Response:', response);

            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }

            const data = response.data.roster;
            setUsersList(data);
            return data;
        },
    });
}