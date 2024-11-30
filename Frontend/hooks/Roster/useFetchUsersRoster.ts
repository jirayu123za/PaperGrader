import { useQuery } from '@tanstack/react-query';
import { useRosterStore } from '../../store/useRosterStore';
import axios from 'axios';

// Interface สำหรับข้อมูล Users
interface UsersList {
    personal_data_id: string;
    full_name: string;
    email: string;
    role_type: string;
    student_code: string;
    section_name: string;
    submissions_count: number;
}

// ฟังก์ชันเดิม: ใช้ดึงข้อมูล Users ทั้งหมดใน Roster
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

// ฟังก์ชันใหม่: ใช้ดึงข้อมูลนักเรียนใน Section เฉพาะ
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

            const data = response.data.roster.map((user: any) => ({
                personal_data_id: user.personal_data_id,
                full_name: user.full_name,
                email: user.email,
                submissions_count: user.submissions_count,
            }));

            setSectionUsersList(data); // บันทึกข้อมูลใน Zustand Store
            return data;
        },
        enabled: !!course_id && !!section_id, // ดึงข้อมูลเฉพาะเมื่อ course_id และ section_id มีค่า
    });
};

